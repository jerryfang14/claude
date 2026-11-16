#!/usr/bin/env python3
"""Copy gate: no em or en dashes, no stock words, no exclamation marks in visible copy.

    python3 design/tests/copygate.py
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
STOCK = ['leverage', 'seamless', 'empower', 'unlock', 'robust', 'actionable', 'data-driven', 'solutions', 'elevate',
         'unleash', 'revolutioniz', 'next-gen', 'game-changer', 'delve', 'tapestry', 'testament', 'landscape',
         "it's not just", 'not just', 'oops', 'the future looks', 'many experts']
files = [p for pat in ('site/*.html', 'site/assets/js/*.js', 'site/assets/css/*.css', 'design/legal/*.html') for p in ROOT.glob(pat)]
bad = 0
for path in sorted(files):
    text = path.read_text(encoding='utf-8')
    for n, line in enumerate(text.splitlines(), 1):
        if '—' in line or '–' in line:
            bad += 1; print(f'DASH  {path.relative_to(ROOT)}:{n}')
        low = line.lower()
        for word in STOCK:
            if word in low:
                bad += 1; print(f'WORD  {word!r} {path.relative_to(ROOT)}:{n}: {line.strip()[:90]}')
        if path.suffix == '.html':
            visible = re.sub(r'<[^>]+>', ' ', line)
            if '!' in visible and '<!' not in line and 'important' not in line:
                bad += 1; print(f'BANG  {path.relative_to(ROOT)}:{n}: {visible.strip()[:90]}')
print('copy gate hits:', bad)
sys.exit(1 if bad else 0)
