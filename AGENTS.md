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

- Groessere zusammenhaengende Template-Bereiche erhalten kurze HTML-Kommentare zur Orientierung, z. B. `<!-- Benutzerkarte -->` oder `<!-- Hauptnavigation -->`. Nur den Bereich benennen, keine ausfuehrlichen Erklaerungen und keine Kommentare fuer jedes einzelne Element.
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

## Styles und UI

- Nutze Angular Material/CDK als bestehendes UI-System.
- Komponentenbezogene Styles liegen in der jeweiligen Component-SCSS-Datei; bewusst wiederverwendbare Styles liegen unter `src/assets/scss`.
- Beachte die vorhandenen Prettier-Einstellungen aus `package.json`.

## Arbeitsweise und Pruefungen

- Halte Aenderungen auf die vereinbarte Aufgabe beschraenkt; keine unnoetigen Refactorings.
- Erhalte bestehende Aenderungen des Benutzers. Dateien nur loeschen, wenn es zur vereinbarten Aufgabe gehoert; keine destruktiven Git-Aktionen ohne ausdruecklichen Auftrag.
- Verwende die vorhandenen npm-Skripte aus dem Projekt-Root. Der lokale Dev-Server startet mit `npm run start-web`.
- Fuege Dependencies nur bei begruendetem Bedarf hinzu und aktualisiere `package.json` und `package-lock.json` gemeinsam.
- Tests bleiben bei Vitest; keine Karma-/Jasmine-Pakete einfuehren.
- Ergaenze oder aktualisiere passende `.spec.ts` Dateien bei Verhaltensaenderungen.
- Fuehre vor Abschluss von Code-Aenderungen `npm test` ohne Watch-Modus aus.
- Fuehre bei Build-, Template- oder groesseren UI-Aenderungen zusaetzlich `npm run build` aus.
