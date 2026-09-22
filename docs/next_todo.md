<!-- pur-office/docs/next_todo.md -->

# Offene Todos

## 4. Todo: Verwaltung

> **Status am 22.09.2026:**
> Die Verwaltungsseite enthaelt die Bereiche Datenstruktur anlegen, Benutzer
> anlegen und Benutzer verwalten. Todo 4.1 Datenstruktur anlegen ist abgeschlossen:
> Die Unternehmer-, Firmen- und Filialanlage sind technisch umgesetzt und die
> vollstaendige Hierarchie wurde erfolgreich gegen Firestore geprueft. Die
> Bearbeitung bestehender Benutzerprofile ist noch offen.
> Die Benutzeranlage wurde mit der neuen Datenhierarchie fuer reale Office- und
> Filialkonten erfolgreich geprueft. Offen bleiben der reale Schreibtest fuer
> Office-Datenrechte und der abschliessende Deployment-Nachweis.

### 4.1 Datenstruktur anlegen

#### Ziel

Ein Master kann die Hierarchie Unternehmer, Firma und Filiale in einem
dreistufigen Material-Stepper auswaehlen beziehungsweise neu anlegen. Neu
angelegte Eintraege werden direkt in Firestore gespeichert, in den jeweiligen
Store uebernommen und fuer den naechsten Schritt ausgewaehlt.

#### Betroffene Dateien

- src/app/commons/models/domain/adresse.ts
- src/app/commons/models/domain/kontakt.ts
- src/app/commons/models/domain/unternehmer.ts
- src/app/commons/models/domain/firma.ts
- src/app/commons/models/domain/filiale.ts
- src/app/services/firebase/unternehmer.service.ts
- src/app/services/firebase/firma.service.ts
- src/app/services/firebase/filiale.service.ts
- src/app/stores/domain/unternehmer.store.ts
- src/app/stores/domain/firma.store.ts
- src/app/stores/domain/filiale.store.ts
- src/app/pages/verwaltung-page/datenstruktur-anlage/
- firestore.rules
- rules-tests/
- docs/projekt-stand.md

#### Schritt 1: Stepper und UI-Grundlage

- [x] Dreistufigen Material-Stepper fuer Unternehmer, Firma und Filiale anlegen.
- [x] Auswahl, vorbereitete Neuanlage, Navigation und Validierung darstellen.
- [x] Filialanlage und Hierarchie-Zusammenfassung als UI-Dummy darstellen.
- [x] Responsive horizontale und vertikale Ausrichtung umsetzen.
- [x] Manuelle Sichtpruefung des UI-Dummys abschliessen.

#### Schritt 2: Unternehmer auswaehlen und anlegen

- [x] Gemeinsame Modelle `IAdresse` und `IKontakt` anlegen.
- [x] Unternehmermodell mit `anzeigename`, eingebetteter `IPerson` sowie Anlage-, Dokument-, Eintrags- und Ergebnis-Typen anlegen.
- [x] `UnternehmerService` und `UnternehmerStore` fuer Laden und Anlegen umsetzen.
- [x] Die naechste Unternehmernummer aus der vollstaendig geladenen Liste mit `max(nummer) + 1` bestimmen.
- [x] Neue Unternehmer unter `unternehmer/{unternehmerId}` mit automatischer Dokument-ID, `aktiv`, `erstelltAm` und `aktualisiertAm` speichern.
- [x] Unternehmerdialog mit Anzeigename, Vorname, Nachname, Adresse sowie optionaler E-Mail-Adresse und Telefonnummer umsetzen.
- [x] Pflichtfelder, E-Mail-Adresse und ausschliesslich aus Leerzeichen bestehende Eingaben validieren.
- [x] Vorhandene Unternehmer ueber ein Select auswaehlen und den Dialog ueber `Unternehmer anlegen` oeffnen.
- [x] Neu angelegte Unternehmer in die Store-Liste uebernehmen und automatisch auswaehlen.
- [x] Schritt 2 erst nach einer gueltigen Unternehmerauswahl freigeben.
- [x] Firestore Rules und Rules-Tests fuer das Schreibrecht aktiver Master erweitern und deployen.

