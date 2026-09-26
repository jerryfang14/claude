# Builds a single-file preview for the Artifact viewer: python3 design/tools/bundle.py <out.html>
import re, base64, sys, pathlib
S = pathlib.Path(__file__).resolve().parents[2] / 'site'
html = (S / 'index.html').read_text()
css = (S / 'assets/css/main.css').read_text()
for f in ['bricolage-grotesque', 'geist', 'geist-mono']:
    b = base64.b64encode((S / f'assets/fonts/{f}.woff2').read_bytes()).decode()
    css = css.replace(f'url("../fonts/{f}.woff2")', f'url(data:font/woff2;base64,{b})')
css += '\n.js .reveal { opacity: 1; transform: none; filter: none; }\n'
js = (S / 'assets/js/main.js').read_text()
head = re.search(r'<head>(.*)</head>', html, re.S).group(1)
body = re.search(r'<body[^>]*>(.*)</body>', html, re.S).group(1)
head = re.sub(r'<(link|meta)[^>]*>\n?', '', head).replace('<title>Double Fang | AI that actually does the work</title>', '<title>Double Fang</title>')
body = body.replace('<script src="assets/js/main.js" defer></script>', f'<script>{js}</script>')
out = f'{head}\n<style>{css}</style>\n<div class="load">{body}</div>'
out = out.replace("document.body.classList.remove('load')", "document.querySelector('.load') && document.querySelector('.load').classList.remove('load')")
pathlib.Path(sys.argv[1]).write_text(out)
print(len(out))
