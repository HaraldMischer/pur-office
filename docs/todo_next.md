<!-- pur-office/docs/todo_next.md -->

# Offene Todos

## 11. Pflichtbereiche für Benutzerprofile verbindlich machen

### Ziel

Das Dashboard bleibt für jede Benutzerrolle eine verpflichtende Hauptseite. Die Systemverwaltung gehört ausschließlich zu
Masterprofilen. Beide Pflichtbereiche werden nicht mehr als frei wählbare Checkboxen dargestellt. Frontend, Callable Function und
Firestore Rules setzen dieselbe Regel bei Anlage und Bearbeitung durch.

### Betroffene Dateien

Änderungen:

- src/app/pages/systemverwaltung-page/benutzer-page/benutzer-anlage/
- src/app/pages/systemverwaltung-page/benutzer-page/benutzer-page.spec.ts
- src/app/pages/systemverwaltung-page/benutzer-page/benutzer-verwaltung/benutzer-bearbeiten-dialog/
- src/app/services/domain/benutzer.service.ts
- src/app/services/domain/benutzer.service.spec.ts
- src/app/stores/domain/benutzer-verwaltung.store.ts
- src/app/stores/domain/benutzer-verwaltung.store.spec.ts
- functions/src/create-benutzer.ts
- functions/src/create-benutzer.spec.ts
- firestore.rules
- rules-tests/firestore.rules.test.mjs
- docs/projekt-plan.md
- docs/projekt-stand.md

Neu hinzuzufügen:

- src/app/commons/utils/benutzer/erlaubte-bereiche.ts
- src/app/commons/utils/benutzer/erlaubte-bereiche.spec.ts

### Schritt 1: Pflichtbereiche zentral normalisieren

- [x] Die optional wählbaren Bereiche `schichtplan`, `mitarbeiter` und `verwaltung` zentral festlegen.
- [x] `dashboard` für jede Rolle und `systemverwaltung` ausschließlich für Master ergänzen.
- [x] Manipulierte oder doppelte Pflichtbereichswerte aus Eingaben bereinigen.
- [x] Bereits vorhandene Profile beim Laden auf die Pflichtbereichsregel normalisieren.

### Schritt 2: Anlage und Bearbeitung vereinfachen

- [x] In beiden Formularen ausschließlich die optionalen Bereiche als Checkboxen anzeigen.
- [x] Anlage- und Aktualisierungspayloads vor dem Speichern normalisieren.

### Schritt 3: Backend und Rules absichern

- [x] Die Callable Function die Pflichtbereiche unabhängig vom Client verbindlich setzen lassen.
- [x] Leere Auswahlen optionaler Bereiche bei der Anlage zulassen.
- [x] Profilaktualisierungen ohne Dashboard oder mit einer zur Rolle unpassenden Systemverwaltung in den Firestore Rules ablehnen.

### Tests und Abschluss

- [x] Frontend-Tests für optionale Checkboxen und rollenabhängige Pflichtbereiche erfolgreich ausführen.
- [x] Functions-Tests für serverseitige Normalisierung erfolgreich ausführen.
- [x] Firestore-Emulator-Tests für die Pflichtbereichsregeln erfolgreich ausführen.
- [x] Produktionsbuild erfolgreich ausführen.
- [ ] Benutzeranlage und Bearbeitungsdialog manuell prüfen.
- [ ] Callable Function und Firestore Rules nach ausdrücklicher Bestätigung deployen und mit Testkonten prüfen.

### Erledigt, wenn

- [x] Dashboard ist in jedem neu angelegten oder bearbeiteten Benutzerprofil enthalten.
- [x] Systemverwaltung ist genau bei Masterprofilen enthalten.
- [x] Dashboard und Systemverwaltung werden nicht als Checkboxen angezeigt.
- [x] Nur Schichtplan, Mitarbeiter und Verwaltung bleiben frei wählbar.
- [x] Automatisierte Tests und Build sind erfolgreich.
- [ ] Die produktive Firebase-Konfiguration ist deployed und mit realen Profilen geprüft.
