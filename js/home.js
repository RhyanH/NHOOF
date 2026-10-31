/* ============================================================================
   NHOOF — fundo animado da Home
   Partículas conectadas desenhadas num <canvas>, sem bibliotecas.
   As linhas se ligam às partículas próximas e ao ponteiro do mouse.
   A grade e o brilho são animados por CSS (css/home.css).
   ============================================================================ */
(function () {
    'use strict';

    var canvas = document.querySelector('.hero-canvas');
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var reduzir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var palco = canvas.parentElement;

    var VELOCIDADE = 0.5;   // pixels por quadro (no máximo, em cada eixo)
    var DISTANCIA = 140;    // distância máxima para ligar duas partículas
    var ALCANCE_MOUSE = 180;

    var pontos = [];
    var mouse = { x: -9999, y: -9999 };
    var largura = 0, altura = 0;
    var rodando = false;

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

    function desenhar() {
        ctx.clearRect(0, 0, largura, altura);
        for (var i = 0; i < pontos.length; i++) {
            var p = pontos[i];
            if (!reduzir) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < -10) p.x = largura + 10; else if (p.x > largura + 10) p.x = -10;
                if (p.y < -10) p.y = altura + 10; else if (p.y > altura + 10) p.y = -10;
            }
            for (var j = i + 1; j < pontos.length; j++) {
                var q = pontos[j];
                var dx = p.x - q.x, dy = p.y - q.y;
                var d2 = dx * dx + dy * dy;
                if (d2 < DISTANCIA * DISTANCIA) {
                    ctx.strokeStyle = 'rgba(160,172,255,' + (0.14 * (1 - Math.sqrt(d2) / DISTANCIA)) + ')';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.stroke();
                }
            }
            var mx = p.x - mouse.x, my = p.y - mouse.y;
            var md = Math.sqrt(mx * mx + my * my);
            if (md < ALCANCE_MOUSE) {
                ctx.strokeStyle = 'rgba(139,156,255,' + (0.45 * (1 - md / ALCANCE_MOUSE)) + ')';
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
            ctx.fillStyle = 'rgba(255,255,255,' + (0.35 + p.r * 0.2) + ')';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function quadro() {
        if (!rodando) return;
        desenhar();
        requestAnimationFrame(quadro);
    }

    function iniciar() {
        if (rodando || reduzir) return;
        rodando = true;
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

    palco.addEventListener('pointermove', function (e) {
        var r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
        if (reduzir) desenhar();
    });
    palco.addEventListener('pointerleave', function () {
        mouse.x = mouse.y = -9999;
        if (reduzir) desenhar();
    });

    // Pausa quando a aba fica em segundo plano (economiza CPU e bateria)
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) parar(); else iniciar();
    });
})();
