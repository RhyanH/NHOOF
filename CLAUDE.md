# CLAUDE.md — instruções para o Claude trabalhar no NHOOF

Este arquivo é lido automaticamente pelo Claude ao abrir este repositório. Ele reúne as regras de trabalho e as decisões já tomadas com o dono do site. **O manual completo (estrutura, componentes, passo a passo) está no `README.md`: leia o README inteiro antes da primeira edição de cada sessão.**

> Este repositório é público. Não escreva aqui (nem no site, nem em commits) o nome real do dono ou qualquer dado pessoal. Ele assina como **NHOOF**.

---

## 1. Quem é o usuário e como falar com ele

- O dono do site é o **NHOOF**. Fala **português do Brasil** e **não é programador**: responda sempre em português, com linguagem simples, frases curtas e sem jargão (se um termo técnico for inevitável, explique em uma linha).
- Ele valoriza **ver antes de aprovar**: prints, comparações de antes e depois e GIFs das animações. Mande imagens em vez de descrever.
- Quando ele pede opinião ("é uma boa?", "o que acha?"), dê uma recomendação honesta e direta, com o porquê e as alternativas, e não só concorde.
- Se um pedido dele for piorar algo (ex.: letra escura sobre fundo escuro, que fica ilegível), **não recuse nem faça calado**: faça a versão pedida e uma alternativa, mostre as duas lado a lado e explique a diferença. Foi assim que chegamos ao neon atual.
- Quando o pedido for ambíguo ou tiver mais de um caminho bom, **pergunte com opções** (2 a 4 escolhas, com a recomendada primeiro).
- Na resposta final, diga em poucas linhas: o que mudou, como foi testado e se foi publicado. Lembre que, se o site antigo aparecer, basta recarregar a página.

## 2. Autonomia: o que pode fazer sozinho e o que precisa de aprovação

| Tipo de mudança | O que fazer |
|---|---|
| **Visual** (cores, layout, animação, tamanho, posição, ícones) | Monte uma **prévia** (antes e depois, nas telas da seção 6), mande para ele e **só publique depois que ele aprovar**. |
| **Correção de bug, código, texto de interface, README, scripts** | Confira tudo (seção 5) e **publique direto**; depois mostre o resultado. |
| **Conteúdo técnico dos guias** (valores, ON/OFF, caminhos, recomendações, explicações do "O que faz") | **Só muda com pedido ou aprovação dele.** Se achar um erro, avise com a fonte oficial e pergunte antes de alterar. Mudar a forma (markup, classes) sem mudar a informação é permitido. |
| **Criar páginas ou projetos novos** (Projetos 2 a 9) | Não crie nada por conta própria. Ele ainda não definiu o que serão; pergunte. |
| **Ações difíceis de desfazer** (apagar arquivos, reescrever histórico, `git push --force`, mudar configurações do GitHub) | Nunca faça sem pedido explícito. |

A instrução original dele vale sempre: *"faça as melhorias, confira tudo e faça o upload no GitHub quando tiver 100% de certeza de que está tudo certo, tanto as informações quanto o código."*

### Manter este arquivo (e o README) sempre em dia

- Sempre que uma decisão nova for tomada, uma antiga mudar ou algo aqui deixar de valer, **atualize o `CLAUDE.md`**: acrescente, corrija ou remova o trecho. Isso vale para cores, regras, comportamento do site, preferências do dono e coisas recusadas.
- Faça o mesmo com o **`README.md`** quando mudar algo que uma pessoa precise saber para manter o site.
- **Antes de mexer nesses arquivos, avise o dono:** diga **o que** vai mudar e **por quê**, em uma ou duas linhas. Só então faça a mudança.
- Publique a atualização junto com a mudança que a motivou. Na resposta final, diga em uma linha o que mudou nesses arquivos.

## 3. Direção de design (a "persona")

