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
- Lademethoden heissen `load...`, Speichermethoden `save...`, reine Neuanlagen `create...` und Loeschmethoden `delete...`.
- In Stores kennzeichnet `download` einen laufenden Ladevorgang.
- In Stores kennzeichnet `isLoaded`, dass Daten erfolgreich vollstaendig geladen wurden, wenn zwischen noch nicht geladenen und geladenen, aber leeren Daten unterschieden werden muss.
- In Stores kennzeichnet `inProgress` laufende Schreiboperationen wie Anlegen, Speichern oder Loeschen.
- Deutsche Aktionsnamen wie `laden`, `geladen`, `anlegen` oder `speichern` werden nicht als Store-State-Namen verwendet.
- Auswahlzustaende werden mit `selected` und dem deutschen Domaenenbegriff benannt, z. B. `selectedFirma` oder `selectedUnternehmer`.
- Fachliche Domain-Dateien werden ohne Suffix benannt, z. B. `mitarbeiter.ts` oder `filiale.ts`.
- Technische oder lose Typ-Sammlungen verwenden `.types.ts`.
- Konkrete Klassen oder Model-Implementierungen verwenden `.model.ts`.
- Interfaces verwenden den Prefix `I`, z. B. `IMitarbeiterDokument`.
- Type Aliases verwenden den Prefix `T`, z. B. `TRolle`.
- Enums verwenden den Prefix `E`, z. B. `EMitarbeiterStatus`.
- Firestore-Collections werden auf Deutsch benannt, z. B. `mitarbeiter` statt `employees`.
- Innerhalb eines Firestore-Pfads wird keine Sprache gemischt.
- Technische Begriffe aus Frameworks, Libraries und APIs bleiben in der jeweils etablierten Schreibweise, z. B. `uid`, `email`, `Auth`, `Firestore` und `Timestamp`.

## Code-Dokumentation

- JSDoc-Kommentare werden auf Deutsch geschrieben.
- JSDoc wird immer mehrzeilig geschrieben; einzeilige Schreibweisen wie `/** Beschreibung. */` sind nicht zulaessig.
- Auch kurze JSDoc-Beschreibungen verwenden das Format mit eigener Oeffnungszeile, Beschreibungszeile und Abschlusszeile.
- Oeffentliche Methoden in Components, Services und Stores erhalten JSDoc.
- Private Hilfsmethoden erhalten nur JSDoc, wenn ihre Logik nicht selbsterklaerend ist.
- Neue oeffentliche Methoden werden direkt bei ihrer Erstellung dokumentiert.

## Coding-Stil

- Imports werden nach Herkunft gruppiert, innerhalb der Importliste aber ohne Leerzeilen: Angular und Frameworks, Commons, Stores und Services, lokale relative Imports.
- Gleichartige Deklarationen werden innerhalb eines Abschnitts kompakt ohne Leerzeilen gruppiert.
- Leerzeilen trennen unterschiedliche Abschnitte oder klar unterschiedliche Arten von Logik.
- Code in Components, Pages, Services und Stores wird nach den unten definierten Abschnittsbloecken geordnet.
- Abschnittsbloecke werden nur angelegt, wenn der jeweilige Inhalt vorhanden ist; leere Abschnittsueberschriften werden weggelassen.
- Arrow Functions werden grundsaetzlich mit Block-Body und explizitem `return` geschrieben; die kompakte Expression-Body-Schreibweise `() => wert` wird nicht verwendet.
- Callbacks von `computed()` werden immer mit Block-Body und explizitem `return` geschrieben; die kompakte Expression-Body-Schreibweise wie `computed(() => store.inProgress())` wird auch bei kurzen Berechnungen nicht verwendet.
- Fuer kurze Array-Callbacks wie `map()`, `filter()`, `find()`, `some()`, `every()` und `sort()` bleibt die kompakte Expression-Body-Schreibweise erlaubt.
- `withComputed()` verwendet immer einen Block-Body. Computed-Signale werden darin als lokale Konstanten definiert und ueber einen gemeinsamen expliziten `return` als oeffentliche Store-API zurueckgegeben.
- `withMethods()` verwendet immer einen Block-Body. Methoden werden darin als benannte lokale Funktionsdeklarationen geschrieben und ueber einen gemeinsamen expliziten `return` als oeffentliche Store-API zurueckgegeben.
- Lokale Funktionen in `withMethods()`, die nicht im abschliessenden Objekt zurueckgegeben werden, gelten als private Helfer des Stores.
- Die direkten Objektliteral-Schreibweisen `withComputed(() => ({ ... }))` und `withMethods(() => ({ ... }))` werden nicht verwendet.

### Components und Pages

01. `// ===== Top-Level Helper =====================`
02. `// ===== Interne Dependency Injection =========`
03. `// ===== Konstanten & Typen ===================`
04. `// ===== Oeffentliche API ======================`
05. `// ===== View Queries =========================`
06. `// ===== Interner State =======================`
07. `// ===== Interne Ableitungen ==================`
08. `// ===== Oeffentliche Werte ====================`
09. `// ===== Oeffentliche Ableitungen ==============`
10. `// ===== Lifecycle Hooks ======================`
11. `// ===== Oeffentliche Aktionen =================`
12. `// ===== Interne Helfer =======================`

### Services

01. `// ===== Top-Level Helper =====================`
02. `// ===== Interne Dependency Injection =========`
03. `// ===== Konstanten & Typen ===================`
04. `// ===== Oeffentliche API ======================`
05. `// ===== Interner State =======================`
06. `// ===== Interne Ableitungen ==================`
07. `// ===== Oeffentliche Werte ====================`
08. `// ===== Oeffentliche Ableitungen ==============`
09. `// ===== Oeffentliche Aktionen =================`
10. `// ===== Interne Helfer =======================`

### Stores

01. `// ===== Top-Level Helper =====================`
02. `// ===== Methoden: Laden ======================`
03. `// ===== Methoden: Schreiben ==================`
04. `// ===== Methoden: Sonstige Aktionen ==========`

## Styles und UI

- Nutze Angular Material/CDK als bestehendes UI-System.
- Wiederverwendbare CSS-Klassen folgen BEM: `block__element` fuer Elemente und `block__element--modifier` fuer Varianten oder Zustaende. Zusammengesetzte Elementnamen verwenden einfache Bindestriche.
- Formulargruppen verwenden `pur-form__group`; ihre Ueberschriften verwenden `pur-form__group-titel` (in SCSS unter `&__group` als `&-titel`). `titel` ist ein eigenes Element, kein Modifier.
- Formulargruppen werden ohne `fieldset` und `legend` aufgebaut: `div`-Gruppen mit sichtbaren `h2`-Ueberschriften mit `pur-form__group-titel`. Diese Gruppen-Divs erhalten weder `role="group"` noch `aria-label` oder `aria-labelledby`. Beschriftungen fuer Bedienelemente wie reine Icon-Buttons bleiben davon unberuehrt.
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
