/* ============================================================================
   NHOOF — fundo animado da Home
   Partículas que andam sozinhas pela tela, desenhadas num <canvas>, sem
   bibliotecas; linhas ligam as partículas próximas. O movimento é calculado
   pelo tempo decorrido (não por quadro), então a velocidade é a mesma e
   suave em monitores de 60, 144 ou 240 Hz.

   Desempenho:
   - As linhas são agrupadas por intensidade e cada grupo é desenhado de uma
     vez só (poucas instruções por quadro, em vez de uma por linha).
   - Qualidade adaptativa: o script mede a duração dos quadros; se o PC não
     estiver acompanhando, tira partículas aos poucos (uma por quadro, sem
     salto visível) até a animação ficar fluida. PCs bons não perdem nada.

   A grade e o brilho são animados por CSS (css/home.css).
   Respeita a configuração da pessoa: com "reduzir movimento" ligado (no
   Windows, "Animar controles e elementos dentro das janelas" desligado), as
   partículas ficam paradas. Se a configuração mudar com a página aberta, a
   animação liga ou desliga na hora.
   ============================================================================ */
(function () {
    'use strict';

    var canvas = document.querySelector('.hero-canvas');
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var preferencia = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    function reduzir() { return !!(preferencia && preferencia.matches); }

    var VELOCIDADE = 28;    // pixels por segundo (no máximo, em cada eixo)
    var DISTANCIA = 140;    // distância máxima para ligar duas partículas
    var DISTANCIA2 = DISTANCIA * DISTANCIA;
    var MAXIMO = 120;       // partículas em tela grande, qualidade máxima

    // Grupos de intensidade das linhas (quanto mais perto, mais forte)
    var FAIXAS = 6;
    var CORES_LINHA = [];
    for (var f = 0; f < FAIXAS; f++) {
        CORES_LINHA.push('rgba(160,172,255,' + (0.14 * (f + 0.5) / FAIXAS).toFixed(4) + ')');
    }
    // Três tamanhos de partícula, cada um com seu brilho
    var CORES_PONTO = ['rgba(255,255,255,0.47)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.72)'];

    // ---- Qualidade adaptativa --------------------------------------------------
    var NIVEIS = [1, 0.7, 0.5, 0.35]; // fração das partículas em cada nível
    var LIMITE_MS = 22;               // quadro médio acima disso (~45 quadros/s) = PC não acompanha
    var TROPECO_MS = 28;              // quadro "travado"
    var LIMITE_TROPECOS = 0.3;        // mais de 30% de quadros travados = PC não acompanha
    var AQUECIMENTO = 30;             // quadros ignorados após abrir/voltar à aba ou mudar de nível
    var JANELA = 60;                  // quadros usados em cada medição
    var nivel = 0;
    var contagem = 0, somaMs = 0, tropecos = 0, ignorar = AQUECIMENTO;

    var dprMaximo = Math.min(window.devicePixelRatio || 1, 2);
    var dpr = dprMaximo;
    var pontos = [];
    var alvo = 0;           // quantas partículas devem existir no nível atual
    var largura = 0, altura = 0;
    var rodando = false;
    var anterior = 0;

    function novaParticula() {
        return {
            x: Math.random() * largura,
            y: Math.random() * altura,
            vx: (Math.random() - 0.5) * 2 * VELOCIDADE,
            vy: (Math.random() - 0.5) * 2 * VELOCIDADE,
            t: Math.floor(Math.random() * 3) // tamanho: 0, 1 ou 2
        };
    }

    function ajustarCanvas() {
        var r = canvas.getBoundingClientRect();
        largura = r.width;
        altura = r.height;
        canvas.width = Math.round(largura * dpr);
        canvas.height = Math.round(altura * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function quantidadeBase() {
        return Math.round(Math.min(MAXIMO, (largura * altura) / 13000));
    }

    function montar() {
        ajustarCanvas();
        alvo = Math.round(quantidadeBase() * NIVEIS[nivel]);
        pontos = [];
        for (var i = 0; i < alvo; i++) pontos.push(novaParticula());
        canvas.setAttribute('data-qualidade', nivel);
    }

    // dt = segundos desde o quadro anterior
    function mover(dt) {
        for (var i = 0; i < pontos.length; i++) {
            var p = pontos[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.x < -10) p.x = largura + 10; else if (p.x > largura + 10) p.x = -10;
            if (p.y < -10) p.y = altura + 10; else if (p.y > altura + 10) p.y = -10;
        }
    }

    // As linhas de cada faixa de intensidade vão para um único caminho
    var faixas = [];
    for (var k = 0; k < FAIXAS; k++) faixas.push([]);

    function desenhar() {
        var i, j, p, q, dx, dy, d2, n = pontos.length;
        for (i = 0; i < FAIXAS; i++) faixas[i].length = 0;

        for (i = 0; i < n; i++) {
            p = pontos[i];
            for (j = i + 1; j < n; j++) {
                q = pontos[j];
                dx = p.x - q.x;
                if (dx > DISTANCIA || dx < -DISTANCIA) continue;
                dy = p.y - q.y;
                if (dy > DISTANCIA || dy < -DISTANCIA) continue;
                d2 = dx * dx + dy * dy;
                if (d2 < DISTANCIA2) {
                    var faixa = Math.floor((1 - Math.sqrt(d2) / DISTANCIA) * FAIXAS);
                    if (faixa >= FAIXAS) faixa = FAIXAS - 1;
                    faixas[faixa].push(p.x, p.y, q.x, q.y);
                }
            }
        }

        ctx.clearRect(0, 0, largura, altura);
        ctx.lineWidth = 1;
        for (i = 0; i < FAIXAS; i++) {
            var l = faixas[i];
            if (!l.length) continue;
            ctx.strokeStyle = CORES_LINHA[i];
            ctx.beginPath();
            for (j = 0; j < l.length; j += 4) {
                ctx.moveTo(l[j], l[j + 1]);
                ctx.lineTo(l[j + 2], l[j + 3]);
            }
            ctx.stroke();
        }

        for (var t = 0; t < 3; t++) {
            var raio = 0.6 + t * 0.5;
            ctx.fillStyle = CORES_PONTO[t];
            ctx.beginPath();
            for (i = 0; i < n; i++) {
                p = pontos[i];
                if (p.t !== t) continue;
                ctx.moveTo(p.x + raio, p.y);
                ctx.arc(p.x, p.y, raio, 0, Math.PI * 2);
            }
            ctx.fill();
        }
    }

    // Mede os quadros e reduz a qualidade se o PC não estiver acompanhando
    function avaliar(msQuadro) {
        if (nivel >= NIVEIS.length - 1) return;
        if (ignorar > 0) { ignorar--; return; }
        somaMs += msQuadro;
        if (msQuadro > TROPECO_MS) tropecos++;
        if (++contagem < JANELA) return;
        var media = somaMs / contagem;
        var fracaoTropecos = tropecos / contagem;
        contagem = 0;
        somaMs = 0;
        tropecos = 0;
        if (media <= LIMITE_MS && fracaoTropecos <= LIMITE_TROPECOS) return;

        nivel++;
        alvo = Math.round(quantidadeBase() * NIVEIS[nivel]);
        canvas.setAttribute('data-qualidade', nivel);
        // a partir do nível 2, telas de alta densidade passam a desenhar em 1x
        if (nivel >= 2 && dpr > 1) {
            dpr = 1;
            ajustarCanvas();
        }
        ignorar = AQUECIMENTO;
    }

    function quadro(agora) {
        if (!rodando) return;
        var ms = agora - anterior;
        anterior = agora;
        avaliar(ms);
        // tira no máximo uma partícula por quadro: some aos poucos, sem salto
        if (pontos.length > alvo) pontos.pop();
        // limita o salto a 50 ms (ex.: depois de a aba ficar em segundo plano)
        mover(Math.min(ms, 50) / 1000);
        desenhar();
        requestAnimationFrame(quadro);
    }

    function iniciar() {
        if (rodando || reduzir() || document.hidden) return;
        rodando = true;
        anterior = performance.now();
        ignorar = AQUECIMENTO;
        contagem = 0;
        somaMs = 0;
        tropecos = 0;
        requestAnimationFrame(quadro);
    }

    function parar() {
        rodando = false;
    }

    montar();
    desenhar();
    iniciar();

    var aguardando;
    window.addEventListener('resize', function () {
        clearTimeout(aguardando);
        aguardando = setTimeout(function () {
            montar();
            desenhar();
        }, 150);
    });

    // Pausa quando a aba fica em segundo plano (economiza CPU e bateria)
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) parar(); else iniciar();
    });

    // Liga/desliga na hora se a pessoa mudar a configuração de animações
    if (preferencia) {
        var aoMudar = function () {
            if (reduzir()) parar(); else iniciar();
        };
        if (preferencia.addEventListener) preferencia.addEventListener('change', aoMudar);
        else if (preferencia.addListener) preferencia.addListener(aoMudar);
    }
})();