#### Schritt 3: Firma auswaehlen und anlegen

- [x] Firmenmodell mit getrenntem `anzeigename` und `firmenname` sowie Anlage-, Dokument-, Eintrags- und Ergebnis-Typen festlegen.
- [x] Firmen des ausgewaehlten Unternehmers laden und sortiert im Store halten.
- [x] Firma-Service und Firma-Store fuer Laden und Anlegen umsetzen.
- [x] Dialog zum Anlegen einer Firma unter dem ausgewaehlten Unternehmer erstellen.
- [x] Neue Firma in die Store-Liste uebernehmen und automatisch auswaehlen.
- [x] Filialschritt erst nach einer gueltigen Firmenauswahl freigeben.

#### Schritt 4: Filiale anlegen

- [x] Filialmodell mit getrenntem `anzeigename` und `filialname` sowie Anlage-, Dokument-, Eintrags- und Ergebnis-Typen festlegen.
- [x] Filialen der ausgewaehlten Firma laden und im Store halten.
- [x] Filiale-Service und Filiale-Store fuer Laden und Anlegen umsetzen.
- [x] Dialog zum Anlegen einer Filiale unter der ausgewaehlten Firma erstellen.
- [x] Angelegte Filiale in die Store-Liste uebernehmen und in der Zusammenfassung anzeigen.
- [x] Vollstaendige Hierarchie Unternehmer, Firma und Filiale abschliessend bestaetigen.

#### Tests und Abschluss

- [x] Dialog-, Service-, Store- und Stepper-Tests fuer die Unternehmer-Anlage ergaenzen.
- [x] `npm test`, `npm run test:rules` und `npm run build` fuer die Unternehmer-Anlage erfolgreich ausfuehren.
- [x] Unternehmeranlage manuell gegen Firestore pruefen.
- [x] Service-, Store-, Dialog- und Stepper-Tests fuer die Firmenanlage ergaenzen.
- [x] Service-, Store-, Dialog- und Stepper-Tests fuer die Filialanlage ergaenzen.
- [x] Vollstaendige Datenstruktur-Anlage manuell gegen Firestore pruefen.
- [x] `projekt-stand.md` um den technischen Stand der Filialanlage aktualisieren.
- [x] `npm test`, `npm run test:rules` und `npm run build` fuer den Gesamtablauf erfolgreich ausfuehren.

#### Erledigt, wenn

- [x] Der Stepper stellt die drei Hierarchiestufen verstaendlich und responsiv dar.
- [x] Ein Unternehmer kann ausgewaehlt oder neu angelegt werden.
- [x] Eine Firma kann fuer den ausgewaehlten Unternehmer ausgewaehlt oder neu angelegt werden.
- [x] Eine Filiale kann technisch fuer die ausgewaehlte Firma angelegt werden.
- [x] Die vollstaendige Hierarchie wird korrekt in Firestore gespeichert, im UI zusammengefasst und nach einem Anwendungsneustart erneut geladen.
- [x] Der reale Gesamtablauf sowie Tests, Rules-Tests und Build sind erfolgreich.

### 4.2 Benutzer anlegen

#### Ziel

Ein serverseitig bestaetigter Master kann einen Benutzer mit Anzeigename, Rolle,
E-Mail, Anfangspasswort, erlaubten Bereichen und Datenzugriffen anlegen. Die
Datenzugriffe folgen der Hierarchie
`unternehmer/{unternehmerId}/firma/{firmaId}/filiale/{filialId}`. Eine
Selbstregistrierung bleibt ausgeschlossen und die Sitzung des Masters bleibt
erhalten.

#### Betroffene Dateien