- Atue como **especialista sênior em UI/UX e front-end**: interfaces escuras, limpas, minimalistas e polidas, no estilo de painéis tech de alto padrão (Vercel, Supabase, Stripe, Linear).
- **Design system único**: nenhum bloco pode destoar dos outros. Use os tokens de `:root` em `css/style.css` (`--bg`, `--surface`, `--line`, `--text`, `--accent`, `--ok`, `--warn`, `--danger`…) e os componentes que já existem. Não invente estilos isolados.
- Fontes: **Geist** (texto) e **Geist Mono** (categorias, códigos, detalhes), locais em `fontes/`.
- Toda animação deve ser **fluida** ("sem nenhuma sensação de 5 fps") e **respeitar a configuração do visitante** (seção 7).

## 4. Estado atual: decisões já tomadas (não desfaça sem ele pedir)

### Menu do topo (todas as páginas)
- Fixo no topo, com efeito de vidro: logo à esquerda e, no centro, uma pílula com **Otimização, Projeto 2 a 9 (ainda `href="#"`) e Sobre**. Deve continuar existindo em todas as páginas.
- O **item ativo** tem um efeito **neon** e fica em **negrito**:
  - **Letra:** miolo quase branco com brilho colorido em camadas, que "respira" (pulsa) e dá uma piscadinha rápida, como uma lâmpada neon (animação `nav-neon`, 2,8 s).
  - **Contorno:** 1 px, girando (`nav-giro`, 5 s), com brilho suave por trás.
  - As cores são variáveis em `header nav` (`--neon-texto`, `--neon-fundo`, `--neon-1…4`, `--neon-4-fraco`, `--aro-1…3`, `--aro-brilho`). Cada página pode trocar só essas variáveis.
  - **Otimização (azul):** texto `#e8ecff`, fundo `rgba(47,76,255,.12)`, brilho `#c9d3ff`/`#6f8bff`/`#3f5bff`, contorno só em azuis fortes `#2f4cff`/`#1a2fd6`/`#3b57ff`.
  - **Sobre (cinza grafite)**, em `css/sobre.css`: texto `#e2e8f0`, contorno `#94a3b8`/`#7d8ba1`/`#cbd5e1`.
- **No celular** o menu rola de lado. O `js/menu-topo.js` (logo depois do `</header>` em todas as páginas) mantém a posição em que a pessoa deixou e garante que o item ativo apareça.

### Home (`index.html`)
- Só a palavra **"NHOOF"** no centro (degradê branco), sobre um **fundo de espaço** animado:
  - **Céu de estrelas** bem fracas, desenhado uma vez e usado como imagem de fundo do palco; 12% das estrelas piscam devagar.
  - **Partículas com profundidade**: as pequenas andam devagar e as grandes mais rápido (`RITMO = [0.5, 0.8, 1.2]`), ligadas por linhas finas, como constelações.
  - Brilho azul suave atrás do NHOOF, com `mix-blend-mode: screen` sobre fundo opaco (isso evita o "halo escuro").
- **Sem interação com o mouse** e **sem grade de quadradinhos** (ele pediu para tirar as duas).
- **Qualidade adaptativa**: se o PC não acompanhar, tira partículas aos poucos (níveis 1 → 0,7 → 0,5 → 0,35). A animação pausa quando a aba fica em segundo plano.

### Sobre (`sobre/index.html`)
- **Cartão único centralizado**: logo com **fundo preto** (contraste no "N"), "Sobre", título "Sobre o NHOOF", uma frase de abertura e dois parágrafos em primeira pessoa e tom casual. O texto **termina** em "NHOOF é o nick que eu uso na internet desde sempre."
- **Sem o nome real dele.** Rodapé só com logo e ©ano, **sem aviso de risco** ("não faz sentido aviso de projeto na página Sobre").

### Otimização (`otimizacao/`)
- **Menu lateral** com categorias entre colchetes (`[BEM VINDO]`, `[PEN DRIVE]`, `[BIOS]`…) e canais com `#`. É escrito **somente** em `js/sidebar.js`.
  - Só as **categorias recolhidas** ficam salvas (localStorage, chaves `sidebar_cat_…`). Nada mais é guardado.
  - Ao entrar no Otimização vindo de outra página, a lista começa do topo e sem canal selecionado. Abrindo um guia direto (link ou F5), a lista rola até o canal aberto.
