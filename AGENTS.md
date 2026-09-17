<!-- pur-office/AGENTS.md -->

# Projekt-Vorgaben

## Projektregeln
- Jede Code-Aenderung erfordert vorher ein Okay vom Benutzer.
- Beschreibe vor jeder Code-Aenderung zuerst kurz, was geaendert werden soll und in welchen Dateien; warte danach auf das ausdrueckliche Okay des Benutzers, bevor du die Aenderung umsetzt.
- Ohne ausdrueckliches Okay des Benutzers werden keine Dateien angelegt, geaendert oder geloescht.
- Jede neu angelegte Quelltext- oder Konfigurationsdatei beginnt, soweit der Dateityp Kommentare unterstuetzt, mit einem Kommentar, der den Projektpfad der Datei angibt.
- Commit-Kommentare werden in diesem Projekt auf Deutsch formuliert.

## Projektziel
- Das fachliche und architektonische Zielbild steht in `docs/projekt-plan.md`.
- Der aktuelle Umsetzungsstand steht in `docs/projekt-stand.md`.
- Konkrete naechste Arbeitsschritte stehen in `docs/next_todo.md`.
- Agents richten neue Umsetzung an diesen Dokumenten aus.

## Projektstruktur
- Echte Seiten liegen unter `src/app/pages`.
- Wiederverwendbare Components liegen unter `src/app/components`.
- App-Shell-Components liegen unter `src/app/components/app-shell`.
- Die Sidebar liegt unter `src/app/components/app-shell/app-sidenav`.
- Die Toolbar liegt unter `src/app/components/app-shell/app-toolbar`.
- Gemeinsame Modelle, Mapper, Konstanten, Utilities und Typen liegen unter `src/app/commons`.
- Guards liegen unter `src/app/guards`.
- Services liegen unter `src/app/services`.
- Allgemeine technische Services liegen unter `src/app/services/core`.
- Firebase-nahe Services liegen unter `src/app/services/firebase`.
- Stores liegen unter `src/app/stores`.
- App-weite Stores liegen unter `src/app/stores/app`, z. B. `src/app/stores/app/benutzer.store.ts`.
- Fachliche Domain-Stores liegen unter `src/app/stores/domain`.

## Template-Schreibweise
- Einfache Seiten-Sections werden ohne `aria-labelledby` geschrieben.
- Dafuer werden auch keine nur zu diesem Zweck angelegten `id`-Attribute auf Titeln verwendet.
- `pur-form` wird immer mit genau einem Layout-Modifier verwendet, z. B. `pur-form pur-form--grid` oder `pur-form pur-form--flex`.

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
