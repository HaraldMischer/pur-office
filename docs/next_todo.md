<!-- pur-office/docs/next_todo.md -->

# Offene Todos

## 4. Todo: Verwaltungsbereich und Benutzeranlage umsetzen

> **Status: Noch nicht abgeschlossen.**  
> Die sicheren Uebergangs-Rules sind lokal implementiert und im Emulator getestet. Offen bleiben die Pruefung mit den realen Altanwendungen und das anschliessende Deployment in das gemeinsame Firebase-Projekt.

Ziel:
Ein Benutzer mit `userRole: master` kann im geschuetzten Bereich `/verwaltung` vorkonfigurierte Benutzerzugaenge anlegen. Eine Selbstregistrierung bleibt ausgeschlossen. Die Angular-App uebergibt die Benutzerdaten an eine geschuetzte Firebase Cloud Function. Die Function prueft die Master-Rolle serverseitig und legt mit dem Firebase Admin SDK sowohl den Firebase-Auth-Benutzer als auch das Firestore-Dokument `benutzer/{uid}` an. Die bestehende Sitzung des Masters bleibt dabei erhalten.

Geplante betroffene Bereiche und Dateien:

- Firebase-Functions-Projekt beziehungsweise Backend-Struktur
- Firebase-Konfiguration und Deployment-Konfiguration
- src/app/app.routes.ts
- src/app/commons/models/app/app-bereich.ts
- src/app/commons/models/domain/benutzer.ts
- src/app/guards/
- src/app/services/firebase/
- src/app/stores/
- src/app/components/app-shell/app-sidenav/
- src/app/pages/verwaltung-page/
- Firestore Rules
- docs/projekt-plan.md
- docs/projekt-stand.md

Schritte 1: Verwaltungsbereich vorbereiten
1. [x] `verwaltung` als weiteren `TAppBereich` aufnehmen.
2. [x] Route `/verwaltung` und `verwaltung-page` anlegen.
3. [x] Navigationseintrag Verwaltung mit geeignetem Material-Icon ergaenzen.
4. [x] Zugriff im Angular-Routing zusaetzlich auf `userRole: master` begrenzen.
5. [x] Verwaltungsseite fuer Benutzerliste und Benutzeranlage vorbereiten.

Schritte 2: Formular und Datenmodell
1. [x] Formular fuer E-Mail-Adresse, Anzeigename und Benutzerrolle anlegen.
2. [x] Auswahl der `erlaubteBereiche` vorsehen.
3. [x] Firmen- und Filialzugriffe ueber `zugriffe` erfassen.
4. [x] Eingaben clientseitig validieren und eindeutige Fehlermeldungen anzeigen.
5. [x] Kein Formular zur oeffentlichen Selbstregistrierung anbieten.

Schritte 3: Serverseitige Benutzeranlage
1. [x] Firebase-Functions-Projekt mit Firebase Admin SDK einrichten.
2. [x] Geschuetzte Callable Cloud Function fuer die Benutzeranlage erstellen.
3. [x] Authentifizierung des aufrufenden Benutzers serverseitig pruefen.
4. [x] Benutzerprofil des Aufrufers aus `benutzer/{uid}` laden und `userRole: master` erzwingen.
5. [x] Firebase-Auth-Benutzer mit dem Admin SDK anlegen.
6. [x] Zugehoeriges Firestore-Dokument `benutzer/{uid}` mit Rolle, Bereichen und Zugriffen anlegen.
7. [x] Bei einem Fehler nach der Auth-Anlage den erzeugten Auth-Benutzer wieder entfernen.
8. [x] Verstaendliche Fehlercodes an die Angular-App zurueckgeben.

Schritte 4: Zugang und Sicherheit
1. [x] Auswahl zwischen direkter Passwortvergabe durch den Master und Passwort-Einrichtungslink umsetzen.
2. [x] Sicheren Versand oder eine sichere Uebergabe des Einrichtungslinks festlegen.
3. [x] Sicherstellen, dass der neu angelegte Benutzer nicht im Browser des Masters angemeldet wird.
4. [x] Uebergangs-Rules lokal umsetzen und im Emulator testen: alte Collections bleiben fuer angemeldete Benutzer freigegeben, `benutzer` wird geschuetzt.
5. [x] Die serverseitige Master-Pruefung unabhaengig von Navigation und Angular Guards testen.
6. [x] Eigene Benutzeroberflaeche fuer einen spaeteren Passwortwechsel durch den angemeldeten Benutzer umsetzen.
7. [ ] Uebergangs-Rules mit den realen Altanwendungen pruefen und erst danach deployen.