- **Entrada** (`otimizacao/index.html`): **não é um canal**, não aparece no menu lateral e nenhum canal fica selecionado nela.
  - Conteúdo: "Por onde começar", um alerta que leva ao importante, o cartão de destaque "Antes de tudo", um cartão por categoria (com `data-categoria` e contagem automática de guias) e a faixa do setup.
- **Canais** (`otimizacao/*.html`): cabeçalho `# nome | descrição` e, **encostada na direita**, a **"Última modificação: dd/mm/aaaa às hh:mm"**.
  - A data fica em horário de Brasília. Os segundos aparecem só ao passar o mouse; no celular aparece só o dia.
  - A data é gravada por script, nunca à mão (seção 8).
- **Listas** com formato automático por lista inteira (`js/main.js`):
  - tabela quando todos os valores cabem;
  - `lista-instrucoes` (rótulo em cima, valor embaixo) quando algum quebraria a linha;
  - `lista-passos` para passos numerados 1, 2, 3;
  - `li-caminho` para a trilha "Caminho" no topo;
  - switches `val-on` (verde) e `val-off`.

### O que ele já recusou (não proponha de novo)
- Neon RGB arco-íris: ele preferiu as cores do próprio site.
- Letra branca ou pálida no item ativo, que ficava "apagada".
- Letra escura sobre fundo escuro, que fica ilegível.
- Verde, ou tons claros e esbranquiçados, no contorno azul.
- Trechos pretos no contorno grafite.
- Grade de quadradinhos no fundo da Home.
- Interação do fundo com o mouse.
- Animação ignorando a configuração do Windows. Ele pediu de volta o respeito à configuração.
- Nome real no Sobre.
- Aviso de risco no Sobre.
- A entrada do Otimização como canal do menu lateral.
- Salvar a posição de rolagem do menu lateral.
- Segundos visíveis na data.

## 5. Fluxo de trabalho (sempre nesta ordem)

1. **Atualize:** `git pull --rebase`. Uma automação do GitHub pode ter criado commits de data (seção 8).
2. **Leia** o `README.md` e os arquivos que vai mexer.
3. **Edite.** Siga a seção 9 (regras que não podem ser quebradas).
4. **Prepare a publicação:** `python atualizar-versao.py`. Ele grava as datas dos canais alterados e o número de versão `?v=` de CSS/JS em todas as páginas.
5. **Verifique:** `python verificar-site.py` precisa terminar em **TUDO CERTO**. O aviso dos 17 links externos sem `rel="noopener noreferrer"` já é conhecido; complete esses links só quando ele pedir mudança naqueles guias, porque mexer neles muda a data.
6. **Teste no navegador** (seção 6). Se a mudança for visual, mande a prévia e **espere a aprovação**.
7. **Confira as informações:** textos, valores e afirmações batem com o que ele disse ou com fonte oficial. Nada inventado.
8. **Commit** com mensagem curta em português, no formato "Área: o que mudou" (ex.: `Menu: contorno do item ativo só em azuis fortes`). Se o ambiente exigir linhas de autoria ou atribuição, siga o ambiente.
9. **Envie:** `git push`. Se for recusado, rode `git pull --rebase` e envie de novo.
10. **Confirme a publicação:** a execução **pages build and deployment** do commit precisa terminar com sucesso (cerca de 1 minuto):
    ```
    gh api "repos/RhyanH/NHOOF/actions/runs?per_page=5" --jq '.workflow_runs[] | "\(.name) | \(.head_sha[0:7]) | \(.status) | \(.conclusion)"'
    ```
11. **Responda** com o resumo (seção 1). Se alguma decisão nova surgiu, atualize o `CLAUDE.md` e o `README.md`, avisando antes (seção 2).

O endereço canônico do repositório é `https://github.com/RhyanH/NHOOF.git`. O aviso "This repository moved" no push é inofensivo.

