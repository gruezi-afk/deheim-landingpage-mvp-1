# Deheim Landingpage MVP 1 – To-dos

Stand: Freitag, 13. November 2026

## So geht es am Freitag weiter

- **Projektordner:** `Documents/Web-Projekte/deheim-landingpage-mvp-1` in VS Code öffnen.
- **Chat fortsetzen:** Im Claude-Panel in VS Code die letzte Unterhaltung öffnen (Verlauf / «Past conversations»). Im Terminal geht auch: `claude --resume e31b1186-d44f-410b-8522-6c09727dd6ec`
- **Vorschau lokal:** Im Projektordner `python3 -m http.server 8765` starten, dann http://localhost:8765 öffnen.
- **Live:** https://deheim-landing-page-v1.vercel.app/ (Vercel-Projekt und GitHub-Repo heissen `deheim-landingpage-mvp-1`).
- **Figma:** https://www.figma.com/design/VTVHgKd8lgcffLEjFMHDud/Deheim-landingpage-MVP1
- **Texte:** Google Doc «Deheim Website Texts»

---

## Plan für Freitag, 20. November 2026

Vorschlag für die Reihenfolge (die schnellen Dinge zuerst, dann die grossen Entscheide):

1. [x] **Favicon und WhatsApp-Vorschaubild sind live** (13.11.). Noch kurz den Link in WhatsApp testen. Tipp: WhatsApp merkt sich alte Vorschauen. Zum Testen den Link mit Zusatz teilen, z. B. https://deheim-landing-page-v1.vercel.app/?v=2, und vor dem Senden warten, bis die Vorschau erscheint.
2. [x] **Bilder komprimieren** (20.11.): Bilder total von 22 MB auf 7 MB, grösste Datei jetzt 0.5 MB statt 5.6 MB.
3. [ ] **Kontaktformular:** Variante wählen (siehe Punkt 3 unten) und einrichten.
4. [ ] **Newsletter:** Dienst wählen oder das Feld vorerst entfernen.
5. [ ] **Sprachen:** Standard-Sprache und Aufbau festlegen (siehe Punkt 1 unten), dann mit DE bzw. FR beginnen.
6. [ ] **Impressum und Datenschutz:** Inhalte mitbringen (siehe Punkt 2 unten), dann baue ich die Seiten.
7. [ ] **Offene Freigaben** (Testimonials, Team, Bildrechte, Zahlen): Stand besprechen.

---

## Deine To-dos

### 1. Sprachen DE · EN · FR (gebaut 21.11.)
- [x] Website ist dreisprachig: Deutsch unter `/`, Englisch unter `/en/`, Französisch unter `/fr/`. Die Sprachwahl in Navigation, Menü und Footer führt zur gleichen Seite in der anderen Sprache.
- [ ] **Übersetzungen prüfen lassen** (von mir übersetzt): Deutsch mit «du», Französisch mit «vous». Besonders: Service-Namen (Nachbarschafts-Onboarding / Accueil de quartier …), Team-Rollen, Testimonials, Rechtstexte EN/FR.
- **So werden Texte geändert:** Englische Vorlage in `src/`, Übersetzungen in `i18n/de.json` und `i18n/fr.json`, Rechtstexte in `content/legal/de.md`, `en.md`, `fr.md`. Danach im Projektordner `python3 tools/build.py` ausführen. Das Skript meldet fehlende Übersetzungen.
- Die Seiten im Hauptordner sowie in `en/` und `fr/` werden vom Skript erzeugt, dort nichts direkt ändern.

### 2. Datenschutz und Impressum
- [x] **Impressum** (21.11.): Seite `impressum.html` ist gebaut und im Footer verlinkt. Offen: UID-Nummer, falls der Verein im Handelsregister steht.
- [ ] ~~Impressum: Inhalt liefern.~~ Das heisst Firmenname bzw. Trägerschaft, Adresse, verantwortliche Person, Kontakt und ggf. UID-Nummer.
- [ ] **Datenschutzerklärung:** Inhalt liefern bzw. erstellen lassen, nach Schweizer Datenschutzgesetz (revDSG) und ggf. DSGVO. Erwähnt werden müssen u. a.:
  - Kontaktformular und Newsletter (welche Daten, wohin, wie lange)
  - Hosting bei Vercel (Server-Logs, Anbieter in den USA)
  - Google Fonts (werden aktuell von Google geladen, siehe unten)
  - Links zu Instagram, LinkedIn und Google Maps
- [ ] Danach baue ich die zwei Seiten und verlinke sie im Footer und im Kontaktformular.

### 3. Kontaktformular: wie soll es senden?
Aktuell öffnet «Senden» das Mailprogramm mit einer vorbereiteten Nachricht. Das funktioniert, ist aber nicht ideal, weil nicht alle ein Mailprogramm eingerichtet haben.

Möglichkeiten, die wir am Freitag zusammen anschauen:
- [ ] **A) So lassen wie jetzt:** kostenlos, keine Daten bei Dritten, aber umständlich für Besucher:innen.
- [ ] **B) Externer Formular-Dienst:** schnell eingerichtet. Die Anfragen landen per Email bei gruezi@deheim.org, die Daten liegen aber beim Anbieter (muss in die Datenschutzerklärung).
- [ ] **C) Eigene Lösung über Vercel:** Das Formular sendet über eine kleine Server-Funktion und einen Email-Dienst direkt an gruezi@deheim.org. Das gibt am meisten Kontrolle. Es braucht einen Spam-Schutz.
- [ ] Entscheiden. Danach richte ich es ein.

