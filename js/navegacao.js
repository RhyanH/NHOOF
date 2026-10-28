/* ============================================================================
   Navegação entre canais sem recarregar a página.

   Cada canal continua sendo um arquivo .html próprio (links diretos, botão
   atualizar e compartilhamento de endereço funcionam normalmente). Ao clicar
   num link para outro arquivo da mesma pasta, este script busca o arquivo,
   troca só o cabeçalho do canal, o conteúdo, os estilos da página e o título,
   marca o canal ativo e atualiza o endereço com history.pushState. O menu
   lateral não é recriado, então a rolagem e as categorias abertas permanecem.
   Links de marcação de lugar (href="#") são apenas bloqueados.

   Se qualquer etapa falhar (rede, página inexistente, abertura direta do
   arquivo), o clique segue a navegação normal do navegador.
   ============================================================================ */
(function () {
    'use strict';

    var menu = document.querySelector('.sidebar-channels');
    var pasta = location.pathname.replace(/[^\/]*$/, '');
    var principal = document.querySelector('.main-chat');
    if (!menu || !principal || !window.fetch || !window.history || !history.pushState) return;

    var cache = {};          // endereço -> Promise com o documento já interpretado
    var ausentes = {};       // endereços que falharam (evita buscar de novo ao passar o mouse)
    var pedidoAtual = 0;     // descarta respostas de cliques antigos
    var exibida = location.href;

    // Marca os estilos próprios desta página para poder trocá-los depois
    document.head.querySelectorAll('style').forEach(function (s) {
        s.setAttribute('data-pagina', '');
    });

    // Nome do arquivo de um endereço (a raiz da pasta equivale a index.html)
    function arquivoDe(url) {
        var nome = new URL(url, location.href).pathname.split('/').pop() || 'index.html';
        return nome.indexOf('.') === -1 ? nome + '.html' : nome;
    }

    // Link para outro arquivo .html da mesma pasta, sem destino especial nem download
    function ehPagina(a) {
        if (!a || !a.href || a.target || a.hasAttribute('download')) return false;
        if (a.origin !== location.origin) return false;
        if (a.pathname.replace(/[^\/]*$/, '') !== pasta) return false;
        return /\.html?$/.test(a.pathname);
    }

    function linkDoEvento(e) {
        return e.target && e.target.closest ? e.target.closest('a[href]') : null;
    }

    function buscar(url) {
        if (ausentes[url]) return Promise.reject(new Error('ausente'));
        if (!cache[url]) {
            cache[url] = fetch(url, { credentials: 'same-origin' })
                .then(function (r) {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.text();
                })
                .then(function (html) {
                    return new DOMParser().parseFromString(html, 'text/html');
                });
            cache[url].catch(function () {
                delete cache[url];
                ausentes[url] = true;
            });
        }
        return cache[url];
    }

    function fecharGaveta() {
        var overlay = document.querySelector('.sidebar-overlay');
        menu.classList.remove('mobile-open');
        if (overlay) overlay.classList.remove('active');
    }

    // Troca o conteúdo exibido pelo do documento recebido; devolve false se ele não tiver a estrutura esperada
    function aplicar(doc, url) {
        var novoPrincipal = doc.querySelector('.main-chat');
        var novoCabecalho = novoPrincipal && novoPrincipal.querySelector('.chat-header');
        var novoConteudo = novoPrincipal && novoPrincipal.querySelector('.chat-content');
        var cabecalho = principal.querySelector('.chat-header');
        var conteudo = principal.querySelector('.chat-content');
        if (!novoCabecalho || !novoConteudo || !cabecalho || !conteudo) return false;

        // Estilos próprios da página: remove os antigos e coloca os novos logo após o CSS compartilhado
        document.head.querySelectorAll('style[data-pagina]').forEach(function (s) { s.remove(); });
        var anterior = document.head.querySelector('link[rel="stylesheet"]');
        doc.head.querySelectorAll('style').forEach(function (s) {
            var copia = document.importNode(s, true);
            copia.setAttribute('data-pagina', '');
            if (anterior) {
                anterior.after(copia);
            } else {
                document.head.prepend(copia);
            }
            anterior = copia;
        });

        document.title = doc.title;

        cabecalho.innerHTML = novoCabecalho.innerHTML;

        conteudo.replaceWith(document.importNode(novoConteudo, true));

        // Canal ativo no menu e estado das categorias
        var arquivo = arquivoDe(url);
        if (window.nhoofMenu) window.nhoofMenu.marcarAtivo(arquivo);

        fecharGaveta();
        return true;
    }

    function irPara(url, empilhar) {
        var pedido = ++pedidoAtual;
        buscar(url).then(function (doc) {
            if (pedido !== pedidoAtual) return;
            if (!aplicar(doc, url)) {
                location.href = url;
                return;
            }
            if (empilhar) {
                try {
                    history.pushState({ nhoof: true }, '', url);
                } catch (erro) {
                    location.href = url;
                    return;
                }
            }
            exibida = new URL(url, location.href).href;
        }).catch(function () {
            if (pedido === pedidoAtual) location.href = url;
        });
    }

    document.addEventListener('click', function (e) {
        var a = linkDoEvento(e);
        if (!a || e.defaultPrevented) return;
        var destino = a.getAttribute('href');
        if (destino === '#') {
            e.preventDefault();
            return;
        }
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (!ehPagina(a)) return;
        e.preventDefault();
        if (arquivoDe(a.href) === arquivoDe(exibida)) {
            fecharGaveta();
            return;
        }
        irPara(a.href, true);
    });

    // Carrega a página antecipadamente ao passar o mouse, focar ou tocar no link
    function preparar(e) {
        var a = linkDoEvento(e);
        if (ehPagina(a) && arquivoDe(a.href) !== arquivoDe(exibida)) buscar(a.href).catch(function () {});
    }
    document.addEventListener('mouseover', preparar);
    document.addEventListener('focusin', preparar);
    document.addEventListener('touchstart', preparar, { passive: true });

    // Botões voltar e avançar do navegador
    window.addEventListener('popstate', function () {
        if (new URL(location.href).href === exibida) return;
        irPara(location.href, false);
    });
})();