## 6. Como testar e montar prévias

- **Servidor local:** `python -m http.server 8765` na raiz e abrir `http://127.0.0.1:8765/`. A navegação sem recarregar só funciona com servidor.
- **Navegador automatizado** (se houver Playwright e Chromium no ambiente): tire prints nestas telas:
  - **1920×910** (PC);
  - **1366×768** (notebook);
  - **390×844 com escala 2** (celular).
  - Para elementos pequenos, recorte e amplie o trecho.
- **Antes e depois:** sirva o arquivo antigo com `git show HEAD:css/style.css` (por exemplo, interceptando a requisição no Playwright) e junte "ANTES" e "DEPOIS" numa imagem só, com rótulos. **Animações vão em GIF** (40 a 50 quadros).
- **Sempre teste os dois estados de animação:** `reduced_motion="no-preference"` (anima) e `"reduce"` (parado, mas visível).
- Em toda mudança, confira:
  - **sem rolagem lateral** no celular (`scrollWidth <= innerWidth`);
  - **sem erros no console**;
  - a troca de canal sem recarregar ainda funciona.
- **Desempenho da Home:** meça quadros por segundo com e sem lentidão de CPU (CDP `Emulation.setCPUThrottlingRate`, 1x e 6x) e compare com a versão publicada, lado a lado, na mesma máquina.
  - Referência neste tipo de ambiente sem placa de vídeo: cerca de 180 fps em 1x e cerca de 42 fps em 6x, depois de a qualidade adaptativa agir.
  - Não pode piorar.

## 7. Desempenho e animações (regras técnicas)

- Anime só `transform` e `opacity`. Animar `background-position` derrubou a grade antiga para cerca de 30 fps.
- **Não crie camadas extras de tela cheia.** Um segundo `<canvas>` de tela inteira custou cerca de 25% de fluidez; por isso as estrelas paradas viraram imagem de fundo do palco.
- No canvas, desenhe em lote: agrupe as linhas por intensidade, um `stroke()` por grupo, e os pontos por tamanho. O movimento é calculado pelo tempo decorrido, não por quadro.
- **Toda animação decorativa fica dentro de `@media (prefers-reduced-motion: no-preference)`.** O CSS global tem uma regra para "reduzir movimento" que força `animation-duration: .01ms !important`. Uma animação infinita fora desse bloco ficaria piscando loucamente.
  - No Windows, essa preferência vem de "**Animar controles e elementos dentro das janelas**". O guia *desativar efeitos visuais* a desliga, então no PC dele o fundo da Home fica parado. Isso é esperado, não é bug.
- O `js/home.js` também escuta a mudança dessa preferência ao vivo e pausa quando a aba está escondida (`visibilitychange`).
- Brilho no menu do celular: o menu tem `overflow-x: auto`, que corta o que passa da altura. Mantenha brilhos e contornos dentro de cerca de 4 px.

## 8. Scripts e automação

| Arquivo | O que faz | Quando usar |
|---|---|---|
| `atualizar-versao.py` | Roda o `atualizar-datas.py` e depois troca o `?v=` de todo CSS/JS local em todas as páginas | **Antes de todo commit** |
| `atualizar-datas.py` | Grava a "Última modificação" só nos canais cujo **conteúdo** (de `<div class="chat-header">` até `<!-- Camada escura`, sem a própria data) mudou desde o último commit | Chamado pelo script acima |
| `atualizar-datas.py --ci` | Completa datas de canais mudados em commits que não atualizaram a data (ex.: edição pelo site do GitHub), com a data desse commit | Usado pela automação |
| `verificar-site.py` | Confere links, menu lateral × arquivos, categorias, estrutura dos canais, datas, `<style>`, imagens, `menu-topo.js`, item ativo | **Antes de todo commit** |
| `.github/workflows/datas.yml` | A cada envio que mexe em `otimizacao/`, roda o `--ci`; se completar alguma data, faz um commit "Datas de modificação atualizadas automaticamente" e pede nova publicação | Automático |