Umgesetzte Zugangsarten:
- `Benutzer legt Passwort fest`: Die Function erzeugt einen Einrichtungslink, den der Master kopiert und sicher weitergibt.
- `Passwort durch Master`: Der Master vergibt ein bestaetigtes Anfangspasswort mit mindestens 8 Zeichen. Es wird nur an Firebase Authentication uebergeben und nicht in Firestore gespeichert.
- Angemeldete Benutzer koennen ihr Passwort ueber die geschuetzte Seite `/konto/passwort` nach erneuter Authentifizierung aendern.

Rules-Status:
Die lokale Uebergangsregel erhaelt fuer alle Top-Level-Collections ausser `benutzer` den bisherigen Lese- und Schreibzugriff angemeldeter Benutzer. Fuer `benutzer/{uid}` ist nur das Lesen des eigenen Profils erlaubt; alle Client-Schreibzugriffe und Listenabfragen sind gesperrt. Vier Emulator-Tests bestaetigen Altzugriff, Auth-Pflicht, Profilzugriff und Schreibschutz. Ein Deployment ist noch nicht erfolgt.

Schritte 5: Tests und Abschluss
1. [x] Tests fuer Route, Guard, Navigation und Verwaltungsformular ergaenzen.
2. [x] Function-Tests fuer fehlende Anmeldung und fehlende Master-Rolle ergaenzen.
3. [x] Erfolgreiche Anlage von Auth-Benutzer und Benutzerdokument testen.
4. [x] Rueckabwicklung bei fehlgeschlagener Firestore-Anlage testen.
5. [x] `projekt-stand.md` nach der Umsetzung aktualisieren.
6. [x] `npm test` und Build-Pruefung erfolgreich ausfuehren.

Erledigt wenn:
- [x] Nur ein serverseitig bestaetigter `master` kann Benutzer anlegen.
- [x] Firebase-Auth-Benutzer und `benutzer/{uid}` werden konsistent angelegt.
- [x] Rolle, erlaubte Bereiche sowie Firmen- und Filialzugriffe werden vorkonfiguriert.
- [x] Der Master bleibt waehrend der Benutzeranlage angemeldet.
- [x] Der neue Benutzer erhaelt einen Passwort-Einrichtungslink.
- [x] Eine oeffentliche Selbstregistrierung ist weiterhin nicht vorhanden.
- [x] Fehler hinterlassen weder ein unvollstaendiges Auth-Konto noch ein unvollstaendiges Benutzerprofil.
- [ ] Die globale Firestore-Schreibfreigabe wurde durch collection-spezifische Rules ersetzt, ohne die Altanwendungen zu beeintraechtigen.
- [ ] Benutzer koennen `userRole`, `erlaubteBereiche` und `zugriffe` nicht selbst ueber den Client veraendern.

# Erledigte Todos

## 3. Done Todo: Login und Benutzerberechtigungen vorbereiten

Ziel:
Bestehende Firebase-Benutzer koennen sich anmelden. Registrierung erfolgt nicht in dieser App. Nach erfolgreichem Login wird das vorhandene Benutzerprofil aus `benutzer/{uid}` gelesen. Das Profil enthaelt eine Benutzerrolle und steuert erlaubte App-Bereiche sowie erlaubte Firmen-/Filial-Zugriffe. Die Rolle bleibt zusaetzlich am Benutzer gespeichert; die Bereichsfreigaben richten sich derzeit nach `erlaubteBereiche`.

Betroffene Dateien:

- package.json
- package-lock.json
- src/app/app.routes.ts
- src/app/app.ts
- src/app/guards/auth.guard.ts
- src/app/guards/bereich.guard.ts
- src/app/services/firebase/auth.service.ts
- src/app/services/firebase/benutzer.service.ts
- src/app/stores/app/benutzer.store.ts
- src/app/commons/models/app/firebase-error.types.ts
- src/app/commons/models/domain/benutzer.ts
- src/app/commons/models/app/app-bereich.ts
- src/app/commons/utils/errors/firebase-error-message.ts
- src/app/pages/auth/login-page/
- docs/projekt-stand.md