---

## Was sonst noch fehlt, bevor wir offiziell live gehen

### Inhalte und Rechtliches
- [x] **Datenschutz** (21.11.): neue Fassung mit Kontaktformular, Newsletter, YouTube und Links ist online-bereit.
  - [ ] Newsletter-Anbieter eintragen (Satz «Wir versenden ihn über [Anbieter, Sitz].» ist bis dahin weggelassen). Entscheid 21.11.: **Infomaniak Newsletter**.
- [ ] **Newsletter mit Infomaniak einrichten** (deine Schritte):
  1. Konto bei Infomaniak eröffnen und das Produkt «Newsletter» aktivieren
  2. Absender gruezi@deheim.org bestätigen
  3. Eine Liste (Gruppe) anlegen, z. B. «Website»
  4. Ein Anmeldeformular erstellen, Double-Opt-in einschalten, nur Feld E-Mail
  5. Den Einbettungs-Code (HTML) des Formulars an mich schicken
  Danach verbinde ich das Footer-Formular, teste die Anmeldung und ergänze die Datenschutzerklärung.
  - [x] YouTube-Abschnitt korrigiert (21.11.): Verbindung zu Google erst nach Klick auf Play.
- [ ] **Vision-Seite (`vision.html`, 20.11.):** Texte sind noch Platzhalter aus Figma (Titel «Our Vision lorem ipsum…», Text-Block, Story «Competition in Dubai»). Echte Texte liefern. Wohin führt «Learn more» in der Story-Karte?
- [ ] **Google Doc nachführen:** Tagline Pizza Party ist auf der Website neu «For a quick and easy first step» (20.11.). Im Doc steht noch dieselbe Zeile wie bei Activation.
- [ ] **Testimonials:** Die sechs Zitate sind laut Text-Dokument Platzhalter und schon live. Bitte Zustimmung von Doris, Andri, Lina (Eltern!), Sandra, Joel und Yaari einholen oder Zitate anpassen bzw. entfernen.
- [x] **Testimonial-Bilder** (20.11.): jedes Zitat hat ein eigenes Bild aus Figma. Für Lina (9) gibt es keine Kinder-Figur, dort steht die Frau mit Halstuch.
- [ ] **Zahlen und Quellen prüfen:** Die Obsan-Zahl («more than one in three…») vor dem Launch verifizieren. Sollen die Quellen (RealPage, Newmark Knight Frank, SatisFacts …) verlinkt werden?
- [ ] **Team:** Raphaël, Tanya und Mauro sind auf der Seite, stehen aber nicht im Text-Dokument. Drin lassen? Die gekürzten Bios von allen kurz freigeben lassen.
- [ ] **Bildrechte:** Sind alle Fotos (Services, Team, Hero) für die Website freigegeben?
- [ ] **Newsletter funktioniert noch nicht:** Das Formular zeigt nur «Thanks! You’re subscribed.», es wird nichts gespeichert oder gesendet. Es braucht einen Newsletter-Dienst mit Double-Opt-in, oder das Feld wird vorerst entfernt.

### Technik
- [ ] **Eigene Domain:** Die Seite läuft auf `deheim-landing-page-v1.vercel.app`. Soll sie auf `deheim.org` umziehen? Dann braucht es DNS-Einstellungen und Weiterleitungen der alten Seiten (z. B. `/team-4`).
- [x] **Favicon** ist live (`favicon.ico`, `assets/favicon.svg`, `apple-touch-icon.png`).
- [x] **Vorschaubild für Social Media / WhatsApp** ist live (`assets/og-image.jpg`). Achtung: Die Bild-Adresse enthält die Domain. Bei einem Umzug auf `deheim.org` die `og:`-Tags in `index.html` und `kontakt.html` anpassen.
- [x] **Seitentitel und Beschreibung** (20.11.): englisch, wie die Seite.
- [x] **Bilder komprimiert** (20.11.). Optional später: moderne Formate (WebP/AVIF) und kleinere Varianten fürs Handy.
- [x] **Schriften** (20.11.): Google Sans (Text) und Platypi (Titel) liegen lokal auf der Website (`assets/fonts`), Google Fonts wird nicht mehr geladen.
- [ ] Optional: Gelica oder Roca statt Platypi. Beide sind Adobe Fonts und dürfen nicht selbst gehostet werden. Dafür auf fonts.adobe.com ein Web-Projekt anlegen und mir den Einbettungs-Link schicken.
- [ ] **404-Seite, robots.txt und sitemap.xml** fehlen.
- [ ] **Testen auf echten Geräten:** iPhone (Safari), Android (Chrome), Firefox am Desktop. Einige Feinheiten (z. B. der exakte Textabstand bei Überschriften) sehen in Firefox leicht anders aus.
- [ ] Optional: Besucher-Statistik (z. B. Vercel Analytics). Falls ja, muss sie in die Datenschutzerklärung.

### Kleinigkeiten
- [x] Seite ist als Englisch markiert (`lang="en"`), Sprachwahl zeigt EN als aktiv (20.11.). Startseite und Kontaktseite sind durchgehend amerikanisches Englisch.
- [ ] Alte Git-Branches aufräumen (`responsive-kontakt-team-motion`, `texte-services-overlay`, `footer-social-links`, `favicon-og-image`). Sie sind alle schon in `main`.