- **Nunca edite à mão** a linha `<time class="channel-update" …>` nem os `?v=…`.
- O script de datas depende de três marcadores: `<div class="chat-header">`, `<!-- Camada escura` e o fechamento do cabeçalho com `\n            </div>` (12 espaços). Mantenha os três em todo canal.
- Mudanças que valem para o site inteiro (menu do topo, scripts, `?v=`) não mexem nas datas. Mudanças **dentro** do conteúdo de um canal mexem, inclusive as invisíveis, como atributos. Por isso evite mexer no markup de guias sem necessidade.

## 9. Regras que não podem ser quebradas

1. **Menu lateral só em `js/sidebar.js`**, no formato exato `['arquivo.html', 'nome no menu'],` e `{ titulo: '[NOME]', canais: [ … ] },`, com aspas simples. O `verificar-site.py` lê esse formato.
2. **Nada de `<style>` nas páginas.** Estilo novo vai para `css/style.css` (ou `home.css`/`sobre.css` quando for exclusivo), usando os tokens.
3. Todo canal mantém a estrutura `chat-header` + `chat-content`. A navegação sem recarregar (`js/navegacao.js`) troca exatamente essas duas partes.
4. `data-categoria` dos cartões da entrada precisa ser **idêntico** ao título da categoria, com colchetes.
5. Todo `<header>` é seguido de `<script src="…js/menu-topo.js"></script>`, e cada página (menos a Home) tem **um** item `class="active"` no menu do topo.
6. Nomes de arquivo em minúsculas, sem acento e sem espaço (`novo-guia.html`). Nome do canal no menu em minúsculas. `<title>` no formato "Nome - NHOOF". `page-title` em maiúsculas.
7. Links externos com `target="_blank" rel="noopener noreferrer"`. Imagens com `alt`; nos guias, também `width` e `height` reais.
8. Nada de bibliotecas externas, CDNs ou etapa de build: o site é HTML, CSS e JS puros, e as fontes ficam no próprio repositório.
9. Não deixe arquivos temporários no repositório (`__pycache__` está no `.gitignore`; prints e testes ficam fora).

## 10. Conteúdo dos guias (voz e precisão)

- Português do Brasil. Os guias mostram **as configurações que ele usa e testou no próprio PC**: primeira pessoa quando for pessoal ("no meu setup", "escolhi"), e direto ao ponto.
- Estrutura de cada cartão:
  - título numerado com ícone (`<h3><span class="card-icon">🎮</span>1. Configuração</h3>`);
  - lista de opções e valores;
  - caixa **"O que faz:"** explicando o ajuste.
- Afirmações técnicas só com **fonte oficial** (Microsoft, AMD, NVIDIA, Gigabyte, fabricante do software) ou o que ele mesmo disse. Nunca invente benefícios ou números. Avisos de garantia e risco ficam como estão (ex.: PBO).
- Referência de hardware (pública, em `meu-setup.html`): Ryzen 7 9800X3D, RTX 4070 GALAX, placa-mãe **Gigabyte B650 Aero G** (os caminhos de BIOS são dela), RAM Kingston Fury Beast 6000 MT/s CL30. Dois monitores: Alienware AW2523HF 360 Hz e ASUS VG248QG 165 Hz. Headset Astro A50 X.
- A descrição do canal (`channel-topic`) é uma frase curta, terminada em ponto.

## 11. Ideias em aberto (só com pedido dele)

- **Projetos 2 a 9:** ainda indefinidos. Quando existirem, cada um pode ter uma cor de neon própria trocando as variáveis do menu (como o Sobre) e, se tiver menu lateral, um bloco próprio em `MENUS` com `data-projeto`.
- A automação de datas cobre só o Otimização. Para outro projeto, adapte `PASTA` em `atualizar-datas.py` e os `paths` do workflow.
- Edição pelo site do GitHub não atualiza o `?v=` do CSS/JS. Se ele passar a editar CSS por lá, dá para estender a automação para isso também.