Schritte 1: Auth-Service und Benutzer-State

1. [x] Benutzer-Domainmodell fuer vorhandene Benutzerprofile anlegen.
2. [x] App-Bereich-Typ fuer erlaubte Bereiche anlegen.
3. [x] Benutzerrollen `filiale`, `office` und `master` im Benutzerprofil abbilden.
4. [x] AuthService fuer Login, Logout und Auth-State erstellen.
5. [x] BenutzerService fuer lesenden Zugriff auf `benutzer/{uid}` erstellen.
6. [x] BenutzerStore mit `benutzerProfil`, `inProgress` und `error` anlegen.
7. [x] Benutzerprofil nach Login aus Firestore unter `benutzer/{uid}` lesen.
8. [x] Keine Registrierung und kein Anlegen von Benutzerprofilen in dieser App umsetzen.

Schritte 2: Login und Routing

1. [x] Loginseite mit E-Mail/Passwort-Formular erstellen.
2. [x] Formularvalidierung ergaenzen.
3. [x] Loginseite in den Routes eintragen.
4. [x] AuthGuard fuer geschuetzte App-Routen anlegen.
5. [x] BereichGuard fuer `erlaubteBereiche` anlegen.
6. [x] Nach erfolgreichem Login zum Dashboard weiterleiten.
7. [x] Logout-Moeglichkeit in der App-Shell vorbereiten.

Schritte 3: Berechtigungen und Datenzugriff

1. [x] Sidebar-Navigation auf `erlaubteBereiche` einschraenken.
2. [x] Routen mit Bereich-Daten versehen, z. B. `data: { bereich: 'mitarbeiter' }`.
3. [x] Datenzugriff spaeter ueber `zugriffe` mit `firmaId` und `filialIds` einschraenken.
4. [x] Firestore Rules fuer serverseitige Absicherung einplanen.

Schritte 4: Fehler, Tests und Abschluss

1. [x] Firebase-Fehler benutzerfreundlich anzeigen.
2. [x] Tests fuer Service, Store, Guards und Loginformular ergaenzen.
3. [x] `projekt-stand.md` nach Umsetzung aktualisieren.
4. [x] `npm test` erfolgreich ausfuehren.
5. [x] `npm run build` erfolgreich ausfuehren.

Erledigt wenn:

- [x] Bestehende Benutzer koennen sich mit E-Mail und Passwort einloggen.
- [x] Die App legt keine Benutzerprofile an.
- [x] Vorhandenes Benutzerprofil wird aus `benutzer/{uid}` gelesen.
- [x] Sidebar und Routen richten sich nach `erlaubteBereiche`.
- [x] Datenzugriff kann ueber `zugriffe` mit `firmaId` und `filialIds` eingeschraenkt werden.
- [x] App-Routen sind fuer nicht angemeldete Benutzer geschuetzt.
- [x] Firebase-Fehler werden benutzerfreundlich angezeigt.
- [x] `npm test` laeuft erfolgreich.
- [x] `npm run build` laeuft erfolgreich.

## 2. Done Todo: Firebase-Grundlage einbinden

Ziel:
Firebase und Firestore werden technisch in die Angular-App eingebunden. Login, Benutzerprofil und Berechtigungen werden noch nicht umgesetzt, sondern erst im naechsten Todo vorbereitet.

Betroffene Dateien:

- package.json
- package-lock.json
- src/app/app.config.ts
- src/environments/environment.ts
- src/environments/environment.prod.ts
- src/environments/firebase-config.ts
- src/app/commons/tokens/firebase.tokens.ts
- src/app/services/firebase/
- docs/projekt-stand.md

Schritte 1: Dependencies und Konfiguration

1. [x] Firebase/AngularFire Dependencies installieren.
2. [x] Firebase-Konfiguration vorbereiten.
3. [x] Environment-Dateien fuer Firebase anlegen.
4. [x] Firebase-Konfiguration ueber `environment.firebase` bereitstellen.

Schritte 2: AngularFire Provider

1. [x] Firebase App Provider in `app.config.ts` einbinden.
2. [x] Auth Provider in `app.config.ts` einbinden.
3. [x] Firestore Provider in `app.config.ts` einbinden.
4. [x] Firestore mit lokalem Cache vorbereiten.

