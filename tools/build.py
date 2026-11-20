#!/usr/bin/env python3
"""Baut die drei Sprachversionen der Deheim-Website.

Quelle:   src/*.html (Englisch), i18n/de.json und i18n/fr.json (Übersetzungen),
          content/legal/<sprache>.md (Impressum und Datenschutz).
Ausgabe:  Deutsch im Hauptordner (/), Englisch in en/, Französisch in fr/.

Aufruf im Projektordner:  python3 tools/build.py
Fehlende Übersetzungen werden am Schluss aufgelistet.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
BASE_URL = 'https://deheim-landing-page-v1.vercel.app/'

# Sprache: (Ordner, Locale für og:locale)
LANGS = {'de': ('', 'de_CH'), 'en': ('en/', 'en_US'), 'fr': ('fr/', 'fr_CH')}
DEFAULT = 'de'

LEGAL_TITLES = {
    'impressum': {'de': 'Impressum', 'en': 'Legal notice', 'fr': 'Mentions légales'},
    'datenschutz': {'de': 'Datenschutz', 'en': 'Privacy policy', 'fr': 'Protection des données'},
}

TRANSLATABLE_ATTRS = ('alt', 'aria-label', 'placeholder', 'title', 'content', 'data-bio', 'data-video-title')


# ---------- Übersetzen ----------

def load_dict(lang):
    if lang == 'en':
        return {}, {}, set()
    d = json.loads((ROOT / 'i18n' / f'{lang}.json').read_text(encoding='utf-8'))
    keep = set(d.pop('_keep', []))
    html_map = d.pop('_html', {})
    # Texte aus den HTML-Übersetzungen sind schon übersetzt
    for v in html_map.values():
        keep.update(norm(seg) for seg in re.split(r'<[^>]+>', v) if norm(seg))
    return d, html_map, keep


def norm(text):
    return ' '.join(html.unescape(text).split())


def needs_translation(text):
    return bool(re.search(r'[A-Za-z]{2}', text))


def translate_html(src, lang, missing):
    words, html_map, keep = load_dict(lang)
    if lang == 'en':
        return src
    for a, b in html_map.items():
        src = src.replace(a, b)

    def tr(text):
        key = norm(text)
        if not key:
            return None
        if key in words:
            return words[key]
        if needs_translation(key) and key not in keep:
            missing.add(key)
        return None

    def tr_attr(m):
        name, value = m.group(1), m.group(2)
        new = tr(value)
        return f'{name}="{html.escape(new, quote=True)}"' if new is not None else m.group(0)

    parts = re.split(r'(<[^>]+>)', src)
    out, skip = [], False
    for part in parts:
        if part.startswith('<'):
            low = part.lower()
            if low.startswith('<script') or low.startswith('<style'):
                skip = True
            elif low.startswith('</script') or low.startswith('</style'):
                skip = False
            # Attribute nur bei Meta-Tags mit Text (description, og:…), sonst die üblichen
            if low.startswith('<meta') and not re.search(r'(name="description"|property="og:(title|description|image:alt)")', part):
                out.append(part)
                continue
            part = re.sub(r'\b(' + '|'.join(TRANSLATABLE_ATTRS) + r')="([^"]*)"', tr_attr, part)
            out.append(part)
        elif skip or not part.strip():
            out.append(part)
        else:
            new = tr(part)
            if new is None:
                out.append(part)
            else:
                lead = part[:len(part) - len(part.lstrip())]
                trail = part[len(part.rstrip()):]
                out.append(lead + html.escape(new, quote=False) + trail)
    return ''.join(out)


# ---------- Impressum und Datenschutz aus Markdown ----------

def md_inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)

    def link(m):
        txt, url = m.group(1), m.group(2)
        ext = url.startswith('http')
        return f'<a href="{url}"' + (' target="_blank" rel="noopener"' if ext else '') + f'>{txt}</a>'

    return re.sub(r'\[([^\]]+)\]\(([^)]+)\)', link, t)


def drop_placeholders(block, skipped):
    """Sätze mit Platzhaltern in eckigen Klammern (ohne Link) weglassen, z. B. «[Anbieter, Sitz]»."""
    def strip(text):
        keep = []
        for s in re.split(r'(?<=[.!?])\s+', text):
            if re.search(r'\[[^\]]+\](?!\()', s):
                skipped.append(s.strip())
            else:
                keep.append(s)
        return ' '.join(keep)

    lines = []
    for line in block.split('\n'):
        hard = line.endswith('  ')
        line = strip(line.rstrip())
        if line.strip():
            lines.append(line + ('  ' if hard else ''))
    return '\n'.join(lines)


def md_para(block, skipped):
    block = drop_placeholders(block, skipped)
    lines = block.split('\n')
    return '\n          '.join(
        md_inline(l.rstrip()) + ('<br>' if l.endswith('  ') and i < len(lines) - 1 else '')
        for i, l in enumerate(lines))


def md_blocks(text):
    return [b for b in re.split(r'\n\s*\n', text.strip()) if b.strip()]


def legal_main(kind, lang, skipped):
    md = (ROOT / 'content' / 'legal' / f'{lang}.md').read_text(encoding='utf-8')
    imp_md, ds_md = md.split('\n---\n')
    text = imp_md if kind == 'impressum' else ds_md
    text = re.sub(r'^\s*# .*\n', '', text, count=1)  # Haupttitel kommt aus LEGAL_TITLES

    sections, intro = [], []
    if kind == 'impressum':
        for b in md_blocks(text):
            m = re.fullmatch(r'\*\*(.+)\*\*', b.strip())
            if m:
                sections.append([m.group(1), []])
            else:
                p = md_para(b, skipped)
                if p:
                    sections[-1][1].append(p)
    else:
        parts = re.split(r'\n## ', '\n' + text.strip())
        intro = [md_para(b, skipped) for b in md_blocks(parts[0])]
        for p in parts[1:]:
            title, _, rest = p.partition('\n')
            sections.append([title.strip(), [x for x in (md_para(b, skipped) for b in md_blocks(rest)) if x]])

    body = ''
    if intro:
        body += '      <div class="legal__section legal__intro">\n' + ''.join(f'        <p>{p}</p>\n' for p in intro) + '      </div>\n'
    for h, ps in sections:
        body += f'      <section class="legal__section">\n        <h2>{h}</h2>\n' + ''.join(f'        <p>{p}</p>\n' for p in ps) + '      </section>\n'
    return f'''<main id="top" class="legal">
    <div class="legal__aside">
      <h1 class="legal__title">{LEGAL_TITLES[kind][lang]}</h1>
    </div>
    <div class="legal__content">
{body}    </div>
  </main>'''


# ---------- Pfade, Sprachwahl, Meta ----------

def page_url(lang, page):
    folder = LANGS[lang][0]
    return folder if page == 'index.html' else folder + page


def rel_link(from_lang, to_lang, page):
    up = '../' if LANGS[from_lang][0] else ''
    target = page_url(to_lang, page)
    return (up + target) or './'


def localize(s, lang, page):
    folder = LANGS[lang][0]
    s = re.sub(r'<html lang="[^"]*">', f'<html lang="{lang}">', s, count=1)

    # Unterordner: Assets, CSS und JS liegen eine Ebene höher
    if folder:
        s = re.sub(r'((?:src|href)=")(assets/|styles\.css|script\.js)', r'\1../\2', s)

    # Sprachwahl in Navigation, Menü und Footer
    def lang_link(m):
        cls, target = m.group(1) or '', m.group(2)
        href = rel_link(lang, target, page)
        current = target == lang
        if cls:
            cls = ' class="text-base-b"' if current else ' class="text-base"'
        attrs = ' aria-current="true"' if current else f' hreflang="{target}"'
        return f'<a{cls} href="{href}" lang="{target}"{attrs}>{target.upper()}</a>'

    s = re.sub(r'<a( class="[^"]*")? href="[^"]*" lang="(de|en|fr)"[^>]*>(?:DE|EN|FR)</a>', lang_link, s)

    # og:url, og:locale, Sprachvarianten für Suchmaschinen
    url = BASE_URL + page_url(lang, page)
    s = re.sub(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{url}">', s)
    alternates = ''.join(
        f'  <link rel="alternate" hreflang="{l}" href="{BASE_URL + page_url(l, page)}">\n' for l in LANGS)
    alternates += f'  <link rel="alternate" hreflang="x-default" href="{BASE_URL + page_url(DEFAULT, page)}">\n'
    head_extra = (f'  <link rel="canonical" href="{url}">\n{alternates}'
                  f'  <meta property="og:locale" content="{LANGS[lang][1]}">\n')
    s = s.replace('</head>', head_extra + '</head>', 1)
    return s


# ---------- Build ----------

def main():
    missing = {l: set() for l in LANGS}
    skipped = []
    for src_file in sorted(SRC.glob('*.html')):
        page = src_file.name
        source = src_file.read_text(encoding='utf-8')
        for lang, (folder, _) in LANGS.items():
            s = translate_html(source, lang, missing[lang])
            m = re.search(r'<!-- LEGAL:(\w+)', s)
            if m:
                s = re.sub(r'<main id="top" class="legal">.*?</main>',
                           lambda _: legal_main(m.group(1), lang, skipped), s, flags=re.S)
            s = localize(s, lang, page)
            out = ROOT / folder / page
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(s, encoding='utf-8')
    print('Gebaut: Deutsch (/), Englisch (en/), Französisch (fr/)')
    for lang, keys in missing.items():
        if keys:
            print(f'\nFehlende Übersetzungen {lang.upper()} ({len(keys)}):')
            for k in sorted(keys):
                print('  -', k)
    if skipped:
        print('\nWeggelassene Platzhalter-Sätze:', len(skipped))
        for s in sorted(set(skipped)):
            print('  -', s)


if __name__ == '__main__':
    main()
