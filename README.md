# NHOOF

Site pessoal com guias de otimização de PC (BIOS, Windows, NVIDIA, rede, áudio, monitor…), feito em HTML, CSS e JavaScript puros, sem frameworks e sem etapa de build. Publicado de graça pelo GitHub Pages.

- **Site:** https://rhyanh.github.io/NHOOF/
- **Repositório:** https://github.com/RhyanH/NHOOF

Este documento explica como o site funciona e como mantê-lo sozinho: editar um guia, criar guias e categorias, mudar cores, publicar e resolver problemas.

---

## Sumário

1. [Como o site é publicado](#1-como-o-site-é-publicado)
2. [Estrutura de pastas](#2-estrutura-de-pastas)
3. [Duas formas de editar](#3-duas-formas-de-editar)
4. [Antes de publicar: os scripts](#4-antes-de-publicar-os-scripts)
5. [Tarefas comuns, passo a passo](#5-tarefas-comuns-passo-a-passo)
6. [Componentes dos guias](#6-componentes-dos-guias)
7. [O que acontece sozinho](#7-o-que-acontece-sozinho)
8. [Visual: cores, fontes e design system](#8-visual-cores-fontes-e-design-system)
9. [Solução de problemas](#9-solução-de-problemas)
10. [Regras para não quebrar nada](#10-regras-para-não-quebrar-nada)
11. [Créditos e licenças](#11-créditos-e-licenças)

---

## 1. Como o site é publicado

- O site é publicado pelo **GitHub Pages**, a partir da branch `main`, pasta raiz (`/`).
- Toda vez que algo é enviado para a `main`, o GitHub publica sozinho. Leva cerca de **1 minuto**.
- Para acompanhar: aba **Actions** do repositório → execução **pages build and deployment**. Verde (✓) = publicado; vermelho (✗) = falhou (abra para ver o erro).
- Configuração (caso precise refazer): **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)`**.

Depois de publicar, recarregue a página no navegador. Se ainda aparecer a versão antiga, veja [Solução de problemas](#9-solução-de-problemas).

---

## 2. Estrutura de pastas

```
NHOOF/
├── index.html               Página inicial (Home): só o NHOOF sobre o fundo de espaço animado
├── sobre/
│   └── index.html           Página Sobre (cartão único)
├── otimizacao/
│   ├── index.html           Entrada do projeto: cartões das categorias (não é um canal)
│   ├── importante.html      Informações importantes (primeiro canal)
│   ├── meu-setup.html       Meu setup
│   └── *.html               Um arquivo por guia ("canal")
├── css/
│   ├── style.css            Design system: cores, fontes, cabeçalho, menu lateral, cartões, switches, alertas…
│   ├── responsivo.css       Ajustes para notebook pequeno, tablet e celular
│   ├── home.css             Estilos e animações da Home
│   └── sobre.css            Estilos exclusivos da página Sobre
├── js/
│   ├── sidebar.js           ★ Menu lateral: ÚNICO lugar onde categorias e canais são escritos
│   ├── navegacao.js         Troca de canal sem recarregar a página
│   ├── main.js              Menu no celular, copiar comandos, formato das listas, contagem de guias
│   ├── home.js              Estrelas e partículas animadas da Home
│   └── menu-topo.js         Posição do menu do topo no celular (não deixa o item atual sumir)
├── imagens/
│   ├── logo.png             Logo (cabeçalho e ícone da aba)
│   └── guias/               Imagens usadas dentro dos guias
├── fontes/                  Fontes Geist e Geist Mono (licença em LICENSE-Geist.txt)
├── atualizar-versao.py      ★ Rode antes de publicar (ver seção 4)
├── atualizar-datas.py       Grava a "Última modificação" dos canais (chamado pelo script acima)
├── .gitignore               Arquivos que o git ignora (temporários do Python)
└── README.md                Este arquivo
```

---

## 3. Duas formas de editar

### A) Pelo site do GitHub (rápido, sem instalar nada)

Bom para corrigir um texto ou trocar um valor.

1. Abra o arquivo no repositório (ex.: `otimizacao/expo.html`).
2. Clique no lápis (**Edit this file**).
3. Faça a mudança e clique em **Commit changes…** → **Commit changes**.
4. Espere ~1 minuto e recarregue o site.

⚠️ **Limitação:** editando pelo site, os scripts da seção 4 **não rodam**. Então:
- a **"Última modificação"** daquele canal **não muda**;
- se você mudou algum **CSS ou JS**, o navegador de quem já visitou pode continuar com o arquivo antigo em cache por alguns minutos.

O script compara cada canal com o **último commit**, então uma edição que já foi enviada pelo site não é detectada depois. Se a data importa para aquela mudança, edite pelo PC (forma B).

### B) No seu PC (recomendado para mudanças maiores)

Precisa de: **Git**, **Python 3** e um editor (sugestão: **VS Code**).

1. **Instalar** (uma vez só):
   - Git: https://git-scm.com/download/win
   - Python: https://www.python.org/downloads/ (na instalação, marque **"Add python.exe to PATH"**)
   - VS Code: https://code.visualstudio.com/
2. **Baixar o repositório** (uma vez só). No terminal (PowerShell ou o terminal do VS Code):
   ```
   git clone https://github.com/RhyanH/NHOOF.git
   cd NHOOF
   ```
3. **Antes de começar a editar**, pegue a versão mais recente:
   ```
   git pull
   ```
4. Edite os arquivos.
5. **Veja o resultado no seu PC** antes de publicar (veja abaixo).
6. **Publique:**
   ```
   python atualizar-versao.py
   git add -A
   git commit -m "Descreva aqui o que mudou"
   git push
   ```

#### Ver o site no seu PC antes de publicar

Abrir o `.html` com dois cliques funciona em parte, mas a troca de canal sem recarregar e algumas coisas só funcionam com um servidor. Na pasta do repositório:

```
python -m http.server 8000
```

Depois abra http://localhost:8000 no navegador. Para parar o servidor: `Ctrl + C` no terminal.

---

## 4. Antes de publicar: os scripts

Sempre que publicar pelo PC, rode **antes do commit**:

```
python atualizar-versao.py
```

Ele faz duas coisas, nesta ordem:

### 4.1 Última modificação de cada canal (`atualizar-datas.py`)

Cada canal do Otimização mostra no canto direito do cabeçalho:

> 🕒 Última modificação: **30/10/2026 às 21:20**

(passando o mouse aparecem os segundos; no celular aparece só o dia)

Regras:
- Vale **só para os canais** do Otimização (`otimizacao/*.html`, menos a página de entrada `index.html`).
- O script compara cada canal com o **último commit**. Se o **conteúdo** do canal mudou (cabeçalho do canal + texto do guia), grava a **data e hora de agora**, no **horário de Brasília**.
- Mudanças que valem para o site inteiro (menu do topo, número de versão do CSS/JS, o próprio relógio) **não** contam como modificação.
- Canal sem mudança mantém a data que já tinha.
- Canal novo, sem data ainda, recebe a data do histórico do git (o último commit que mudou o conteúdo dele) ou, se ainda não tiver commit, a data de agora.
- **Não edite a linha `<time class="channel-update" …>` à mão**: o script cuida dela.

### 4.2 Número de versão do CSS e JS (cache)

O GitHub Pages manda o navegador guardar CSS e JS em cache. Sem cuidado, depois de uma atualização o navegador poderia misturar o HTML novo com um CSS antigo e a página apareceria quebrada.

Por isso todo link local de CSS/JS tem um número de versão no fim:

```html
<link rel="stylesheet" href="../css/style.css?v=202610311102">
```

O script troca esse número (data e hora) em **todas** as páginas, obrigando o navegador a baixar a versão nova. Não precisa mexer nesses números à mão.

---

## 5. Tarefas comuns, passo a passo

### 5.1 Corrigir o texto de um guia

1. Abra `otimizacao/<nome-do-guia>.html`.
2. O conteúdo fica dentro de `<div class="chat-content">`. Altere só o texto.
3. A descrição curta que aparece no topo, ao lado do nome do canal, fica em `<span class="channel-topic">…</span>`.
4. Publique (seção 3).

### 5.2 Criar um guia novo

1. **Copie** um guia parecido de `otimizacao/` e renomeie. Use letras minúsculas, sem acento e com hífen: `novo-guia.html`.
2. Dentro do arquivo novo, troque:
   - `<title>Nome do Guia - NHOOF</title>`
   - o nome do canal: `<span>nome do guia</span>` (logo depois de `<span class="channel-symbol">#</span>`)
   - a descrição: `<span class="channel-topic">Uma frase curta sobre o guia.</span>`
   - o título: `<h1 class="page-title">NOME DO GUIA</h1>`
   - o conteúdo dos cartões (seção 6).
   - **Apague** a linha `<time class="channel-update" …>…</time>` copiada do outro guia (o script cria a correta).
3. Em **`js/sidebar.js`**, adicione uma linha na categoria certa:
   ```js
   ['novo-guia.html', 'nome do guia'],
   ```
   O primeiro texto é o nome do arquivo; o segundo, como aparece no menu (minúsculas, como os outros).
4. A contagem de guias nos cartões da página de entrada se atualiza sozinha.
5. Publique com o script (seção 4).

Modelo mínimo de um guia (o que muda de um guia para outro está marcado com ✏️):

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nome do Guia - NHOOF</title>  <!-- ✏️ -->
    <link rel="icon" type="image/png" href="../imagens/logo.png">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/responsivo.css">
</head>
<body>

    <!-- copie o <header class="global-header"> … </header> inteiro de outro guia,
         junto com a linha <script src="../js/menu-topo.js"></script> logo abaixo dele -->

    <div class="discord-app">
        <div class="sidebar-channels" data-projeto="otimizacao"></div>
        <script src="../js/sidebar.js"></script>

        <div class="main-chat">
            <div class="chat-header">
                <button class="mobile-menu-btn" …>…</button>  <!-- copie de outro guia -->
                <span class="channel-symbol">#</span>
                <span>nome do guia</span>  <!-- ✏️ -->
                <span class="channel-divider">|</span>
                <span class="channel-topic">Frase curta sobre o guia.</span>  <!-- ✏️ -->
            </div>

            <div class="chat-content">
                <h1 class="page-title">NOME DO GUIA</h1>  <!-- ✏️ -->

                <div class="setup-grid">
                    <div class="setup-card">
                        <div>
                            <h3><span class="card-icon">⚙️</span>1. Configuração</h3>  <!-- ✏️ -->
                            <ul>
                                <li class="li-caminho"><span>Caminho</span> <strong>Configurações → Sistema → …</strong></li>
                                <li><span>Nome da opção</span> <strong class="val val-on">Ativado</strong></li>
                            </ul>
                        </div>
                        <div class="card-description">
                            <strong>O que faz:</strong> Explicação do ajuste.  <!-- ✏️ -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="sidebar-overlay"></div>

    <script src="../js/main.js"></script>
    <script src="../js/navegacao.js"></script>
</body>
</html>
```

> Os `?v=…` dos links são colocados pelo script; num arquivo novo pode deixar sem.

### 5.3 Renomear, mover ou remover um guia

- **Renomear no menu:** em `js/sidebar.js`, troque só o segundo texto da linha.
- **Mudar de categoria ou de ordem:** mova a linha para outro bloco/posição em `js/sidebar.js`.
- **Remover:** apague a linha em `js/sidebar.js` e apague o arquivo `.html`. Procure no projeto (no VS Code: `Ctrl + Shift + F`) pelo nome do arquivo, para remover links que apontem para ele (por exemplo os cartões e "chips" de `otimizacao/index.html`).
- **Renomear o arquivo:** renomeie o `.html`, atualize a linha em `js/sidebar.js` e procure links antigos com `Ctrl + Shift + F`.

### 5.4 Criar uma categoria nova

1. Em `js/sidebar.js`, copie um bloco inteiro e troque o título e os canais:
   ```js
   { titulo: '[NOVA CATEGORIA]', canais: [
       ['primeiro-guia.html', 'primeiro guia'],
   ] },
   ```
2. Em `otimizacao/index.html` (página de entrada), copie um cartão `<a class="card" … data-categoria="[BIOS]">` e troque:
   - `href` → o primeiro guia da categoria;
   - `data-categoria` → **exatamente** o mesmo título do `sidebar.js`, com colchetes (ex.: `data-categoria="[NOVA CATEGORIA]"`). É isso que faz a contagem de guias funcionar;
   - o título `<h3>`, a frase `<p>` e, se quiser, o ícone (o `<svg>`).
   - O número em `<span class="card-num"><b>11</b> guias</span>` é preenchido sozinho; pode deixar qualquer número.

### 5.5 Adicionar uma imagem a um guia

1. Coloque a imagem em `imagens/guias/` (prefira `.png` ou `.webp`, com nome sem espaços, ex.: `occt.png`).
2. No guia, dentro do cartão, antes do `<h3>`:
   ```html
   <img class="guia-imagem" src="../imagens/guias/occt.png" width="553" height="277" alt="Descrição da imagem">
   ```
   `width` e `height` são o tamanho real da imagem em pixels (evitam que a página "pule" ao carregar). O `alt` descreve a imagem.

### 5.6 Mudar o menu do topo (Otimização, Projeto 2…, Sobre)

O menu do topo está escrito **em todas as páginas** (`<header class="global-header">`). Para mudar um item, use **Localizar e substituir em todos os arquivos** do VS Code (`Ctrl + Shift + H`), com cuidado:

- nas páginas dentro de `otimizacao/` os links são relativos à pasta (`href="index.html"`, `href="../sobre/index.html"`);
- em `index.html` (Home) são `otimizacao/index.html` e `sobre/index.html`;
- em `sobre/index.html` são `../otimizacao/index.html` e `index.html` (a própria Sobre).

O item da página atual tem `class="active"` (é ele que recebe o neon azul).

### 5.7 Começar um projeto novo (Projeto 2 a 9)

1. Crie a pasta, por exemplo `projeto2/`, com um `index.html` (pode partir de `otimizacao/index.html`).
2. Em **todas** as páginas, troque o `href="#"` do "Projeto 2" pelo caminho certo (ver 5.6) e, nas páginas do projeto novo, coloque `class="active"` nele (e tire do Otimização).
3. Se o projeto tiver menu lateral: em `js/sidebar.js`, crie um bloco ao lado de `otimizacao` (`projeto2: [ … ]`) e use `data-projeto="projeto2"` no espaço do menu das páginas.
4. A "Última modificação" só existe no Otimização. Para usar em outro projeto, mude `PASTA` em `atualizar-datas.py` (ou adapte o script para várias pastas).

### 5.8 Editar a página Sobre ou a Home

- **Sobre:** texto em `sobre/index.html`, estilos em `css/sobre.css`.
- **Home:** `index.html` + `css/home.css` (brilho, NHOOF) + `js/home.js` (estrelas e partículas). No topo do `js/home.js` estão os números que controlam velocidade (`VELOCIDADE`), distância das linhas (`DISTANCIA`), quantidade de partículas (`MAXIMO`) e de estrelas (`AREA_ESTRELA`, `MAX_ESTRELAS`, `FRACAO_PISCAM`).

---

## 6. Componentes dos guias

Todo guia é feito com os mesmos blocos. Use sempre estas classes; **não** crie estilos novos dentro das páginas.

### Cartão de configuração

```html
<div class="setup-grid">                 <!-- grade de cartões -->
    <div class="setup-card">             <!-- um cartão -->
        <div>
            <h3><span class="card-icon">🎮</span>1. Configuração</h3>
            <ul> … linhas … </ul>
        </div>
        <div class="card-description">   <!-- caixa "O que faz" -->
            <strong>O que faz:</strong> Explicação.
        </div>
    </div>
</div>
```

### Linhas da lista

| O que você quer | HTML |
|---|---|
| Opção e valor | `<li><span>Nome da opção</span> <strong>Valor</strong></li>` |
| Switch **ligado** (verde) | `<li><span>Opção</span> <strong class="val val-on">Ativado</strong></li>` |
| Switch **desligado** | `<li><span>Opção</span> <strong class="val val-off">Desativado</strong></li>` |
| Caminho até a opção (trilha no topo) | `<li class="li-caminho"><span>Caminho</span> <strong>Configurações → Jogos → Modo de Jogo</strong></li>` |
| Comando que copia ao clicar | `<li><span>Win + R</span> <strong class="code-line">ncpa.cpl</strong></li>` |

O texto dentro de `val-on`/`val-off` pode ser qualquer um (ON, Ativado, Habilitado, Desmarcar…); a cor vem da classe.

### Passos numerados

```html
<ul class="lista-passos">
    <li><span class="passo-num">1</span><span class="passo-texto"><strong>Primeiro passo</strong></span></li>
    <li><span class="passo-num">2</span><span class="passo-texto"><strong>Segundo passo</strong></span></li>
</ul>
```

### Alertas

```html
<div class="alerts-container">
    <div class="alert-box warning">          <!-- alert-box = informação | warning = atenção (amarelo) | danger = perigo (vermelho) -->
        <div class="alert-icon">⚠️</div>
        <div class="alert-text">
            <p><strong>Aviso:</strong> texto do alerta.</p>
        </div>
    </div>
</div>
```

### Link dentro do texto

```html
<a href="https://site.com" target="_blank" rel="noopener noreferrer">texto do link</a>
```

Links externos sempre com `target="_blank" rel="noopener noreferrer"` (abrem em outra aba com segurança). Links para outro guia: só `href="nome-do-guia.html"`.

---

## 7. O que acontece sozinho

Comportamentos automáticos, para você saber que existem (e onde mexer se precisar):

| O quê | Como funciona | Onde |
|---|---|---|
| **Menu lateral** | Montado a partir da lista em `MENUS`. O canal aberto é marcado pelo nome do arquivo na barra de endereço. | `js/sidebar.js` |
| **Categorias recolhidas** | Clicar no título da categoria recolhe/abre. **Só isso fica salvo** no navegador da pessoa. Ao voltar ao Otimização vindo de outra página, a lista começa do topo e sem canal selecionado. | `js/sidebar.js` |
| **Troca de canal sem recarregar** | Clicar num canal troca só o conteúdo (rápido, o menu não pisca). O endereço muda normalmente; F5, voltar/avançar e compartilhar link funcionam. Se algo falhar, abre a página do jeito normal. | `js/navegacao.js` |
| **Formato das listas** | O navegador mede se algum valor quebraria a linha. Se todos cabem: formato tabela (opção à esquerda, valor à direita). Se algum não cabe: a lista inteira fica com opção em cima e valor embaixo. Linhas com switch ficam sempre em linha. | `js/main.js` |
| **Contagem de guias** | Os cartões da entrada do Otimização contam os canais de cada categoria em `sidebar.js`. | `js/main.js` |
| **Copiar comando** | Clicar num `code-line` copia o texto e mostra "Copiado ✓". | `js/main.js` |
| **Menu do topo no celular** | Em telas estreitas o menu do topo rola de lado. Ao trocar de página, ele volta à posição em que a pessoa o deixou e, se o item da página atual estiver fora da tela, rola até ele (ex.: tocar em "Sobre" não faz o menu voltar ao começo). | `js/menu-topo.js` (carregado logo depois do `<header>` em todas as páginas) |
| **Menu no celular** | Abaixo de 900 px o menu lateral vira uma gaveta (botão ☰ no cabeçalho do canal). | `js/main.js`, `css/responsivo.css` |
| **Última modificação** | Gravada na hora de publicar (seção 4.1). | `atualizar-datas.py` |
| **Versão do CSS/JS** | Gravada na hora de publicar (seção 4.2). | `atualizar-versao.py` |
| **Neon do menu do topo** | O item da página atual (`class="active"`) tem letra em neon pulsando e contorno girando: azul no Otimização, cinza grafite no Sobre. As cores são variáveis (`--neon-…`, `--aro-…`); para outra cor numa página, troque só elas (exemplo no fim de `css/sobre.css`). | `css/style.css` (procure `Item ativo`) |
| **Fundo da Home** | Céu de estrelas (algumas piscam) + partículas com profundidade ligadas por linhas + brilho atrás do NHOOF. Pausa quando a aba fica em segundo plano. | `js/home.js`, `css/home.css` |
| **Qualidade adaptativa da Home** | Se o PC não acompanhar a animação, o fundo tira partículas aos poucos até ficar fluido. PCs bons não perdem nada. | `js/home.js` |

### Animações e a configuração do Windows

Todas as animações do site (fundo da Home, neon do menu, brilhos) **respeitam a configuração de quem visita**: só animam se no Windows estiver ligado **"Animar controles e elementos dentro das janelas"** (`SystemPropertiesPerformance` → Efeitos Visuais). Desligado, tudo aparece **parado**, mas visível. Em outros sistemas, vale a opção "reduzir movimento" do sistema.

Se o fundo da Home aparecer parado no seu PC, é essa opção (o guia *desativar efeitos visuais* a deixa desligada).

---

## 8. Visual: cores, fontes e design system

- **Todo o visual** vem de `css/style.css`. As páginas **não** têm `<style>` próprio: mudar o CSS muda o site inteiro de forma consistente.
- **Cores** ficam em `:root`, no topo do `css/style.css`:

| Variável | Uso | Valor |
|---|---|---|
| `--bg` | Fundo da página | `#09090b` |
| `--surface`, `--surface-2` | Fundo dos cartões | `#111114`, `#16161a` |
| `--line`, `--line-strong` | Bordas | branco 7% / 12% |
| `--text`, `--text-2`, `--text-3` | Texto principal / secundário / apagado | `#ededef`, `#a1a1aa`, `#6b6b76` |
| `--accent` | Azul de destaque | `#8b9cff` |
| `--ok` | Verde (switch ligado) | `#3ecf8e` |
| `--warn` | Amarelo (alerta) | `#f5a524` |
| `--danger` | Vermelho (perigo) | `#f2555a` |

  Cada cor de destaque tem um par `-rgb` (ex.: `--accent-rgb: 139, 156, 255`). **Se mudar a cor, mude o par também**, com os mesmos valores em números.
- **Fontes:** Geist (texto) e Geist Mono (códigos, categorias), salvas em `fontes/` (não dependem do Google Fonts).
- **Tamanhos de tela** (`css/responsivo.css`): até 1180 px o menu do topo fica compacto; até 1020 px o menu do topo rola de lado; até 900 px o menu lateral vira gaveta; até 600 px as listas empilham e a descrição do canal some.

---

## 9. Solução de problemas

| Problema | O que fazer |
|---|---|
| Publiquei e o site não mudou | Espere ~1 min e veja a aba **Actions** (precisa estar verde). Depois recarregue com `Ctrl + F5`. |
| A página aparece sem estilo / quebrada depois de publicar | Cache do navegador: `Ctrl + F5`. Se publicou pelo PC, confira se rodou `python atualizar-versao.py` antes do commit. |
| O fundo da Home está parado | É a opção do Windows "Animar controles e elementos dentro das janelas" (seção 7). Não é erro. |
| Canal novo não aparece no menu | Faltou a linha em `js/sidebar.js`, ou há erro de digitação ali (aspas, vírgula, colchete). Abra o site, aperte `F12` → aba **Console**: um erro em `sidebar.js` aparece em vermelho. |
| Menu lateral sumiu em todas as páginas | Quase sempre é vírgula/aspas faltando em `js/sidebar.js`. Desfaça a última mudança nesse arquivo. |
| Contagem de guias de uma categoria não aparece | O `data-categoria` do cartão em `otimizacao/index.html` precisa ser idêntico ao título em `sidebar.js`, com colchetes. |
| "Última modificação" não mudou | O guia foi editado pelo site do GitHub (o script não roda lá) ou o script não foi rodado antes do commit. |
| `python` não é reconhecido no terminal | Reinstale o Python marcando "Add python.exe to PATH", ou use `py atualizar-versao.py`. |
| `git push` recusado ("rejected", "fetch first") | Alguém (ou você pelo site) mudou algo antes. Rode `git pull` e depois `git push` de novo. |
| Quebrei algo e quero voltar | No GitHub, abra o histórico do arquivo (**History**) para ver versões antigas. Pelo PC: `git log` lista as mudanças e `git revert <código>` desfaz uma delas criando uma mudança nova. |

---

## 10. Regras para não quebrar nada

1. **Menu lateral só em `js/sidebar.js`.** Nunca escreva canais direto nas páginas.
2. **Nada de `<style>` nas páginas.** Estilo novo vai para `css/style.css`, usando as variáveis de cor.
3. **Nomes de arquivo** em minúsculas, sem acentos e sem espaços (`novo-guia.html`).
4. **Mantenha a estrutura** `chat-header` + `chat-content` nos guias: a troca de canal sem recarregar e a data dependem dela.
5. **Não edite** os `?v=…` nem a linha `<time class="channel-update">`: os scripts cuidam deles.
6. **Rode `python atualizar-versao.py` antes de cada publicação feita pelo PC.**
7. **Teste no seu PC** (`python -m http.server 8000`) antes de publicar mudanças grandes, olhando também em tela de celular (`F12` → ícone de celular no topo do painel).

---

## 11. Créditos e licenças

- Fontes **Geist** e **Geist Mono**, da Vercel, sob a licença SIL Open Font License 1.1 (texto completo em `fontes/LICENSE-Geist.txt`).
- Conteúdo dos guias: configurações testadas no meu próprio PC. Os resultados podem variar; faça por sua conta e risco (ver `otimizacao/importante.html`).
