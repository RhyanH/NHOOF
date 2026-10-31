"""Grava em cada canal do Otimização a data da última modificação.

Aparece no canto direito do cabeçalho do canal:
    Última modificação: 31/10/2026 às 04:07   (horário de Brasília)
Passando o mouse, mostra também os segundos.

Só conta como modificação a mudança no conteúdo do canal (cabeçalho e
texto do guia). Mudanças automáticas que valem para o site inteiro, como
o número de versão do CSS/JS ou o menu do topo, não alteram a data.

Como funciona, para cada otimizacao/*.html (menos a página de entrada):
  - conteúdo diferente do último commit  -> data e hora de agora;
  - sem mudança e já tem data            -> mantém a data;
  - sem data ainda                       -> busca no histórico do git o
                                            último commit que mudou o conteúdo.

Roda sozinho dentro de atualizar-versao.py (o passo de antes de publicar).

Modo automático do GitHub (python atualizar-datas.py --ci), usado por
.github/workflows/datas.yml a cada envio: grava a data dos canais cujo
conteúdo foi mudado num commit que NÃO atualizou a data junto (por exemplo,
uma edição feita direto pelo site do GitHub). A data gravada é a do commit
que mudou o conteúdo. Canais publicados pelo script acima já vêm com a data
certa e não são tocados.
"""
import glob
import os
import re
import subprocess
from datetime import datetime, timezone, timedelta

RAIZ = os.path.dirname(os.path.abspath(__file__))
PASTA = "otimizacao"
IGNORAR = {"index.html"}  # página de entrada: não é um canal

try:
    from zoneinfo import ZoneInfo
    BRASILIA = ZoneInfo("America/Sao_Paulo")
except Exception:  # sem base de fusos: Brasília não tem horário de verão desde 2019
    BRASILIA = timezone(timedelta(hours=-3))

DATA = re.compile(r'\s*<time class="channel-update"[^>]*>.*?</time>', re.S)
ATRIBUTO = re.compile(r'<time class="channel-update" datetime="([^"]+)"')
RELOGIO = ('<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.25" fill="none" '
           'stroke="currentColor" stroke-width="1.3"/><path d="M8 4.8V8l2.2 1.4" fill="none" '
           'stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>')


def git(*args):
    return subprocess.run(["git", *args], cwd=RAIZ, capture_output=True, text=True).stdout


def conteudo(texto):
    """Parte do arquivo que conta como conteúdo do canal, sem a própria data."""
    if texto is None:
        return None
    i = texto.find('<div class="chat-header">')
    j = texto.find('<!-- Camada escura')
    if i < 0 or j < 0:
        return texto
    return " ".join(DATA.sub("", texto[i:j]).split())


def versao_no_git(commit, arquivo):
    r = subprocess.run(["git", "show", f"{commit}:{arquivo}"], cwd=RAIZ, capture_output=True, text=True)
    return r.stdout if r.returncode == 0 else None


def ultima_mudanca(arquivo):
    """Commit mais recente que mudou o conteúdo do canal.

    Devolve (data do commit, versão do arquivo nesse commit, versão anterior)
    ou None se o arquivo ainda não tem histórico.
    """
    commits = [l.split(" ", 1) for l in git("log", "--format=%H %cI", "--", arquivo).splitlines() if l]
    for k, (h, quando) in enumerate(commits):
        texto = versao_no_git(h, arquivo)
        anterior = versao_no_git(commits[k + 1][0], arquivo) if k + 1 < len(commits) else None
        if conteudo(texto) != conteudo(anterior):
            return datetime.fromisoformat(quando), texto, anterior
    return None


def data_no_historico(arquivo):
    """Data do commit mais recente que mudou o conteúdo do canal."""
    achado = ultima_mudanca(arquivo)
    return achado[0] if achado else None


def data_gravada(texto):
    """A linha de data que está no arquivo (ou None)."""
    if texto is None:
        return None
    m = DATA.search(texto)
    return m.group(0).strip() if m else None


def marcador(quando):
    q = quando.astimezone(BRASILIA)
    return (f'\n                <time class="channel-update" datetime="{q.isoformat(timespec="seconds")}" '
            f'title="Última modificação: {q:%d/%m/%Y} às {q:%H:%M:%S} (horário de Brasília)">'
            f'{RELOGIO}<span class="rotulo">Última modificação:</span> <b>{q:%d/%m/%Y}<span class="hora"> às {q:%H:%M}</span></b></time>')


def gravar(caminho, texto, quando):
    """Coloca a data como último item do cabeçalho do canal. Devolve True se mudou o arquivo."""
    sem_data = DATA.sub("", texto)
    i = sem_data.index('<div class="chat-header">')
    fim = sem_data.index("\n            </div>", i)
    novo = sem_data[:fim] + marcador(quando) + sem_data[fim:]
    if novo == texto:
        return False
    with open(caminho, "w", encoding="utf-8") as f:
        f.write(novo)
    return True


def canais():
    for caminho in sorted(glob.glob(os.path.join(RAIZ, PASTA, "*.html"))):
        nome = os.path.basename(caminho)
        if nome in IGNORAR:
            continue
        with open(caminho, encoding="utf-8") as f:
            texto = f.read()
        if '<div class="chat-header">' in texto:
            yield caminho, f"{PASTA}/{nome}", texto


def main_ci():
    """Modo do GitHub: completa as datas que uma edição sem o script deixou para trás."""
    novas = 0
    for caminho, arquivo, texto in canais():
        achado = ultima_mudanca(arquivo)
        if not achado:
            continue
        quando, versao, anterior = achado
        # o commit que mudou o conteúdo também mudou a data? então já está certo
        if data_gravada(versao) and data_gravada(versao) != data_gravada(anterior):
            continue
        if gravar(caminho, texto, quando):
            novas += 1
            print(f"  {arquivo}: {quando.astimezone(BRASILIA):%d/%m/%Y %H:%M:%S}")
    print(f"datas de modificação completadas em {novas} canais")


def main():
    agora = datetime.now(timezone.utc)
    novas = 0
    for caminho, arquivo, texto in canais():
        existente = ATRIBUTO.search(texto)
        mudou = conteudo(texto) != conteudo(versao_no_git("HEAD", arquivo))
        if mudou:
            quando = agora
        elif existente:
            continue
        else:
            quando = data_no_historico(arquivo) or agora
        if gravar(caminho, texto, quando):
            novas += 1
    print(f"datas de modificação atualizadas em {novas} canais")


if __name__ == "__main__":
    import sys
    main_ci() if "--ci" in sys.argv else main()
