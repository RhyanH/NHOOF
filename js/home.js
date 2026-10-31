/* ============================================================================
   NHOOF — fundo animado da Home
   Partículas que andam sozinhas pela tela, desenhadas num <canvas>, sem
   bibliotecas; linhas ligam as partículas próximas. O movimento é calculado
   pelo tempo decorrido (não por quadro), então a velocidade é a mesma e
   suave em monitores de 60, 144 ou 240 Hz.
   A grade e o brilho são animados por CSS (css/home.css).
   O fundo anima mesmo com "reduzir movimento" ligado no sistema: no Windows
   esse aviso vem de um ajuste de desempenho (guia Efeitos Visuais).
   ============================================================================ */
(function () {
    'use strict';

    var canvas = document.querySelector('.hero-canvas');
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    var VELOCIDADE = 28;    // pixels por segundo (no máximo, em cada eixo)
    var DISTANCIA = 140;    // distância máxima para ligar duas partículas

    var pontos = [];
    var largura = 0, altura = 0;
    var rodando = false;
    var anterior = 0;

    function montar() {
        var r = canvas.getBoundingClientRect();
        largura = r.width;
        altura = r.height;
        canvas.width = Math.round(largura * dpr);
        canvas.height = Math.round(altura * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var qtd = Math.round(Math.min(120, (largura * altura) / 13000));
        pontos = [];
        for (var i = 0; i < qtd; i++) {
            pontos.push({
                x: Math.random() * largura,
                y: Math.random() * altura,
                vx: (Math.random() - 0.5) * 2 * VELOCIDADE,
                vy: (Math.random() - 0.5) * 2 * VELOCIDADE,
                r: Math.random() * 1.3 + 0.4
            });
        }
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

    function desenhar() {
        ctx.clearRect(0, 0, largura, altura);
        ctx.lineWidth = 1;
        for (var i = 0; i < pontos.length; i++) {
            var p = pontos[i];
            for (var j = i + 1; j < pontos.length; j++) {
                var q = pontos[j];
                var dx = p.x - q.x, dy = p.y - q.y;
                var d2 = dx * dx + dy * dy;
                if (d2 < DISTANCIA * DISTANCIA) {
                    ctx.strokeStyle = 'rgba(160,172,255,' + (0.14 * (1 - Math.sqrt(d2) / DISTANCIA)) + ')';
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.stroke();
                }
            }
            ctx.fillStyle = 'rgba(255,255,255,' + (0.35 + p.r * 0.2) + ')';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function quadro(agora) {
        if (!rodando) return;
        // limita o salto a 50 ms (ex.: depois de a aba ficar em segundo plano)
        var dt = Math.min(agora - anterior, 50) / 1000;
        anterior = agora;
        mover(dt);
        desenhar();
        requestAnimationFrame(quadro);
    }

    function iniciar() {
        if (rodando) return;
        rodando = true;
        anterior = performance.now();
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
})();
