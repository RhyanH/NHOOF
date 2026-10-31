/* ============================================================================
   NHOOF — efeitos da Home
   1. Números de guias/categorias lidos de js/sidebar.js (window.NHOOF_MENUS)
   2. Fundo animado de partículas conectadas (canvas, sem bibliotecas)
   3. Luz que segue o mouse nos cartões
   4. Revelação suave das seções ao rolar
   ============================================================================ */
(function () {
    'use strict';

    var reduzir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- 1. Números ------------------------------------------------------------
    var menu = window.NHOOF_MENUS && window.NHOOF_MENUS.otimizacao;
    if (menu) {
        var total = 0;
        menu.forEach(function (cat) {
            cat.canais.forEach(function (c) { if (c[0] !== 'index.html') total++; });
        });
        document.querySelectorAll('[data-total-guias]').forEach(function (el) { el.textContent = total; });
        document.querySelectorAll('[data-total-categorias]').forEach(function (el) { el.textContent = menu.length; });
        document.querySelectorAll('[data-categoria]').forEach(function (card) {
            var cat = menu.filter(function (c) { return c.titulo === card.getAttribute('data-categoria'); })[0];
            var alvo = card.querySelector('[data-qtd]');
            if (cat && alvo) alvo.textContent = cat.canais.length;
        });
    }
    document.querySelectorAll('[data-ano]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    // ---- 2. Partículas -----------------------------------------------------------
    var canvas = document.querySelector('.hero-canvas');
    if (canvas && canvas.getContext) {
        var ctx = canvas.getContext('2d');
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var pontos = [];
        var mouse = { x: -9999, y: -9999 };
        var largura = 0, altura = 0, ativo = true;
        var DIST = 140;

        function montar() {
            var r = canvas.getBoundingClientRect();
            largura = r.width;
            altura = r.height;
            canvas.width = Math.round(largura * dpr);
            canvas.height = Math.round(altura * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            var qtd = Math.round(Math.min(110, (largura * altura) / 14000));
            pontos = [];
            for (var i = 0; i < qtd; i++) {
                pontos.push({
                    x: Math.random() * largura,
                    y: Math.random() * altura,
                    vx: (Math.random() - 0.5) * 0.25,
                    vy: (Math.random() - 0.5) * 0.25,
                    r: Math.random() * 1.3 + 0.4
                });
            }
        }

        function quadro() {
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
                    if (d2 < DIST * DIST) {
                        ctx.strokeStyle = 'rgba(160,172,255,' + (0.14 * (1 - Math.sqrt(d2) / DIST)) + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.stroke();
                    }
                }
                var mx = p.x - mouse.x, my = p.y - mouse.y;
                var md = Math.sqrt(mx * mx + my * my);
                if (md < 180) {
                    ctx.strokeStyle = 'rgba(139,156,255,' + (0.45 * (1 - md / 180)) + ')';
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
            if (ativo && !reduzir) requestAnimationFrame(quadro);
        }

        montar();
        quadro();

        var redimensionar;
        window.addEventListener('resize', function () {
            clearTimeout(redimensionar);
            redimensionar = setTimeout(function () { montar(); if (reduzir) quadro(); }, 150);
        });

        var hero = canvas.parentElement;
        hero.addEventListener('pointermove', function (e) {
            var r = canvas.getBoundingClientRect();
            mouse.x = e.clientX - r.left;
            mouse.y = e.clientY - r.top;
        });
        hero.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });

        // Pausa a animação quando o hero sai da tela (economiza CPU/bateria)
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entradas) {
                var visivel = entradas[0].isIntersecting;
                if (visivel && !ativo) { ativo = true; if (!reduzir) requestAnimationFrame(quadro); }
                ativo = visivel;
            }).observe(hero);
        }
    }

    // ---- 3. Luz que segue o mouse --------------------------------------------
    document.querySelectorAll('.card, .projeto').forEach(function (el) {
        el.addEventListener('pointermove', function (e) {
            var r = el.getBoundingClientRect();
            el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            el.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });
    });

    // ---- 4. Revelação ao rolar ---------------------------------------------------
    if (!reduzir && 'IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (en) {
                if (en.isIntersecting) {
                    var alvo = en.target;
                    alvo.classList.add('visivel');
                    obs.unobserve(alvo);
                    // depois de aparecer, devolve as transições normais de hover
                    setTimeout(function () {
                        alvo.classList.remove('revelar', 'visivel');
                        alvo.style.transitionDelay = '';
                    }, 1100);
                }
            });
        }, { rootMargin: '0px 0px -60px 0px' });

        document.querySelectorAll('.secao-topo, .card, .setup-faixa, .projeto').forEach(function (el, i) {
            el.classList.add('revelar');
            if (el.classList.contains('card')) el.style.transitionDelay = (i % 7) * 50 + 'ms';
            obs.observe(el);
        });
    }
})();
