/* ============================================================================
   NHOOF — fundo animado da Home (cara de espaço)
   - Céu de estrelas: pontinhos bem fracos desenhados uma vez e usados como
     imagem de fundo do palco; alguns deles piscam devagar.
   - Partículas que andam sozinhas, com profundidade: as maiores parecem
     mais perto e andam mais rápido; linhas ligam as partículas próximas.
   Tudo em <canvas>, sem bibliotecas. O movimento é calculado
   pelo tempo decorrido (não por quadro), então a velocidade é a mesma e
   suave em monitores de 60, 144 ou 240 Hz.

   Desempenho:
   - As linhas são agrupadas por intensidade e cada grupo é desenhado de uma
     vez só (poucas instruções por quadro, em vez de uma por linha).
   - Qualidade adaptativa: o script mede a duração dos quadros; se o PC não
     estiver acompanhando, tira partículas aos poucos (uma por quadro, sem
     salto visível) até a animação ficar fluida. PCs bons não perdem nada.

   O brilho atrás do NHOOF é animado por CSS (css/home.css).
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
    var palco = canvas.parentNode;
    var ceu = document.createElement('canvas');
    var ctxCeu = ceu.getContext('2d');
    var urlCeu = null;
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
    // Profundidade: as partículas pequenas (longe) andam mais devagar
    var RITMO = [0.5, 0.8, 1.2];

    // ---- Céu de estrelas -------------------------------------------------------
    var AREA_ESTRELA = 2600;  // uma estrela a cada tantos px² de tela
    var MAX_ESTRELAS = 800;
    var FRACAO_PISCAM = 0.12; // parte das estrelas que pisca
    var NIVEIS_BRILHO = 5;    // estrelas que piscam são agrupadas por brilho
    var piscam = [];
    var grupos = [];
    for (var g = 0; g < NIVEIS_BRILHO; g++) grupos.push([]);

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
            t: Math.floor(Math.random() * 3) // tamanho: 0, 1 ou 2 (longe → perto)
        };
    }

    // Desenha as estrelas paradas uma vez só; guarda as que piscam
    function montarCeu() {
        piscam = [];
        if (!ctxCeu || !largura || !altura) return;
        var d = dprMaximo;
        ceu.width = Math.round(largura * d);
        ceu.height = Math.round(altura * d);
        ctxCeu.setTransform(d, 0, 0, d, 0, 0);
        ctxCeu.clearRect(0, 0, largura, altura);
        var total = Math.round(Math.min(MAX_ESTRELAS, (largura * altura) / AREA_ESTRELA));
        for (var i = 0; i < total; i++) {
            var e = {
                x: Math.random() * largura,
                y: Math.random() * altura,
                r: 0.35 + Math.random() * 0.55,
                a: 0.12 + Math.random() * 0.4,
                fase: Math.random() * Math.PI * 2,
                ritmo: 0.6 + Math.random() * 1.4 // velocidade da piscada
            };
            if (Math.random() < FRACAO_PISCAM) {
                piscam.push(e);
            } else {
                ctxCeu.fillStyle = 'rgba(220,226,255,' + e.a.toFixed(3) + ')';
                ctxCeu.beginPath();
                ctxCeu.arc(e.x, e.y, e.r, 0, Math.PI * 2);
                ctxCeu.fill();
            }
        }
        // vira imagem de fundo do palco
        if (ceu.toBlob && window.URL) {
            ceu.toBlob(function (blob) {
                if (!blob) return;
                if (urlCeu) URL.revokeObjectURL(urlCeu);
                urlCeu = URL.createObjectURL(blob);
                palco.style.backgroundImage = 'url(' + urlCeu + ')';
            });
        } else {
            palco.style.backgroundImage = 'url(' + ceu.toDataURL() + ')';
        }
    }

    // Estrelas que piscam: o brilho varia devagar (agrupado em poucos níveis)
    function desenharPiscando(segundos) {
        var i, e, n;
        for (i = 0; i < NIVEIS_BRILHO; i++) grupos[i].length = 0;
        for (i = 0; i < piscam.length; i++) {
            e = piscam[i];
            var luz = 0.5 + 0.5 * Math.sin(segundos * e.ritmo + e.fase); // 0..1
            n = Math.min(NIVEIS_BRILHO - 1, Math.floor(luz * NIVEIS_BRILHO));
            grupos[n].push(e);
        }
        for (n = 0; n < NIVEIS_BRILHO; n++) {
            var lista = grupos[n];
            if (!lista.length) continue;
            ctx.fillStyle = 'rgba(220,226,255,' + (0.1 + 0.6 * (n + 0.5) / NIVEIS_BRILHO).toFixed(3) + ')';
            ctx.beginPath();
            for (i = 0; i < lista.length; i++) {
                e = lista[i];
                ctx.moveTo(e.x + e.r + 0.3, e.y);
                ctx.arc(e.x, e.y, e.r + 0.3, 0, Math.PI * 2);
            }
            ctx.fill();
        }
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
        montarCeu();
        alvo = Math.round(quantidadeBase() * NIVEIS[nivel]);
        pontos = [];
        for (var i = 0; i < alvo; i++) pontos.push(novaParticula());
        canvas.setAttribute('data-qualidade', nivel);
    }

    // dt = segundos desde o quadro anterior
    function mover(dt) {
        for (var i = 0; i < pontos.length; i++) {
            var p = pontos[i];
            var k = RITMO[p.t] * dt;
            p.x += p.vx * k;
            p.y += p.vy * k;
            if (p.x < -10) p.x = largura + 10; else if (p.x > largura + 10) p.x = -10;
            if (p.y < -10) p.y = altura + 10; else if (p.y > altura + 10) p.y = -10;
        }
    }

    // As linhas de cada faixa de intensidade vão para um único caminho
    var faixas = [];
    for (var k = 0; k < FAIXAS; k++) faixas.push([]);

    function desenhar(agora) {
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
        desenharPiscando((agora || 0) / 1000);
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
        desenhar(agora);
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
