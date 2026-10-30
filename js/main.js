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
        } else if (alvo.closest('.code-line')) {
            copiar(alvo.closest('.code-line'));
        }
    });

    // Clique num comando (.code-line) copia o texto e mostra "Copiado ✓"
    function copiar(el) {
        var texto = (el.textContent || '').trim();
        if (!texto || !navigator.clipboard) return;
        navigator.clipboard.writeText(texto).then(function () {
            el.classList.add('copiado');
            clearTimeout(el._copiadoTimer);
            el._copiadoTimer = setTimeout(function () { el.classList.remove('copiado'); }, 1400);
        }).catch(function () { /* sem permissão: ignora */ });
    }

    // Fecha a gaveta com Esc
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') alternarGaveta(false);
    });
})();
