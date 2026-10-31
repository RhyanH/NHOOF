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

    /* ------------------------------------------------------------------------
       Formato das listas de ajustes, decidido por LISTA inteira:
       a lista é testada como tabela (rótulo à esquerda, valor à direita);
       se algum valor quebraria em mais de uma linha, a lista toda vira
       "instruções" (rótulo em cima, valor embaixo). Linhas com switch,
       a linha "Caminho" e listas de passos numerados não entram na conta.
       ------------------------------------------------------------------------ */
    function valorQuebra(li) {
        var rotulo = li.firstElementChild;
        var inicio = rotulo && rotulo.tagName === 'SPAN' ? rotulo : null;
        var range = document.createRange();
        if (inicio) {
            range.setStartAfter(inicio);
        } else {
            var forte = li.querySelector('strong');
            if (!forte) return false;
            range.setStartBefore(forte);
        }
        range.setEnd(li, li.childNodes.length);
        var linhas = [];
        var rects = range.getClientRects();
        for (var i = 0; i < rects.length; i++) {
            if (rects[i].width < 1) continue;
            var topo = Math.round(rects[i].top);
            var nova = linhas.every(function (t) { return Math.abs(t - topo) > 6; });
            if (nova) linhas.push(topo);
        }
        return linhas.length > 1;
    }

    function organizarListas(raiz) {
        var listas = (raiz || document).querySelectorAll('.setup-card ul:not(.lista-passos)');
        listas.forEach(function (ul) {
            ul.classList.remove('lista-instrucoes');
            var itens = ul.querySelectorAll(':scope > li:not(.li-caminho)');
            var quebra = false;
            for (var i = 0; i < itens.length && !quebra; i++) {
                if (itens[i].querySelector(':scope > .val')) continue;
                quebra = valorQuebra(itens[i]);
            }
            ul.classList.toggle('lista-instrucoes', quebra);
        });
    }

    // Liga em toda página de guia, mesmo nas que não têm listas (a próxima pode ter)
    if (document.querySelector('.main-chat')) {
        organizarListas();
        // Re-mede quando a fonte final chega (a reserva é mais estreita) e no fim do carregamento
        if (document.fonts) {
            if (document.fonts.ready) document.fonts.ready.then(function () { organizarListas(); });
            if (document.fonts.addEventListener) {
                document.fonts.addEventListener('loadingdone', function () { organizarListas(); });
            }
        }
        window.addEventListener('load', function () { organizarListas(); });

        var aguardando;
        window.addEventListener('resize', function () {
            clearTimeout(aguardando);
            aguardando = setTimeout(function () { organizarListas(); }, 120);
        });

        // Depois da troca de página sem recarregar (js/navegacao.js)
        var painel = document.querySelector('.main-chat');
        if (painel && window.MutationObserver) {
            new MutationObserver(function (mudancas) {
                mudancas.forEach(function (m) {
                    m.addedNodes.forEach(function (n) {
                        if (n.nodeType === 1 && n.classList.contains('chat-content')) organizarListas(n);
                    });
                });
            }).observe(painel, { childList: true });
        }
    }

    // Fecha a gaveta com Esc
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') alternarGaveta(false);
    });
})();
