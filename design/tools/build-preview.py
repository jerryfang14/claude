"""Build a single-page preview of site/ for claude.ai artifacts.

The artifact host wraps the file in its own <html>/<head>/<body>, allows stylesheets and
scripts only inline, and wants content readable before any scroll observer runs. So this:
  - keeps the <title> (short name only), inlines main.css with fonts as data URIs,
  - inlines the theme bootstrap and main.js,
  - starts entrance animations from a visible state,
  - copies images and video next to the page at the same relative paths.

Usage: python3 design/tools/build-preview.py <out_dir>
"""
import base64
import pathlib
import re
import shutil
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
SITE = ROOT / "site"
OUT = pathlib.Path(sys.argv[1]).resolve()

html = (SITE / "index.html").read_text(encoding="utf-8")
css = (SITE / "assets/css/main.css").read_text(encoding="utf-8")
js = (SITE / "assets/js/main.js").read_text(encoding="utf-8")


def font_uri(match):
    name = match.group(1)
    data = base64.b64encode((SITE / "assets/fonts" / name).read_bytes()).decode("ascii")
    return f'url("data:font/woff2;base64,{data}")'


css = re.sub(r'url\("\.\./fonts/([^"]+)"\)', font_uri, css)

# Entrances start visible and only slide into place, so a thumbnail or a skim reads everything.
css += """
/* preview: readable at rest */
.js .reveal { opacity: 1; filter: none; }
"""

theme_script = re.search(r"<script>\s*\(function \(\) \{.*?</script>", html, re.S).group(0)
body = re.search(r"<body>(.*)</body>", html, re.S).group(1)
body = body.replace('<script src="assets/js/main.js" defer></script>', "")

page = (
    "<title>Wok Express</title>\n"
    '<meta name="description" content="Wok-fired noodles and rice, cooked one order at a time and ready when you walk in.">\n'
    f"<style>\n{css}\n</style>\n"
    f"{theme_script}\n"
    f"{body.strip()}\n"
    f"<script>\n{js}\n</script>\n"
)

if OUT.exists():
    shutil.rmtree(OUT)
(OUT / "assets").mkdir(parents=True)
(OUT / "wok-express.html").write_text(page, encoding="utf-8")
for sub in ("img", "video"):
    shutil.copytree(SITE / "assets" / sub, OUT / "assets" / sub)

files = sorted(p.relative_to(OUT).as_posix() for p in (OUT / "assets").rglob("*") if p.is_file())
print(f"page {len(page) / 1024:.0f} KiB, {len(files)} asset files")
for f in files:
    print(f)
