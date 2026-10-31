"""Confere o site antes de publicar. Usa só o Python padrão (não precisa instalar nada).

Como usar, na pasta do repositório:
    python verificar-site.py

No fim aparece "TUDO CERTO" ou a lista de problemas (com arquivo e motivo).
Problemas impedem a publicação; avisos são só para conferir.

O que é conferido:
  - links e arquivos locais (CSS, JS, imagens, páginas) existem;
  - links externos abrem em outra aba com segurança (target="_blank" rel="noopener noreferrer");
  - imagens têm texto alternativo (alt) e, nos guias, largura e altura;
  - nenhuma página tem <style> próprio (o visual fica todo em css/);
  - CSS e JS locais têm número de versão (?v=), todos iguais;
  - menu do topo: script menu-topo.js logo depois do <header> e um item ativo por página;
  - menu lateral (js/sidebar.js) e arquivos de otimizacao/ batem, sem repetidos;
  - cartões da entrada do Otimização (data-categoria) têm o mesmo nome das categorias;
  - cada canal tem a estrutura completa e uma data de "Última modificação";
  - switches usam val-on ou val-off.
"""
import glob
import os
import re
import sys

RAIZ = os.path.dirname(os.path.abspath(__file__))
problemas = []
avisos = []


def rel(caminho):
    return os.path.relpath(caminho, RAIZ).replace(os.sep, "/")


def ler(caminho):
    with open(caminho, encoding="utf-8") as f:
        return f.read()


paginas = sorted(p for p in glob.glob(os.path.join(RAIZ, "**", "*.html"), recursive=True)
                 if "/.git/" not in p.replace(os.sep, "/"))

# ---- Todas as páginas --------------------------------------------------------
versoes = {}
for caminho in paginas:
    nome = rel(caminho)
    texto = ler(caminho)
    pasta = os.path.dirname(caminho)

    if re.search(r"<style[\s>]", texto, re.I):
        problemas.append(f"{nome}: tem <style> próprio (mova o estilo para css/style.css)")
    if not re.search(r"<title>[^<]+</title>", texto):
        problemas.append(f"{nome}: sem <title>")

    # links e arquivos locais
    for atributo, endereco in re.findall(r'\b(href|src)="([^"]*)"', texto):
        if not endereco or endereco.startswith(("#", "http://", "https://", "//", "mailto:", "data:", "tel:")):
            continue
        limpo = endereco.split("#")[0].split("?")[0]
        if not limpo:
            continue
        alvo = os.path.normpath(os.path.join(pasta, limpo))
        if not os.path.exists(alvo):
            problemas.append(f"{nome}: link quebrado {atributo}=\"{endereco}\"")
        if limpo.endswith((".css", ".js")):
            v = re.search(r"\?v=([^\"&#]+)", endereco)
            if not v:
                problemas.append(f"{nome}: {limpo} sem número de versão (?v=) — rode python atualizar-versao.py")
            else:
                versoes.setdefault(v.group(1), []).append(nome)

    # links externos
    for tag in re.findall(r'<a\b[^>]*href="https?://[^"]*"[^>]*>', texto):
        if 'target="_blank"' not in tag or "noopener" not in tag:
            problemas.append(f"{nome}: link externo sem target=\"_blank\" rel=\"noopener noreferrer\": {tag[:90]}")

    # imagens
    for tag in re.findall(r"<img\b[^>]*>", texto):
        if not re.search(r'\balt="[^"]*"', tag):
            problemas.append(f"{nome}: imagem sem alt: {tag[:90]}")
        if "guia-imagem" in tag and not (re.search(r'\bwidth="\d+"', tag) and re.search(r'\bheight="\d+"', tag)):
            problemas.append(f"{nome}: imagem de guia sem width/height (a página pula ao carregar): {tag[:90]}")

    # menu do topo
    if "<header" in texto:
        if not re.search(r'</header>\s*<script src="[^"]*js/menu-topo\.js[^"]*"></script>', texto):
            problemas.append(f"{nome}: falta <script src=\".../js/menu-topo.js\"> logo depois do </header>")
        nav = re.search(r"<nav>(.*?)</nav>", texto, re.S)
        ativos = len(re.findall(r'class="active"', nav.group(1))) if nav else 0
        esperado = 0 if nome == "index.html" else 1
        if ativos != esperado:
            problemas.append(f"{nome}: menu do topo com {ativos} item(ns) ativo(s); o esperado é {esperado}")

    # switches
    for classe in re.findall(r'class="(val\b[^"]*)"', texto):
        partes = classe.split()
        if "val" in partes and not ({"val-on", "val-off"} & set(partes)):
            problemas.append(f"{nome}: switch sem val-on/val-off: class=\"{classe}\"")

if len(versoes) > 1:
    avisos.append("CSS/JS com números de versão diferentes entre as páginas: " + ", ".join(sorted(versoes))
                  + " — rode python atualizar-versao.py")

