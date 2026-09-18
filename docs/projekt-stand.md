<!-- pur-office/docs/projekt-stand.md -->

<!-- Datenzugriff-Vorschau -->
Die Verwaltungsseite zeigt den Datenzugriff vorerst mit lokalen Beispieldaten: Unternehmer, Firmen und deren Filialen. Alle drei Selects starten mit Einfachauswahl; `unternehmerMehrfach`, `firmenMehrfach` und `filialenMehrfach` aktivieren jeweils die Mehrfachauswahl. Firmen sind nach Unternehmer gruppiert. Interne Auswahlschluessel enthalten die Unternehmerzuordnung. Abgewaehlte Unternehmer verlieren ihre abhaengige Auswahl; das Abwaehlen einer Firma entfernt ihre Filialauswahl. Die Benutzeranlage ist in dieser Vorschau auch im Submit-Handler gesperrt. Offen: Firebase-Anbindung an `purCustomers/{unternehmerId}/company/{firmaId}/branches`, Erweiterung der gespeicherten Zugriffe um den Unternehmer und serverseitige Zugehoerigkeitspruefung. Erst danach die Benutzeranlage wieder aktivieren.


# Projekt-Stand: Pur Office

Dieses Dokument beschreibt den aktuellen Umsetzungsstand im Code. Das fachliche Zielbild steht separat im [Projekt-Plan](./projekt-plan.md).

## Projektbasis

- [x] Angular-Projekt `pur-office` wurde angelegt.
- [x] Angular Standalone Components werden verwendet.
- [x] SCSS ist als Styling-Format eingerichtet.
- [x] Vitest ist als Testumgebung eingerichtet.
- [x] Prettier ist als Projekt-Dependency installiert.
- [x] GitHub-Repository `HaraldMischer/pur-office` wurde angelegt.
- [x] Projektvorgaben wurden in `AGENTS.md` dokumentiert.

## App-Shell und Navigation

- [x] Material-Sidenav-Layout ist in der App-Shell eingebaut.
- [x] `app-sidenav` liegt unter `src/app/components/app-shell/app-sidenav`.
- [x] `app-toolbar` liegt unter `src/app/components/app-shell/app-toolbar`.
- [x] Die Sidebar enthaelt Links fuer Dashboard, Schichtplan und Mitarbeiter.
- [x] Die Toolbar zeigt den App-Titel und den Menuebutton.
- [x] Das Layout reagiert auf kleinere Bildschirmbreiten.
- [x] Die Sidebar enthaelt den Bereich Verwaltung fuer berechtigte Master-Benutzer.

## Seiten und Routen

- [x] `dashboard-page` wurde unter `src/app/pages/dashboard-page` angelegt.
- [x] `schichtplan-page` wurde unter `src/app/pages/schichtplan-page` angelegt.
- [x] `mitarbeiter-page` wurde unter `src/app/pages/mitarbeiter-page` angelegt.
- [x] Routen fuer `/dashboard`, `/schichtplan` und `/mitarbeiter` werden per `loadComponent` geladen.
- [x] `/` leitet auf `/dashboard` weiter.
- [x] Die Route `/verwaltung` und die `verwaltung-page` sind als Grundgeruest umgesetzt.
- [x] Die geschuetzte Route `/passwort` ermoeglicht angemeldeten Benutzern eine Passwortaenderung.

## Firebase-Grundlage

- [x] Firebase und AngularFire sind installiert.
- [x] Firebase-Konfiguration liegt unter `src/environments`.
- [x] Firebase App, Auth und Firestore werden in `app.config.ts` bereitgestellt.
- [x] Firestore ist mit lokalem Cache vorbereitet.
- [x] Firebase Tokens fuer Auth und lesende Firestore-Zugriffe sind vorbereitet.
- [x] Firebase-nahe Services sind unter `src/app/services/firebase` vorgesehen.
- [x] Es gibt noch keine Registrierung in dieser App.

## Login und Benutzerberechtigungen

