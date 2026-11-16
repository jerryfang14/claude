#!/usr/bin/env python3
"""Contrast math for both themes, read straight from the tokens in site/assets/css/main.css.

    python3 design/tests/contrast.py

WCAG AA: 4.5:1 for text, 3:1 for large text (24px, or 18.66px bold) and for the edges of controls.
"""
import re, sys, pathlib

CSS = (pathlib.Path(__file__).resolve().parents[2] / 'site/assets/css/main.css').read_text()


def tokens(selector):
    block = re.search(re.escape(selector) + r'\s*\{(.*?)\n\}', CSS, re.S).group(1)
    return dict((k, v.strip()) for k, v in re.findall(r'(--[\w-]+):\s*([^;]+);', block))


def rgba(value):
    value = value.strip()
    if value.startswith('#'):
        h = value[1:]
        return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)] + [1.0]
    nums = [float(n) for n in re.findall(r'[\d.]+', value)]
    return [nums[0] / 255, nums[1] / 255, nums[2] / 255, nums[3] if len(nums) > 3 else 1.0]


def over(fg, bg):
    a = fg[3]
    return [a * fg[i] + (1 - a) * bg[i] for i in range(3)] + [1.0]


def lum(c):
    f = lambda x: x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])


def ratio(a, b):
    la, lb = lum(a), lum(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


# (label, foreground, background, minimum). A "+" stacks a translucent token over a solid one.
PAIRS = [
    ('body text on page', 'ink', 'bg', 4.5),
    ('muted text on page', 'muted', 'bg', 4.5),
    ('muted text on tinted card', 'muted', 'surface', 4.5),
    ('muted text on card', 'muted', 'card', 4.5),
    ('placeholder and dimmed titles (large)', 'faint', 'bg', 3.0),
    ('dimmed premise words (large)', 'ink@0.5+bg', 'bg', 3.0),
    ('small blue labels on page', 'sky-text', 'bg', 4.5),
    ('small blue labels on tinted card', 'sky-text', 'surface', 4.5),
    ('eyebrow on its tint', 'sky-text', 'sky-soft+bg', 4.5),
    ('nav link on its highlight', 'ink', 'sky-soft+bg', 4.5),
    ('text on sky blue', 'on-sky', 'sky', 4.5),
    ('secondary text on sky blue', 'sky-muted', 'sky', 4.5),
    ('text on cards in the blue world', 'ink', 'card', 4.5),
    ('text on the dark card', 'on-card-alt', 'card-alt', 4.5),
    ('muted text on the dark card', 'muted-alt', 'card-alt', 4.5),
    ('button label on red', 'on-red', 'red', 4.5),
    ('red headline words (large)', 'red', 'bg', 3.0),
    ('small red text: errors, ticket numbers', 'red-text', 'bg', 4.5),
    ('small red text on card', 'red-text', 'card', 4.5),
    ('globe tiles at the back', 'ink', 'tile-back', 4.5),
    ('inverted pills', 'bg', 'ink', 4.5),
    ('input edge on its fill', 'field-ring+bg', 'bg', 3.0),
    ('input edge against the card', 'field-ring+bg', 'card', 3.0),
    ('focus ring on page', 'ink', 'bg', 3.0),
    ('focus ring on sky blue', 'on-sky', 'sky', 3.0),
]


def resolve(name, t):
    if '+' in name:
        top, base = name.split('+')
        return over(resolve(top, t), resolve(base, t))
    if '@' in name:
        tok, alpha = name.split('@')
        c = rgba(t['--' + tok]); c[3] = float(alpha)
        return c
    return rgba(t['--' + name])


def main():
    day = tokens(':root')
    night = dict(day); night.update(tokens(':root[data-mode="night"]'))
    bad = 0
    for mode, t in (('day', day), ('night', night)):
        for label, fg, bg, need in PAIRS:
            r = ratio(resolve(fg, t), resolve(bg, t))
            ok = r >= need
            bad += not ok
            print(f"{mode:5} {r:5.2f} (needs {need}) {'ok  ' if ok else 'FAIL'} {label}")
    print('contrast failures:', bad)
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