- src/app/commons/models/domain/benutzer.ts
- src/app/commons/models/domain/datenzugriff.ts
- src/app/components/datenzugriff-auswahl/
- src/app/pages/verwaltung-page/benutzer-anlage/
- src/app/services/firebase/benutzer-verwaltung.service.ts
- src/app/services/firebase/datenzugriff.service.ts
- src/app/stores/domain/benutzer-verwaltung.store.ts
- functions/src/index.ts
- firestore.rules
- rules-tests/
- docs/projekt-stand.md

#### Schritt 1: Verwaltungszugang und Benutzerformular

- [x] Verwaltungsroute, Navigation und Client-Guards fuer berechtigte Master-Benutzer umsetzen.
- [x] Formular mit Zugangsdaten, Bereichs-Checkboxen und Datenzugriff-Auswahl anlegen.
- [x] Anfangspasswort mit mindestens acht Zeichen und Ein-/Ausblendfunktion erfassen, aber nicht in Firestore speichern.
- [x] Formularvalidierung und Schutz vor doppeltem Absenden umsetzen.
- [x] Formular und Absendezustand nach erfolgreicher Anlage zuruecksetzen und die Erfolgsmeldung erhalten.
- [x] Passwortaenderung unter `/passwort` mit erneuter Authentifizierung und Passwortbestaetigung umsetzen.

#### Schritt 2: Rollen und Datenzugriffe

- [x] Wiederverwendbare Material-Selects fuer Unternehmer, Firmen und Filialen an echte Firebase-Daten anbinden.
- [x] Rollenabhaengige Auswahl umsetzen: Filiale genau eine vollstaendige Zuordnung, Office eine Unternehmerauswahl und mehrere Firmen beziehungsweise Filialen, Master ohne Datenzuordnung.
- [x] Abhaengige Auswahlen bereinigen und bereits geladene Listen nach vollstaendigem Pfad zwischenspeichern.
- [x] Lade-, Leer- und Fehlerzustaende der Datenlisten getrennt vom Anlagezustand verwalten.
- [x] Im gemeinsamen Auswahlmodell und in den Firestore-Dokumenten durchgehend `anzeigename` verwenden.
- [x] Ausgewaehlte Zugriffe in Formularvalidierung und Anlage-Payload uebernehmen.
- [x] Firmen- und Filialzuordnungen im Backend gegen die Firestore-Hierarchie pruefen.
- [x] Office-Firmenfreigabe festlegen: Firmen und Filialen werden explizit zugeordnet; neue Filialen werden nicht automatisch freigegeben.

#### Schritt 3: Konto und Profil sicher anlegen

- [x] Store, Service und Callable Function fuer die Benutzeranlage umsetzen.
- [x] Anmeldung, aktives Profil und Master-Rolle serverseitig pruefen.
- [x] Auth-Konto und Profil unter `benutzerprofil/{uid}` mit dem Admin SDK sicher anlegen.
- [x] Ohne erfolgreich gespeichertes Profil kein neues Auth-Konto aktivieren und Fehlerfaelle kontrolliert bereinigen.
- [x] Vereinfachte Function ohne `zugriffsIndex` deployen; Deployment vom Benutzer bestaetigt.
- [x] Vereinfachte Rules ohne `zugriffsIndex` deployen; Deployment vom Benutzer bestaetigt.
- [x] Vorhandenes Master-Profil pruefen; eine Datenmigration war nicht erforderlich.

#### Schritt 4: Rechte und realen Gesamtablauf absichern

- [x] Aktive Master fuer alle benoetigten Collections berechtigen.
- [x] Office- und Filialprofile lesend auf zugeordnete Hierarchien samt Untercollections begrenzen.
- [x] Direkten Filial-Lesetest ausfuehren: eigene Filiale erlaubt, andere Filiale derselben Firma gesperrt.
- [x] Lesen und Schreiben der Altanwendung nach dem Rules-Deployment bestaetigen.
- [x] Office-Konten das Aktualisieren zugeordneter Firmen- und Filialdokumente erlauben; Anlegen, Loeschen und Schreiben in Untercollections weiterhin sperren.
- [x] Filialkonten vorerst ausschliesslich lesend auf ihre zugeordnete Hierarchie begrenzen.
- [x] Aktualisierte Firestore Rules mit den Office-Schreibrechten erfolgreich deployen.
- [ ] Office-Zugriffe und Unterdokumente mit realen Testkonten pruefen.