Schritte 3: Firebase-Struktur

1. [x] Tokens fuer Auth und Firestore anlegen.
2. [x] Firebase-nahe Service-Struktur unter `src/app/services/firebase` vorbereiten.
3. [x] Noch keine Login- oder Registrierungslogik umsetzen.

Schritte 4: Abschluss

1. [x] `projekt-stand.md` nach Umsetzung aktualisieren.
2. [x] `npm test` erfolgreich ausfuehren.
3. [x] `npm run build` erfolgreich ausfuehren.

Erledigt wenn:

- [x] Firebase und AngularFire sind installiert.
- [x] Firebase-Konfiguration liegt in den Environment-Dateien.
- [x] Firebase, Auth und Firestore werden in `app.config.ts` bereitgestellt.
- [x] Firebase Tokens sind vorbereitet.
- [x] Firebase-Service-Ordner ist vorbereitet.
- [x] Es gibt noch keine Registrierung in dieser App.
- [x] `npm test` laeuft erfolgreich.
- [x] `npm run build` laeuft erfolgreich.

## 1. Done Todo: App-Shell mit Sidebar und Toolbar anlegen

Ziel:
Die App erhaelt eine Angular-Material-App-Shell mit Toolbar und Sidebar. Die Shell wird in `app-sidenav` und `app-toolbar` unter `src/app/components/app-shell` aufgeteilt. Die Sidebar enthaelt die Hauptnavigation fuer Dashboard, Schichtplan und Mitarbeiter.

Betroffene Dateien:

- src/app/app.ts
- src/app/app.html
- src/app/app.scss
- src/app/app.routes.ts
- src/app/app.spec.ts
- src/app/components/app-shell/app-sidenav/
- src/app/components/app-shell/app-toolbar/
- src/app/pages/dashboard-page/
- src/app/pages/schichtplan-page/
- src/app/pages/mitarbeiter-page/
- docs/projekt-stand.md

Schritte 1: Seiten und Routen

1. [x] `dashboard-page` unter `src/app/pages/dashboard-page` anlegen.
2. [x] `schichtplan-page` unter `src/app/pages/schichtplan-page` anlegen.
3. [x] `mitarbeiter-page` unter `src/app/pages/mitarbeiter-page` anlegen.
4. [x] Routen fuer `/dashboard`, `/schichtplan` und `/mitarbeiter` per `loadComponent` vorbereiten und `/` auf `/dashboard` weiterleiten.
5. [x] Tests fuer die Platzhalter-Seiten ergaenzen.

Schritte 2: App-Shell-Components

1. [x] `app-sidenav` unter `src/app/components/app-shell/app-sidenav` anlegen.
2. [x] `app-toolbar` unter `src/app/components/app-shell/app-toolbar` anlegen.
3. [x] Sidebar-Navigation mit Links fuer Dashboard, Schichtplan und Mitarbeiter anlegen.
4. [x] Toolbar mit Menuebutton und App-Titel anlegen.
5. [x] Tests fuer Sidebar und Toolbar ergaenzen.

Schritte 3: App-Layout

1. [x] `app.ts`, `app.html` und `app.scss` auf ein Material-Sidenav-Layout umbauen.
2. [x] Responsive Verhalten fuer Desktop und kleinere Bildschirme vorbereiten.
3. [x] App-Test an das neue Layout anpassen.

Schritte 4: Abschluss

1. [x] `projekt-stand.md` nach Umsetzung aktualisieren.
2. [x] `next_todo.md` nach Umsetzung abhaken oder in erledigte Todos verschieben.
3. [x] `npm test` erfolgreich ausfuehren.
4. [x] `npm run build` erfolgreich ausfuehren.

Erledigt wenn:

- [x] Die App zeigt eine Material-Toolbar und eine Material-Sidebar.
- [x] Die Sidebar liegt in `app-sidenav`.
- [x] Die Toolbar liegt in `app-toolbar`.
- [x] Die Links Dashboard, Schichtplan und Mitarbeiter sind sichtbar.
- [x] Die Navigation funktioniert ueber Angular Routes.
- [x] Die echten Seiten liegen unter `src/app/pages`.
- [x] `npm test` laeuft erfolgreich.
- [x] `npm run build` laeuft erfolgreich.
