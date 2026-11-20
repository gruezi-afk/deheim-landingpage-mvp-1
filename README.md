# Deheim Landingpage

Statische Website für Deheim, umgesetzt nach dem Figma-Design. Live: https://deheim.vercel.app/ (Vercel-Account gruezi@deheim.org, Repo gruezi-afk/deheim-landingpage-mvp-1)
Jeder Push auf `main` geht automatisch über Vercel live.

## Sprachen

- Deutsch: `/` (Hauptsprache)
- Englisch: `/en/`
- Französisch: `/fr/`

## Aufbau

| Ordner / Datei | Inhalt |
| --- | --- |
| `src/` | Vorlagen aller Seiten auf Englisch. Hier werden Inhalte und Struktur geändert. |
| `i18n/de.json`, `i18n/fr.json` | Übersetzungen. Schlüssel = genauer englischer Text. |
| `content/legal/` | Impressum und Datenschutz als Markdown, je Sprache eine Datei. |
| `tools/build.py` | Erzeugt aus den Vorlagen die Seiten in allen drei Sprachen. |
| `styles.css`, `script.js`, `assets/` | Gestaltung, Interaktionen, Bilder und Schriften (für alle Sprachen gemeinsam). |
| `*.html`, `en/`, `fr/` | Erzeugte Seiten. Nicht direkt bearbeiten, sie werden beim Build überschrieben. |
| `Type/` | Original-Schriftdateien (nicht auf GitHub). |
| `TODO.md` | Offene Punkte. |

## Seiten neu erzeugen

```
python3 tools/build.py
```

Der Befehl listet am Schluss Texte auf, für die noch eine Übersetzung fehlt.
Nach Änderungen an `styles.css` oder `script.js` die Versionsnummer (`?v=…`) in den Vorlagen in `src/` erhöhen, damit Browser die neue Datei laden.

## Schriften

Google Sans (Text) und Platypi (Titel), beide selbst gehostet in `assets/fonts/`. Es werden keine Schriften von Google-Servern geladen.