#### Tests und Abschluss

- [x] Service-, Store-, Function-, Rules- und Formulartests fuer die umgesetzte Benutzeranlage ergaenzen.
- [x] Fehlerfaelle einschliesslich fehlgeschlagener Rueckabwicklung durch Backend-Tests pruefen und manuelle Nachbearbeitung dokumentieren.
- [x] Erfolgreiche Benutzeranlage, Anmeldung, Bereichsfreigabe, Verwaltungssperre, Passwortwechsel und erneute Anmeldung vom Benutzer bestaetigen.
- [x] Den aktuellen Gesamtablauf mit echten Unternehmer-, Firmen- und Filialzuordnungen pruefen.
- [x] Vereinbarte Office- und Filial-Schreibrechte mit Firestore-Emulator-Tests pruefen.
- [ ] `projekt-stand.md` nach Abschluss aktualisieren.
- [x] `npm test`, `npm run test:rules` und `npm run build` abschliessend erfolgreich ausfuehren.

#### Erledigt, wenn

- [x] Das Rollenmodell ist vollstaendig umgesetzt und die vereinbarten Schreibrechte sind abgesichert.
- [x] Der Master kann einen Benutzer mit echten Unternehmer-, Firmen- und Filialzuordnungen anlegen.
- [x] Die Zuordnungen werden vollstaendig gespeichert und serverseitig geprueft.
- [x] Benutzer koennen `userRole`, `erlaubteBereiche` und `zugriffe` nicht selbst ueber den Client veraendern.
- [x] Es gibt keine oeffentliche Selbstregistrierung.
- [ ] Der aktuelle Gesamtablauf ist deployed und mit realen Daten erfolgreich geprueft.

### 4.3 Bestehende Benutzerprofile verwalten

#### Ziel

Ein Master kann vorhandene Profile aus `benutzerprofil` auswaehlen und deren
Anzeigename, Aktivstatus, Benutzerrolle, erlaubte Bereiche und Datenzugriffe
bearbeiten. Die E-Mail-Adresse und der Firebase-Auth-Status werden in dieser
ersten Ausbaustufe nicht veraendert.

#### Betroffene Dateien

- src/app/commons/models/domain/benutzer.ts
- src/app/services/firebase/benutzer-verwaltung.service.ts
- src/app/stores/domain/benutzer-verwaltung.store.ts
- src/app/pages/verwaltung-page/verwaltung-page.ts
- src/app/pages/verwaltung-page/verwaltung-page.html
- src/app/pages/verwaltung-page/verwaltung-page.spec.ts
- src/app/pages/verwaltung-page/benutzer-verwaltung/
- src/app/pages/verwaltung-page/benutzer-verwaltung/benutzer-bearbeiten-dialog/
- firestore.rules
- rules-tests/
- docs/projekt-stand.md

#### Schritt 1: Datenmodell vorbereiten

- [x] `IBenutzerProfilEintrag` fuer ein Benutzerprofil mit der Dokument-ID als `uid` ergaenzen.
- [x] `IBenutzerProfilAktualisierung` fuer die direkt bearbeitbaren Profilfelder ergaenzen.
- [x] E-Mail-Adresse und Passwort bewusst aus dem Aktualisierungsmodell ausschliessen.

#### Schritt 2: Benutzerprofile laden und im Store verwalten

- [ ] Alle Benutzerprofile fuer den Master aus `benutzerprofil` laden und die Dokument-ID als `uid` abbilden.
- [ ] Benutzer-Verwaltungs-Store um Profilbestand, Auswahl, Ladezustand und Aktualisierungsstatus erweitern.
- [ ] Leere Liste, Ladefehler und erfolgreichen Ladezustand unterscheidbar darstellen.