# ---- Menu lateral x arquivos do Otimização ----------------------------------
sidebar = ler(os.path.join(RAIZ, "js", "sidebar.js"))
bloco = re.search(r"otimizacao:\s*\[(.*?)\n\s*\]\s*\n\s*\};", sidebar, re.S)
if not bloco:
    problemas.append("js/sidebar.js: não encontrei o bloco 'otimizacao: [ ... ]' (vírgula, colchete ou aspas faltando?)")
    titulos, canais, por_categoria = [], [], {}
else:
    titulos = re.findall(r"titulo:\s*'([^']+)'", bloco.group(1))
    canais = re.findall(r"\['([^']+)',\s*'([^']+)'\]", bloco.group(1))
    # canais de cada categoria
    por_categoria = {t: re.findall(r"\['([^']+)',", c)
                     for t, c in re.findall(r"titulo:\s*'([^']+)',\s*canais:\s*\[(.*?)\]\s*\}", bloco.group(1), re.S)}

arquivos_menu = [c[0] for c in canais]
for repetido in sorted({a for a in arquivos_menu if arquivos_menu.count(a) > 1}):
    problemas.append(f"js/sidebar.js: '{repetido}' aparece mais de uma vez no menu")
for arquivo in arquivos_menu:
    if not os.path.exists(os.path.join(RAIZ, "otimizacao", arquivo)):
        problemas.append(f"js/sidebar.js: o canal '{arquivo}' não existe em otimizacao/")

canais_pasta = sorted(os.path.basename(p) for p in glob.glob(os.path.join(RAIZ, "otimizacao", "*.html"))
                      if os.path.basename(p) != "index.html")
for arquivo in canais_pasta:
    if arquivo not in arquivos_menu:
        problemas.append(f"otimizacao/{arquivo}: não está no menu lateral (adicione uma linha em js/sidebar.js)")

# ---- Entrada do Otimização: cartões x categorias ----------------------------
entrada = ler(os.path.join(RAIZ, "otimizacao", "index.html"))
cartoes = re.findall(r'data-categoria="([^"]+)"', entrada)
for c in cartoes:
    if c not in titulos:
        problemas.append(f"otimizacao/index.html: data-categoria=\"{c}\" não é igual a nenhuma categoria de js/sidebar.js")
destaque = re.search(r'card-destaque.*?</a>', entrada, re.S)
texto_destaque = destaque.group(0) if destaque else ""
for t in titulos:
    if t in cartoes:
        continue
    # categorias do começo ([BEM VINDO], [PEN DRIVE]) ficam no cartão "Antes de tudo"
    nomes_menu = [n for a, n in canais if a in por_categoria.get(t, [])]
    if not any(f"<li>{n}</li>" in texto_destaque for n in nomes_menu):
        avisos.append(f"categoria {t} não tem cartão na entrada do Otimização (otimizacao/index.html)")
if "channel-update" in entrada:
    problemas.append("otimizacao/index.html: a entrada não é um canal e não deve ter 'Última modificação'")

# ---- Estrutura de cada canal ------------------------------------------------
for arquivo in canais_pasta:
    nome = f"otimizacao/{arquivo}"
    texto = ler(os.path.join(RAIZ, "otimizacao", arquivo))
    for trecho, motivo in (
        ('<div class="sidebar-channels" data-projeto="otimizacao"></div>', "espaço do menu lateral"),
        ('<div class="chat-header">', "cabeçalho do canal (chat-header)"),
        ('<span class="channel-symbol">#</span>', "símbolo # do canal"),
        ('<span class="channel-topic">', "descrição do canal (channel-topic)"),
        ('<div class="chat-content">', "conteúdo (chat-content)"),
        ('<h1 class="page-title">', "título da página (page-title)"),
        ('<div class="sidebar-overlay"></div>', "camada do menu no celular (sidebar-overlay)"),
        ("js/sidebar.js", "script js/sidebar.js"),
        ("js/main.js", "script js/main.js"),
        ("js/navegacao.js", "script js/navegacao.js"),
    ):
        if trecho not in texto:
            problemas.append(f"{nome}: falta {motivo}")
    if "<!-- Camada escura" not in texto:
        avisos.append(f"{nome}: falta o comentário '<!-- Camada escura' (a data de modificação usa ele como marcador)")
    datas = re.findall(r'<time class="channel-update" datetime="[^"]+"', texto)
    if len(datas) != 1:
        problemas.append(f"{nome}: {len(datas)} datas de 'Última modificação' (o certo é 1) — rode python atualizar-versao.py")
    titulo = re.search(r"<title>([^<]+)</title>", texto)
    if titulo and not titulo.group(1).endswith(" - NHOOF"):
        avisos.append(f"{nome}: o <title> costuma terminar com ' - NHOOF' (está '{titulo.group(1)}')")

# ---- Resultado ---------------------------------------------------------------
print(f"{len(paginas)} páginas, {len(canais_pasta)} canais, {len(titulos)} categorias conferidas\n")
for a in avisos:
    print("AVISO   ", a)
for p in problemas:
    print("PROBLEMA", p)
if problemas:
    print(f"\n{len(problemas)} problema(s). Corrija antes de publicar.")
    sys.exit(1)
print("\nTUDO CERTO" + (f" ({len(avisos)} aviso(s) para conferir)" if avisos else ""))
