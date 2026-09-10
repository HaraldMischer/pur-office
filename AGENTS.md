<!-- pur-office/AGENTS.md -->

# Projekt-Vorgaben

## Projektregeln
- Jede Code-Aenderung erfordert vorher ein Okay vom Benutzer.
- Beschreibe vor jeder Code-Aenderung zuerst kurz, was geaendert werden soll und in welchen Dateien; warte danach auf das ausdrueckliche Okay des Benutzers, bevor du die Aenderung umsetzt.
- Ohne ausdrueckliches Okay des Benutzers werden keine Dateien angelegt, geaendert oder geloescht.
- Jede neu angelegte Quelltext- oder Konfigurationsdatei beginnt, soweit der Dateityp Kommentare unterstuetzt, mit einem Kommentar, der den Projektpfad der Datei angibt.
- Commit-Kommentare werden in diesem Projekt auf Deutsch formuliert.

## Architektur
- Firestore dient als lesende Datenquelle; die App erzeugt keine eigenen Daten.
- Firestore Rules bleiben bewusst einfach und sichern nur Zugriff und Besitz. Fachliche Regeln, Feldvalidierung und UI-Logik werden in der Anwendung umgesetzt.
- Feature-Bereiche werden lazy geladen.
- Persistenter App-State wird zentral und nachvollziehbar gekapselt.

## Architektur-Schichten
- Components enthalten UI und einfache Formular- oder Interaktionslogik.
- Stores halten App-State, Lade- und Fehlerzustaende und orchestrieren Service-Aufrufe.
- Services kapseln externe Systeme und technische Zugriffe, z. B. Firebase Auth und Firestore.
- Firebase-nahe Services liegen unter `src/app/services/firebase`.
- Stores liegen unter `src/app/stores` und sind nach `app`, `domain` oder Feature-Bereich gegliedert.
- Der bevorzugte Datenfluss ist `Component -> Store -> Service -> Firebase/Firestore`.

## Naming
- Fachliche Projekt- und Domaenenbegriffe im UI, in Modellen und in Firestore-Pfaden werden auf Deutsch gehalten.
- Technische Aktionen und uebliche Code-Verben bleiben auf Englisch, z. B. `load`, `get`, `set`, `subscribe`, `filter`, `map` und `handle`.
- Kombiniere englische technische Verben mit deutschen Domaenenbegriffen, z. B. `loadMitarbeiter`, `getMitarbeiter`, `updateFilter` und `handleMitarbeiterSelect`.
- Fachliche Domain-Dateien werden ohne Suffix benannt, z. B. `mitarbeiter.ts` oder `filiale.ts`.
- Technische oder lose Typ-Sammlungen verwenden `.types.ts`.
- Konkrete Klassen oder Model-Implementierungen verwenden `.model.ts`.
- Interfaces verwenden den Prefix `I`, z. B. `IMitarbeiterDokument`.
- Type Aliases verwenden den Prefix `T`, z. B. `TRolle`.
- Enums verwenden den Prefix `E`, z. B. `EMitarbeiterStatus`.
- Firestore-Collections werden auf Deutsch benannt, z. B. `mitarbeiter` statt `employees`.
- Innerhalb eines Firestore-Pfads wird keine Sprache gemischt.
- Technische Begriffe aus Frameworks, Libraries und APIs bleiben in der jeweils etablierten Schreibweise, z. B. `uid`, `email`, `Auth`, `Firestore` und `Timestamp`.

# Angular-Vorgaben

## Projektueberblick
- Dies ist eine Angular-Anwendung mit dem Namen `pur-office`.
- Das Projekt nutzt Angular CLI mit dem Builder `@angular/build:application`.
- Styles werden standardmaessig mit SCSS geschrieben.
- Unit-Tests nutzen Angulars `@angular/build:unit-test` Builder mit Vitest.
- Paketmanager: npm.

## Wichtige Befehle
Fuehre Befehle aus dem Projekt-Root aus:
```bash
npm run build
npm test
npm run start-web
```

Hinweise:
- `npm test` ist als `CI=1 ng test --watch=false` konfiguriert und soll ohne Watch-Modus beenden.
- Nutze `npm run start-web` fuer den lokalen Angular-Dev-Server.
- Bevorzuge die vorhandenen npm-Skripte statt Framework-Binaries direkt aufzurufen.

## Entwicklungsrichtlinien
- Folge den vorhandenen Angular-Standalone-Component-Mustern.
- Halte dich an Angular-CLI-Konventionen fuer Dateinamen, Selektoren, Imports und Projektstruktur.
- Halte Aenderungen klein und auf das angefragte Verhalten fokussiert.
- Fuehre keine unnoetigen Refactorings ein, waehrend du ein Feature oder einen Fix umsetzt.
- Lege Styles in den Component-SCSS-Dateien ab, ausser ein Style ist bewusst global.
- Nutze Angular Material/CDK, wenn das Projekt es bereits verwendet, statt ein zweites UI-System hinzuzufuegen.

## Testrichtlinien
- Ergaenze oder aktualisiere `.spec.ts` Dateien bei Verhaltensaenderungen.
- Nutze Vitest-Globals wie `describe`, `it` und `expect`; das Projekt ist mit `vitest/globals` konfiguriert.
- Nutze Angular `TestBed` fuer Component- und Service-Tests.
- Fuehre vor Abschluss von Code-Aenderungen aus:

```bash
npm test
```
- Fuehre bei Build-, Template- oder groesseren UI-Aenderungen zusaetzlich aus:
```bash
npm run build
```

## Code-Stil
- Beachte die vorhandenen Prettier-Einstellungen aus `package.json`: Single Quotes und 100 Zeichen Print Width.
- Schreibe TypeScript moeglichst strict-freundlich und vermeide `any`, ausser es gibt einen klaren Grund.
- Bevorzuge klare, lesbare Namen statt Abkuerzungen.
- Kommentiere offensichtlichen Code nicht; nutze kurze Kommentare nur fuer nicht-triviale Logik.

## Abhaengigkeiten
- Fuege keine Dependencies hinzu, ausser sie vereinfachen die Umsetzung klar oder passen zur bestehenden Projektrichtung.
- Wenn eine Dependency noetig ist, aktualisiere `package.json` und `package-lock.json` gemeinsam.
- Halte Karma/Jasmine-Pakete aus diesem Projekt heraus; Tests laufen mit Vitest.

## Sicherheit
- Ueberschreibe keine unzusammenhaengenden Aenderungen des Nutzers.
- Loesche keine generierten Dateien oder Konfigurationsdateien, ausser die Aufgabe verlangt es ausdruecklich.
- Vermeide destruktive Git-Befehle.
- Wenn ein Befehl wegen lokaler Berechtigungen fehlschlaegt, erklaere das Problem und wiederhole ihn nur mit den minimal noetigen Berechtigungen.
