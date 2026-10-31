/* ============================================================================
   Menu do topo no celular (e em telas estreitas, onde ele rola de lado).

   Sem isto, cada página nova abriria o menu do começo, e um item do fim
   (como "Sobre") sumiria da tela logo depois do toque. Aqui o menu:
     1. volta à posição em que a pessoa o deixou (guardada só nesta aba);
     2. se o item da página atual ficar fora da tela, rola até ele.
   Roda logo depois do <header>, antes de a página aparecer: o menu não pula.
   Em telas grandes o menu não rola e nada muda.
   ============================================================================ */
(function () {
    'use strict';

    var nav = document.querySelector('header nav');
    if (!nav) return;
    var CHAVE = 'nhoofMenuTopo';

    function guardar() {
        try { sessionStorage.setItem(CHAVE, String(Math.round(nav.scrollLeft))); } catch (e) { /* sem armazenamento */ }
    }

    if (nav.scrollWidth > nav.clientWidth) {
        var salva = 0;
        try { salva = parseInt(sessionStorage.getItem(CHAVE), 10) || 0; } catch (e) { /* sem armazenamento */ }
        if (salva > 0) nav.scrollLeft = salva;

        // o fim do menu fica esmaecido (máscara em css/responsivo.css): conta como fora da tela
        var ativo = nav.querySelector('a.active');
        if (ativo) {
            var m = nav.getBoundingClientRect();
            var a = ativo.getBoundingClientRect();
            var limite = m.right - m.width * 0.15;
            if (a.left < m.left || a.right > limite) {
                nav.scrollLeft += a.left - m.left - (m.width * 0.85 - a.width) / 2;
            }
        }
    }

    nav.addEventListener('click', guardar);
    window.addEventListener('pagehide', guardar);
})();
