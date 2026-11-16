#!/usr/bin/env python3
"""Builds the legal pages and the 404 page in site/ from the plain fragments in design/legal/.

The privacy banner, footer and theme script are copied from site/index.html, so every page stays
in step with the home page. Change the business details in SITE below, then run:

    python3 design/tools/pages.py
"""
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT, SRC = ROOT / 'site', ROOT / 'design' / 'legal'

SITE = {
    'EMAIL': 'jerrydfang@gmail.com',
    'PLACE': 'Ontario, Canada',
    'DATE': 'November 16, 2026',
}
PAGES = [  # file, nav label, title, description
    ('privacy', 'Privacy', 'Privacy policy', 'What Double Fang collects, why, and how to see, fix or delete it.'),
    ('terms', 'Terms', 'Terms of service', 'The plain-language terms for using the Double Fang website and working with us.'),
    ('refunds', 'Refunds', 'Refund policy', 'Full refund until work starts, pay only for finished stages, cancel monthly plans anytime.'),
    ('cookies', 'Cookies', 'Cookie policy', 'This site sets no cookies. Here is the little it saves in your browser.'),
    ('licenses', None, 'Licenses and credits', 'The open licenses behind the fonts and icons on the Double Fang website.'),
    ('404', None, 'Page not found', 'This page does not exist.'),
]

home = (OUT / 'index.html').read_text()
def grab(pattern):
    m = re.search(pattern, home, re.S)
    assert m, pattern
    return m.group(0)

CONSENT = grab(r'<section class="consent".*?</section>')
FOOTER = grab(r'<footer>.*?</footer>').replace('href="#', 'href="index.html#')
THEME = grab(r'<script>\s*\(function \(\) \{\s*var d = document\.documentElement.*?</script>')
SPRITE = '\n'.join('  ' + grab(r'<symbol id="%s".*?</symbol>' % i) for i in ('i-arrow', 'i-fang'))

SHELL = '''<!DOCTYPE html>
<html lang="en" data-mode="day">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
{extra}<title>{title} | Double Fang</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#fdfdfe">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<link rel="preload" href="assets/fonts/bricolage-grotesque.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/geist.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/main.css">
{theme}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

{consent}

<svg width="0" height="0" style="position:absolute" aria-hidden="true">
{sprite}
</svg>

<div class="grain" aria-hidden="true"></div>

<header class="nav simple">
  <a class="brand" href="index.html" aria-label="Double Fang home"><svg class="mark" viewBox="0 0 100 100" aria-hidden="true"><use href="#i-fang"/></svg>Double Fang</a>
  <ul class="nav-links legal-nav">
{nav}
  </ul>
  <div class="nav-right">
    <a class="btn btn-sm" href="index.html#contact">Book a call<span class="btn-icon"><svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></span></a>
  </div>
</header>

<main id="main" class="legal wrap">
{body}
</main>

{footer}

<script src="assets/js/site.js" defer></script>
</body>
</html>
'''

def fill(text):
    for key, value in SITE.items():
        text = text.replace('{{%s}}' % key, value)
    assert '{{' not in text, 'unfilled placeholder'
    return text

def fragment(name):
    return fill((SRC / f'{name}.html').read_text()).strip()

def build():
    for name, _, title, desc in PAGES:
        nav = '\n'.join(
            '    <li><a href="%s.html"%s>%s</a></li>' % (n, ' aria-current="page"' if n == name else '', label)
            for n, label, _, _ in PAGES if label)
        extra = '<base href="/">\n<meta name="robots" content="noindex">\n' if name == '404' else ''
        page = SHELL.format(extra=extra, title=title, desc=desc, theme=THEME, consent=CONSENT, sprite=SPRITE,
                            nav=nav, body=fragment(name), footer=FOOTER)
        (OUT / f'{name}.html').write_text(page)
        print('built', f'{name}.html')

if __name__ == '__main__':
    build()