- [x] Loginseite mit E-Mail/Passwort-Formular ist angelegt.
- [x] Bestehende Firebase-Benutzer koennen sich anmelden.
- [x] Benutzerprofile werden lesend aus `benutzer/{uid}` geladen.
- [x] Die App legt keine Benutzerprofile an.
- [x] Benutzerprofile enthalten zusaetzlich `userRole` mit `filiale`, `office` oder `master`.
- [x] Allgemeine Bereichsfreigaben richten sich nach `erlaubteBereiche`; Verwaltung erfordert zusaetzlich `userRole: master`.
- [x] App-Routen sind mit `authGuard` geschuetzt.
- [x] Bereichsrouten werden ueber `bereichGuard` und `data: { bereich: ... }` abgesichert.
- [x] Sidebar-Navigation wird ueber `erlaubteBereiche` eingeschraenkt.
- [x] Firmen-/Filial-Zugriffe werden im Benutzerprofil ueber `zugriffe` mit `firmaId` und `filialIds` abgebildet.
- [x] Firebase-Fehler werden benutzerfreundlich angezeigt.

## Geplanter Verwaltungsbereich

- [x] Der Bereich Verwaltung ist im Client durch `erlaubteBereiche` und `userRole: master` geschuetzt.
- [x] Das typisierte Verwaltungsformular erfasst E-Mail, Anzeigename, Rolle, Bereiche sowie Firmen- und Filialzugriffe.
- [x] Pflichtfelder, E-Mail, mindestens ein Bereich sowie vollstaendige Zugriffe werden clientseitig validiert.
- [x] Das Formular uebergibt `IBenutzerAnlage` ueber Store und Service an die Callable Function `createBenutzer`.
- [x] Eine oeffentliche Selbstregistrierung ist weiterhin nicht vorhanden.
- [x] Die geschuetzte Callable Function `createBenutzer` legt Auth-Benutzer und `benutzer/{uid}`-Dokumente an.
- [x] Die Function prueft Anmeldung, aktives Profil und `userRole: master` serverseitig.
- [x] Die Anlage erfolgt mit dem Admin SDK; die Sitzung des Masters bleibt erhalten.
- [x] Bei der Benutzeranlage muss ein mindestens 8 Zeichen langes Anfangspasswort durch den Master in einem Passwortfeld mit Ein-/Ausblendfunktion vergeben werden.
- [x] Direkt vergebene Passwoerter werden nur an Firebase Authentication uebermittelt und nicht in Firestore gespeichert.
- [x] Angemeldete Benutzer koennen ihr Passwort nach erneuter Authentifizierung ueber die Toolbar und `/passwort` aendern.
- [x] Neues Passwort und Bestaetigung werden clientseitig validiert; es gelten mindestens 8 Zeichen.
- [x] Bei fehlgeschlagener Profilerstellung wird der angelegte Auth-Benutzer zurueckgerollt.

- [x] Functions-Codebase `pur-office` nutzt Node.js 22 und die Region `europe-west1`.
- [x] Die bisherige Function wurde deployed (vom Benutzer bestaetigt).
- [ ] Die Umstellung auf ausschliessliche Passwortvergabe durch den Master muss erneut deployed werden.
- [x] Lokale Uebergangs-Rules schuetzen `benutzer` und erhalten den bisherigen Zugriff auf alte Collections fuer angemeldete Benutzer.
- [x] Vier Firestore-Emulator-Tests pruefen Altzugriff, Auth-Pflicht, eigenen Profilzugriff und Schreibschutz.
- [x] Die Uebergangs-Rules wurden mit den realen Altanwendungen erfolgreich geprueft und deployed (vom Benutzer bestaetigt).

## Tests und Build

- [x] Tests fuer Platzhalter-Seiten, Sidebar, Toolbar und App-Shell sind vorhanden.
- [x] Tests fuer Loginformular, Guards, Firebase-Services, Stores, Callable Function und Firebase-Fehler sind vorhanden.
- [x] `npm test` laeuft erfolgreich.
- [x] `npm run build` laeuft erfolgreich.

## Naechste sinnvolle Schritte

Die konkrete Arbeitsplanung steht in [Offene Todos](./next_todo.md).
