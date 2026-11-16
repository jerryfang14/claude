#!/usr/bin/env python3
"""Rebuilds the inline icon sprite in site/index.html from Phosphor Icons (Light weight, MIT).

    npm i @phosphor-icons/core
    python3 design/tools/sprite.py node_modules/@phosphor-icons/core/assets/light
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
ICONS = {  # id used in the page -> Phosphor icon name
    'arrow': 'arrow-up-right', 'check': 'check', 'lock': 'lock-simple',
    'calendar': 'calendar-check', 'calblank': 'calendar-blank', 'store': 'storefront', 'tray': 'tray',
    'chart': 'chart-line-up', 'film': 'film-strip', 'chat': 'chat-circle-dots', 'receipt': 'receipt',
    'funnel': 'funnel', 'plane': 'paper-plane-tilt', 'pencil': 'pencil-simple-line', 'book': 'address-book',
    'star': 'star', 'file': 'file-text', 'handshake': 'handshake', 'notepad': 'notepad', 'clock': 'clock',
    'envelope': 'envelope-simple', 'table': 'table', 'sync': 'arrows-clockwise', 'question': 'question',
    'translate': 'translate', 'pen': 'pen-nib', 'package': 'package', 'bell': 'bell', 'tag': 'tag',
    'phone': 'phone', 'megaphone': 'megaphone', 'card': 'credit-card', 'signpost': 'signpost',
    'search': 'magnifying-glass',
}
FANG = ('<symbol id="i-fang" viewBox="0 0 100 100"><rect x="8" y="4" width="84" height="9" rx="4.5" style="fill:var(--red)"/>'
        '<path d="M16 20H45C45 47 42 70 37 94C30 70 20 48 16 20Z"/><path d="M55 20H84C80 48 70 70 63 94C58 70 55 47 55 20Z"/></symbol>')

def main(src):
    src = pathlib.Path(src)
    rows = []
    for key, name in ICONS.items():
        svg = (src / f'{name}-light.svg').read_text()
        box = re.search(r'viewBox="([^"]+)"', svg).group(1)
        inner = re.search(r'<svg[^>]*>(.*)</svg>', svg, re.S).group(1).strip()
        rows.append(f'  <symbol id="i-{key}" viewBox="{box}">{inner}</symbol>')
    rows.append('  ' + FANG)
    block = ('<!-- sprite:start (Phosphor Light, built by design/tools/sprite.py) -->\n'
             '<svg width="0" height="0" style="position:absolute" aria-hidden="true">\n' + '\n'.join(rows) + '\n</svg>\n<!-- sprite:end -->')
    page = ROOT / 'site' / 'index.html'
    html = page.read_text()
    if '<!-- sprite -->' in html:
        html = html.replace('<!-- sprite -->', block)
    else:
        html, n = re.subn(r'<!-- sprite:start.*?<!-- sprite:end -->', lambda m: block, html, flags=re.S)
        assert n == 1, 'sprite markers not found'
    used = set(re.findall(r'href="#i-([a-z]+)"', html))
    missing = used - set(ICONS) - {'fang'}
    assert not missing, f'icons used but not in the sprite: {missing}'
    unused = set(ICONS) - used
    if unused: print('note: in the sprite but unused:', sorted(unused))
    page.write_text(html)
    print(f'sprite: {len(rows)} symbols')

if __name__ == '__main__':
    main(sys.argv[1])
