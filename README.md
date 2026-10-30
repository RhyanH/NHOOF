# NHOOF

Site pessoal com guias de otimização de PC, publicado no GitHub Pages.

## Estrutura

| Caminho | O que é |
|---|---|
| `index.html` | Página inicial |
| `otimizacao/*.html` | Um arquivo por guia |
| `css/style.css` | Design system: todas as cores, cartões, switches e alertas |
| `css/responsivo.css` | Ajustes para tablet e celular |
| `css/home.css` | Estilos exclusivos da página inicial |
| `js/sidebar.js` | Menu lateral (categorias e guias); a Home lê a contagem daqui |
| `js/navegacao.js` | Troca de página sem recarregar |
| `js/main.js` | Menu no celular e "clique para copiar" nos comandos |
| `js/home.js` | Partículas e efeitos da página inicial |
| `fontes/` | Fontes Geist e Geist Mono (licença OFL, em `LICENSE-Geist.txt`) |

## Como usar os componentes

- **Mudar o visual:** altere os tokens em `:root`, no topo de `css/style.css`. As páginas não têm `<style>` próprio.
- **Novo guia:** copie uma página de `otimizacao/` e adicione uma linha em `js/sidebar.js`.
- **Switch ON/OFF:** `<strong class="val val-on">ON</strong>` ou `<strong class="val val-off">OFF</strong>`.
- **Valor longo** (caminho, aviso, comando) numa lista: use `<li class="li-longa">` para o valor ocupar a largura toda.
- **Comando copiável:** `<strong class="code-line">comando</strong>`.
- **Alertas:** `alert-box`, `alert-box warning` ou `alert-box danger`.
- **Ícone do título:** `<h3><span class="card-icon">⚙️</span>Título</h3>`.
