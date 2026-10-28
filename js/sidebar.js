/* ============================================================================
   NHOOF - Menu lateral (sidebar) das páginas

   Este é o ÚNICO lugar onde o menu lateral é escrito. As páginas só têm um
   espaço reservado:   <div class="sidebar-channels" data-projeto="otimizacao"></div>
   seguido de <script src="../js/sidebar.js"></script>, e este arquivo desenha o menu.

   COMO MEXER (pelo site do GitHub, no lápis de editar este arquivo):
     - Adicionar um canal: copie uma linha  ['arquivo.html', 'nome no menu'],
       cole na categoria desejada e troque os dois textos.
     - Renomear um canal: troque só o segundo texto da linha.
     - Mudar a ordem: mova a linha de lugar.
     - Nova categoria: copie um bloco  { titulo: '[NOME]', canais: [ ... ] },
     - Cuidado: mantenha as aspas simples ' ', as vírgulas e os colchetes.

   A página que está aberta é marcada sozinha (pelo nome do arquivo na barra de
   endereço). O abrir/fechar das categorias continua em js/main.js.

   NOVO PROJETO (2 a 9): crie outro bloco ao lado de "otimizacao" (por exemplo
   projeto2: [ ... ]) e use data-projeto="projeto2" no espaço reservado das
   páginas daquele projeto.
   ============================================================================ */
(function () {
    'use strict';

    // ---- EDITE AQUI: categorias e canais de cada projeto ---------------------
    var MENUS = {
        otimizacao: [
            { titulo: '[BEM VINDO]', canais: [
                ['index.html', 'importante'],
                ['meu-setup.html', 'meu setup'],
            ] },

            { titulo: '[PEN DRIVE]', canais: [
                ['criando-pendrive.html', 'criando pendrive'],
                ['chipset-amd.html', 'chipset amd'],
            ] },

            { titulo: '[BIOS]', canais: [
                ['atualizacao-de-bios.html', 'atualização de bios'],
                ['secure-boot-e-tpm.html', 'secure boot e tpm'],
                ['fast-boot.html', 'fast boot'],
                ['expo.html', 'expo'],
                ['memory-context-restore.html', 'memory context restore'],
                ['re-size-bar.html', 're-size bar'],
                ['pbo.html', 'pbo'],
                ['curve-optimizer.html', 'curve optimizer'],
                ['platform-thermal-limit.html', 'platform thermal limit'],
                ['integrated-graphics.html', 'integrated graphics'],
                ['bios-profiles.html', 'bios profiles'],
            ] },

            { titulo: '[PÓS-FORMATAÇÃO]', canais: [
                ['windows-update.html', 'windows update'],
                ['ordem-de-instalacao.html', 'ordem de instalação'],
                ['l-connect-3.html', 'l-connect-3'],
                ['g-hub.html', 'g-hub'],
                ['signalrgb.html', 'signalrgb'],
            ] },

            { titulo: '[WINDOWS 11]', canais: [
                ['debloat-e-limpeza.html', 'debloat e limpeza'],
                ['apps-inicializacao.html', 'apps inicialização'],
                ['hibernacao.html', 'hibernação'],
                ['vbs.html', 'vbs'],
                ['xbox-game-bar.html', 'xbox game bar'],
                ['desativar-efeitos-visuais.html', 'desativar efeitos visuais'],
                ['plano-de-energia.html', 'plano de energia'],
                ['modo-de-jogo.html', 'modo de jogo'],
                ['agendamento-de-gpu.html', 'agendamento de gpu'],
                ['ajuste-mouse.html', 'ajuste mouse'],
                ['ajuste-teclado.html', 'ajuste teclado'],
            ] },

            { titulo: '[NVIDIA]', canais: [
                ['configuracoes-3d.html', 'configurações 3d'],
                ['cores-e-tela.html', 'cores e tela'],
                ['msi-utility.html', 'msi utility'],
                ['msi-afterburner.html', 'msi afterburner'],
            ] },

            { titulo: '[REDE]', canais: [
                ['ajustar-dns.html', 'ajustar dns'],
                ['otimizacao-do-adaptador.html', 'otimização do adaptador'],
                ['backup-wi-fi.html', 'backup wi-fi'],
            ] },

            { titulo: '[AUDIO]', canais: [
                ['a50x.html', 'a50x'],
                ['dolby-access.html', 'dolby access'],
            ] },

            { titulo: '[MONITOR]', canais: [
                ['aw2523hf.html', 'aw2523hf'],
                ['vg248qg.html', 'vg248qg'],
            ] },

            { titulo: '[OTIMIZAÇÃO]', canais: [
                ['ponto-de-restauracao.html', 'ponto de restauração'],
                ['politicas-de-grupo.html', 'politicas de grupo'],
                ['servicos.html', 'serviços'],
                ['regedit.html', 'regedit'],
                ['tweaks-de-sistema.html', 'tweaks de sistema'],
            ] },

            { titulo: '[MEMÓRIA RAM]', canais: [
                ['descompressao-memoria-ram.html', 'descompressão memória ram'],
                ['disable-paging-executive.html', 'disable paging executive'],
                ['islc.html', 'islc'],
            ] },

            { titulo: '[ESTÉTICA]', canais: [
                ['cursor.html', 'cursor'],
            ] },

            { titulo: '[CORREÇÃO DE BUGS]', canais: [
                ['data-e-hora.html', 'data e hora'],
                ['chrome.html', 'chrome'],
            ] },
        ]
    };
    // ---- FIM DA PARTE EDITÁVEL ----------------------------------------------

    function esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // o espaço reservado é o elemento logo antes deste <script>
    var alvo = document.currentScript && document.currentScript.previousElementSibling;
    if (!alvo || !alvo.classList.contains('sidebar-channels')) {
        alvo = document.querySelector('.sidebar-channels[data-projeto]');
    }
    if (!alvo) return;

    var menu = MENUS[alvo.getAttribute('data-projeto')];
    if (!menu) return;

    // arquivo da página aberta (a raiz da pasta equivale a index.html)
    var atual = location.pathname.split('/').pop() || 'index.html';
    if (atual.indexOf('.') === -1) atual += '.html';

    var html = '<div class="channels-list">';
    menu.forEach(function (cat, i) {
        html += '<div class="category-header"' + (i ? ' style="margin-top: 0.75rem;"' : '') +
            '><span class="category-arrow">▼</span> ' + esc(cat.titulo) + '</div>';
        html += '<div class="category-content">';
        cat.canais.forEach(function (c) {
            html += '<a href="' + esc(c[0]) + '" class="channel-item' + (c[0] === atual ? ' active' : '') +
                '"><span>#</span> ' + esc(c[1]) + '</a>';
        });
        html += '</div>';
    });
    html += '</div>';

    alvo.innerHTML = html;
})();
