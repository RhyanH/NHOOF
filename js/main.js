/* ============================================================================
   Gaveta do menu lateral em telas pequenas.

   O botão (.mobile-menu-btn) e a camada escura (.sidebar-overlay) já estão no
   HTML de cada página; os estilos ficam em css/responsivo.css. Os cliques são
   tratados no documento, então continuam valendo depois que a navegação sem
   recarregar (js/navegacao.js) troca o cabeçalho da página.
   ============================================================================ */
(function () {
    'use strict';

    function alternarGaveta(abrir) {
        var menu = document.querySelector('.sidebar-channels');
        var camada = document.querySelector('.sidebar-overlay');
        if (!menu) return;
        var aberta = typeof abrir === 'boolean' ? abrir : !menu.classList.contains('mobile-open');
        menu.classList.toggle('mobile-open', aberta);
        if (camada) camada.classList.toggle('active', aberta);
    }

    document.addEventListener('click', function (e) {
        var alvo = e.target && e.target.closest ? e.target : null;
        if (!alvo) return;
        if (alvo.closest('.mobile-menu-btn')) {
            alternarGaveta();
        } else if (alvo.closest('.sidebar-overlay')) {
            alternarGaveta(false);
        }
    });
})();
