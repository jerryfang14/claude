#!/usr/bin/env python3
"""Builds a single-file preview of the site for the Claude artifact viewer.

    python3 design/tools/bundle.py <out.html>

Everything is inlined: styles, scripts and fonts. The legal pages become pop-up sheets, because a
single file cannot hold separate pages. The real site in site/ keeps them as real pages.
"""
import re, sys, base64, pathlib, importlib.util

ROOT = pathlib.Path(__file__).resolve().parents[2]
SITE = ROOT / 'site'
spec = importlib.util.spec_from_file_location('pages', ROOT / 'design/tools/pages.py')
pages = importlib.util.module_from_spec(spec); spec.loader.exec_module(pages)

html = (SITE / 'index.html').read_text()
css = (SITE / 'assets/css/main.css').read_text()
for name in ('bricolage-grotesque', 'geist', 'geist-mono'):
    data = base64.b64encode((SITE / f'assets/fonts/{name}.woff2').read_bytes()).decode()
    css = css.replace(f'url("../fonts/{name}.woff2")', f'url(data:font/woff2;base64,{data})')
assert '../fonts/' not in css
css += '\n.js .reveal { opacity: 1; transform: none; filter: none; }\n'   # the viewer wants content readable at rest
css += '.lic summary { cursor: pointer; text-decoration: underline; text-underline-offset: 4px; }\n.lic pre { white-space: pre-wrap; font: 12px/1.5 var(--mono); max-height: 240px; overflow: auto; }\n'

head = re.search(r'<head>(.*)</head>', html, re.S).group(1)
theme = re.search(r'<script>.*?</script>', head, re.S).group(0)
body = re.search(r'<body[^>]*>(.*)</body>', html, re.S).group(1)
body = re.sub(r'<script src="assets/js/[\w.]+" defer></script>\n?', '', body)

def sheet(name, title):
    frag = pages.fragment(name)
    frag = re.sub(r'\bid="([\w-]+)"', lambda m: f'id="{name}-{m.group(1)}"', frag)
    def license_text(m):
        text = (SITE / m.group(1)).read_text().replace('&', '&amp;').replace('<', '&lt;')
        return f'<details class="lic"><summary>{m.group(2)}</summary><pre>{text}</pre></details>'
    frag = re.sub(r'<a href="(assets/licenses/[\w.-]+)">([^<]+)</a>', license_text, frag)
    return (f'<dialog class="legal-dialog" id="dlg-{name}" aria-label="{title}">\n'
            f'<button class="pill close" type="button" data-close>Close</button>\n<div class="legal">\n{frag}\n</div>\n</dialog>')

sheets = '\n'.join(sheet(n, t) for n, _, t, _ in pages.PAGES if n != '404')

glue = r"""
(function () {
  var names = /^(privacy|terms|refunds|cookies|licenses)\.html(?:#([\w-]+))?$/;
  function closeAll() { Array.prototype.forEach.call(document.querySelectorAll('dialog[open]'), function (d) { d.close(); }); }
  function open(name, hash) {
    closeAll();
    var d = document.getElementById('dlg-' + name);
    d.showModal(); d.scrollTop = 0;
    var target = hash && document.getElementById(name + '-' + hash);
    if (target) target.scrollIntoView();
  }
  document.addEventListener('click', function (e) {
    var el = e.target;
    if (el.closest('[data-close]') || (el.tagName === 'DIALOG')) { closeAll(); return; }
    if (el.closest('dialog [data-open-consent]')) { closeAll(); var b = document.querySelector('#consent button'); if (b) b.focus(); return; }
    var a = el.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href'), page = names.exec(href), topic = /^index\.html\?topic=([a-z]+)#contact$/.exec(href);
    if (page) { e.preventDefault(); open(page[1], page[2]); }
    else if (topic) { e.preventDefault(); closeAll(); window.DF.setTopic(topic[1]); document.getElementById('contact').scrollIntoView(); }
    else if (/^index\.html#/.test(href)) { e.preventDefault(); closeAll(); document.querySelector(href.slice(10)).scrollIntoView(); }
  });
})();
"""

js = (SITE / 'assets/js/site.js').read_text() + '\n' + (SITE / 'assets/js/main.js').read_text() + glue
out = (f'<title>Double Fang</title>\n{theme}\n<style>\n{css}</style>\n'
       f'<script>document.body.classList.add("load");</script>\n{body}\n{sheets}\n<script>\n{js}</script>\n')
assert '</script' not in js.lower() and 'src="assets/' not in out and 'href="assets/' not in out, 'something still points at a separate file'
pathlib.Path(sys.argv[1]).write_text(out)
print(f'bundle: {len(out) / 1024:.0f} KB')