#### Schritt 3: Benutzerprofil auswaehlen

- [x] Eigenstaendigen UI-Dummy unter `verwaltung-page/benutzer-verwaltung` anlegen.
- [x] Leeres Benutzer-Select und deaktivierten Button `Benutzer bearbeiten` ohne produktive Mockdaten vorbereiten.
- [ ] Benutzer ueber ein `mat-select` auswaehlen und die `uid` als Select-Wert verwenden.
- [ ] Anzeigename und E-Mail-Adresse als verstaendliche Bezeichnung im Benutzer-Select anzeigen.
- [ ] Den Bearbeiten-Button erst nach einer gueltigen Benutzerauswahl aktivieren.
- [ ] Das ausgewaehlte `IBenutzerProfilEintrag` an den Bearbeitungsdialog uebergeben.

#### Schritt 4: Benutzerprofil bearbeiten und speichern

- [ ] Bearbeitungsdialog fuer Anzeigename, Aktivstatus, Rolle, erlaubte Bereiche und Datenzugriffe anlegen.
- [ ] Vorhandene `DatenzugriffAuswahl` wiederverwenden und rollenabhaengige Validierung aus der Benutzeranlage uebernehmen.
- [ ] Firebase-Service um das Aktualisieren von `benutzerprofil/{uid}` erweitern.
- [ ] Beim Speichern `aktualisiertAm` mit einem Server-Timestamp setzen.
- [ ] Aktualisierten Eintrag ohne erneutes Laden in die Store-Liste uebernehmen.
- [ ] Erfolgs-, Fehler-, Lade- und Speicherzustand in der Oberflaeche anzeigen.

#### Schritt 5: Selbstschutz und spaetere Auth-Erweiterung

- [ ] Verhindern, dass ein Master sich selbst deaktiviert oder seine eigene Masterrolle entfernt.
- [ ] Firestore Rules beziehungsweise Backend-Schutz fuer erlaubte Profilaktualisierungen gezielt testen.
- [ ] Festlegen, wie angemeldete Benutzer geaenderte Bereiche und Zugriffe ohne erneute Anmeldung erhalten.
- [ ] E-Mail-Aenderungen spaeter ueber eine Cloud Function gleichzeitig in Firebase Auth und Firestore umsetzen.
- [ ] Eine vollstaendige Kontosperre spaeter ueber eine Cloud Function mit Firebase Auth `disabled` und Profilfeld `aktiv` synchronisieren.

#### Tests und Abschluss

- [ ] Service- und Store-Tests fuer Laden, Aktualisieren und Fehlerfaelle ergaenzen.
- [ ] Dialog- und Seitentests fuer Auswahl, Validierung, Speichern und Selbstschutz ergaenzen.
- [ ] Profilbearbeitung mit einem realen Testkonto pruefen.
- [ ] `projekt-stand.md` nach Abschluss aktualisieren.
- [ ] `npm test`, `npm run test:rules` und `npm run build` erfolgreich ausfuehren.

#### Erledigt, wenn

- [ ] Ein Master kann ein bestehendes Benutzerprofil ueber das Select auswaehlen.
- [ ] Anzeigename, Aktivstatus, Rolle, erlaubte Bereiche und Datenzugriffe koennen sicher aktualisiert werden.
- [ ] E-Mail-Adresse, Passwort und Firebase-Auth-Status bleiben in dieser Ausbaustufe unveraendert.
- [ ] Der Master kann sich nicht selbst deaktivieren oder seine eigene Masterrolle entfernen.
- [ ] Die aktualisierte Store-Liste und Oberflaeche zeigen den gespeicherten Stand ohne erneutes Laden.
- [ ] Tests, Rules-Tests, Build und manuelle Pruefung sind erfolgreich.

# Erledigte Todos

Die folgenden Abschnitte dokumentieren den Abschluss des jeweiligen damaligen Arbeitsschritts. Fuer den aktuellen Stand gelten Todo 4 und der [Projekt-Stand](./projekt-stand.md).

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
