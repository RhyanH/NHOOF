"""Atualiza a versão dos arquivos CSS e JS em todas as páginas do site.

Por que existe: o GitHub Pages manda o navegador guardar CSS e JS em cache
por alguns minutos. Sem um número de versão no endereço, depois de uma
atualização o navegador pode misturar o HTML novo com um CSS antigo e a
página aparece quebrada até o cache expirar.

Como usar (antes de publicar qualquer mudança de CSS ou JS):
    python atualizar-versao.py

Antes, roda atualizar-datas.py, que grava em cada canal do Otimização a
data da última modificação do conteúdo.

Ele troca, em todos os .html, os endereços locais de .css e .js por
arquivo.css?v=<data e hora>, forçando o navegador a baixar a versão nova.
"""
import glob
import os
import re
from datetime import datetime

RAIZ = os.path.dirname(os.path.abspath(__file__))

# 1) data da última modificação de cada canal do Otimização
import importlib.util
_spec = importlib.util.spec_from_file_location("atualizar_datas", os.path.join(RAIZ, "atualizar-datas.py"))
_datas = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_datas)
_datas.main()

# 2) versão dos arquivos CSS e JS
versao = datetime.now().strftime("%Y%m%d%H%M")

padrao = re.compile(r'((?:href|src)="(?!https?:|//)[^"?#]+\.(?:css|js))(?:\?v=[^"]*)?"')

alterados = 0
for caminho in glob.glob(os.path.join(RAIZ, "**", "*.html"), recursive=True):
    with open(caminho, encoding="utf-8") as f:
        texto = f.read()
    novo = padrao.sub(lambda m: f'{m.group(1)}?v={versao}"', texto)
    if novo != texto:
        with open(caminho, "w", encoding="utf-8") as f:
            f.write(novo)
        alterados += 1

print(f"versão {versao} aplicada em {alterados} páginas")
