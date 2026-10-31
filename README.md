# NHOOF

Site pessoal com guias de otimização de PC, publicado no GitHub Pages.

## Estrutura

| Caminho | O que é |
|---|---|
| `index.html` | Página inicial: o NHOOF sobre o fundo animado |
| `sobre/index.html` | Página Sobre |
| `otimizacao/index.html` | Entrada da Otimização (fora do menu lateral): acesso rápido às categorias |
| `otimizacao/importante.html` | Informações importantes |
| `otimizacao/*.html` | Um arquivo por guia |
| `css/style.css` | Design system: todas as cores, cartões, switches e alertas |
| `css/responsivo.css` | Ajustes para tablet e celular |
| `css/home.css` | Estilos e animações da página inicial |
| `css/sobre.css` | Estilos exclusivos da página Sobre |
| `js/sidebar.js` | Menu lateral (categorias e guias); a Home lê a contagem daqui |
| `js/navegacao.js` | Troca de página sem recarregar |
| `js/main.js` | Menu no celular e "clique para copiar" nos comandos |
| `js/home.js` | Partículas do fundo animado da página inicial |
| `fontes/` | Fontes Geist e Geist Mono (licença OFL, em `LICENSE-Geist.txt`) |

## Antes de publicar

Antes de cada publicação, rode:

```
python atualizar-versao.py
```

Ele faz duas coisas:

- grava em cada canal do Otimização a **última modificação** (canto direito do cabeçalho), só nos canais cujo conteúdo mudou desde o último commit (via `atualizar-datas.py`, horário de Brasília);
- coloca um número de versão novo nos endereços (`style.css?v=...`) de todas as páginas, para o navegador não misturar o HTML novo com um CSS antigo guardado em cache.

## Como usar os componentes

- **Mudar o visual:** altere os tokens em `:root`, no topo de `css/style.css`. As páginas não têm `<style>` próprio.
- **Novo guia:** copie uma página de `otimizacao/` e adicione uma linha em `js/sidebar.js`.
- **Switch ON/OFF:** `<strong class="val val-on">ON</strong>` ou `<strong class="val val-off">OFF</strong>`.
- **Formato da lista** é automático e vale para a lista inteira (`js/main.js` mede no navegador):
  - tabela: todos os valores cabem numa linha (rótulo à esquerda, valor à direita);
  - `lista-instrucoes`: algum valor quebraria a linha, então todos ficam com rótulo em cima e valor embaixo;
  - `lista-passos`: passos numerados, com `<li><span class="passo-num">1</span><span class="passo-texto">texto</span></li>`;
  - linhas com switch ON/OFF ficam sempre em linha;
  - uma linha `Caminho` no topo da lista vira a trilha de navegação (`<li class="li-caminho">`).
- **Comando copiável:** `<strong class="code-line">comando</strong>`.
- **Alertas:** `alert-box`, `alert-box warning` ou `alert-box danger`.
- **Ícone do título:** `<h3><span class="card-icon">⚙️</span>Título</h3>`.
