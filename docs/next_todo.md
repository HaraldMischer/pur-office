<!-- pur-office/docs/next_todo.md -->

# Offene Todos

## 5. Todo: Datenstruktur-Anlage

> **Status am 20.09.2026:**
> 5.1 UI-Dummy abgeschlossen.
> 5.2 Unternehmer-Anlage vorbereitet.

### 5.1 UI-Dummy fuer die Datenstruktur-Anlage

#### Ziel

Den dreistufigen Material-Stepper ohne Firestore-Schreibzugriffe vorbereiten.

#### Umsetzung

- [x] Material-Stepper anlegen.
- [x] Unternehmerauswahl und vorbereitete Neuanlage darstellen.
- [x] Firmenauswahl und vorbereitete Neuanlage darstellen.
- [x] Filialanlage und Zusammenfassung darstellen.
- [x] Navigation und Validierung umsetzen.
- [x] Responsive Ausrichtung umsetzen.
- [x] Tests und Produktionsbuild ausfuehren.

#### Erledigt, wenn

- [x] Manuelle Sichtpruefung ist abgeschlossen.
- [x] Drei Schritte werden verstaendlich dargestellt.
- [x] Navigation und Validierung funktionieren.
- [x] Es werden noch keine Firestore-Dokumente geschrieben.
- [x] Tests und Build sind erfolgreich.

### 5.2 Unternehmer-Anlage

#### Ziel

Ein Master kann im ersten Schritt einen vorhandenen Unternehmer auswaehlen oder
ueber einen Material-Dialog einen neuen Unternehmer direkt in Firestore anlegen.
Nach erfolgreicher Anlage wird der neue Unternehmer automatisch ausgewaehlt.

#### Datenmodell

- [x] Gemeinsames Adressmodell `IAdresse` unter `src/app/commons/models/domain/adresse.ts` anlegen.
- [x] Gemeinsames Kontaktmodell `IKontakt` unter `src/app/commons/models/domain/kontakt.ts` anlegen.
- [x] Unternehmermodell mit `IUnternehmerAnlage`, `IUnternehmerEintrag` und `IUnternehmerDokument` unter `src/app/commons/models/domain/unternehmer.ts` anlegen.
- [x] Ergebnis-Typ fuer einen neu angelegten Unternehmer mit Dokument-ID, Unternehmernummer und Name ergaenzen.

#### Berechtigung

- [x] Firestore Rules so erweitern, dass aktive Master alle Dokumente lesen und schreiben duerfen.
- [x] Rules-Tests an das Schreibrecht des Masters anpassen und erfolgreich ausfuehren.
- [x] Aktualisierte Firestore Rules deployen; Deployment vom Benutzer bestaetigt.

#### Dialog

- [x] `UnternehmerAnlegenDialog` unter `src/app/pages/verwaltung-page/datenstruktur-anlage/unternehmer-anlegen-dialog` anlegen.
- [x] Angular-Material-Dialog mit den Formulargruppen Grunddaten, Adresse und Kontaktdaten umsetzen.
- [x] Name, Adresse und Kontaktdaten entsprechend den Domainmodellen erfassen; die Unternehmernummer automatisch fortlaufend ab `1` vergeben.
- [x] Pflichtfelder, E-Mail-Adresse und ausschliesslich aus Leerzeichen bestehende Eingaben validieren.
- [x] Abbrechen und validiertes Uebergeben der Anlage umsetzen.
- [x] Ladezustand und Fehlerausgabe bei der Store-Anbindung umsetzen.

#### Store und Firestore

- [x] `UnternehmerService` unter `src/app/services/firebase` fuer den direkten Firestore-Zugriff anlegen.
- [x] `UnternehmerStore` unter `src/app/stores/domain` mit Unternehmerliste, Ladezustand, Anlagezustand und Fehlerstatus anlegen.
- [x] `loadUnternehmer()` und `createUnternehmer()` im Store bereitstellen; die naechste Nummer aus der vollstaendig geladenen Unternehmerliste mit `max(nummer) + 1` ermitteln.
- [x] Neue Unternehmer unter `unternehmer/{unternehmerId}` mit automatischer Dokument-ID speichern.
- [x] `aktiv`, `erstelltAm` und `aktualisiertAm` beim Anlegen setzen.
- [x] Neue Unternehmerdokumente ueber `name` anzeigen.

#### Einbindung in Schritt 1

- [x] Den bisherigen Neu-anlegen-Dummy durch ein Unternehmer-Select und den Button `Unternehmer anlegen` ersetzen.
- [x] Den Unternehmer-Dialog ueber den Button oeffnen.
- [x] Nach erfolgreicher Anlage den Dialog schliessen, die Store-Liste aktualisieren und den neuen Unternehmer automatisch auswaehlen.
- [x] Schritt 2 erst nach einer gueltigen Unternehmerauswahl freigeben.

#### Tests und Abschluss

- [x] Dialog-, Service-, Store- und Stepper-Tests ergaenzen.
- [x] `npm test`, `npm run test:rules` und `npm run build` erfolgreich ausfuehren.
- [ ] Unternehmeranlage manuell gegen Firestore pruefen.

## 4. Todo: Benutzerverwaltung

> **Status am 19.09.2026: Noch nicht abgeschlossen.**
> Formular, lesende Firebase-Anbindung und Auswahluebergabe an den Verwaltungsstore sind umgesetzt. Formularvalidierung, Anlage-Payload und Backend-Hierarchiepruefung
> verwenden lokal die vereinfachte Zugriffs-Map ohne separaten Index. Der Profilbestand wurde geprueft; das vorhandene Master-Altprofil bleibt kompatibel. Die vereinfachten
> Rules und die vereinfachte Function sind deployed. Der Gesamtablauf muss noch mit der neuen Datenhierarchie getestet werden.

### 4.1 Benutzer anlegen

#### Ziel

Ein serverseitig bestaetigter Master kann einen Benutzer mit Anzeigename, Rolle,
E-Mail, Anfangspasswort, erlaubten Bereichen und Datenzugriffen anlegen. Die
Datenzugriffe fuer Pur Office folgen der Hierarchie
`unternehmer/{unternehmerId}/firma/{firmaId}/filiale/{filialId}`. Die
Altanwendung bleibt auf
`purCustomers/{unternehmerId}/company/{firmaId}/branches/{filialId}`. Eine
Selbstregistrierung bleibt ausgeschlossen; die Sitzung des Masters bleibt
erhalten.

#### Bereits umgesetzt

- [x] Filial-Lesezugriff am 19.09.2026 mit dem angemeldeten Testkonto direkt gegen Firestore geprueft: eigene zugeordnete Filiale lesbar, andere vorhandene Filiale derselben Firma mit `permission-denied` gesperrt. Beide Ergebnisse vom Benutzer per Screenshot bestaetigt.
- [x] Nach erfolgreicher Anlage Formularwerte und Absendezustand zuruecksetzen, sodass leere Pflichtfelder ohne Fehlermarkierung angezeigt werden; Erfolgsmeldung bleibt erhalten.
- [x] Rollenabhaengige Auswahl: Filiale genau ein Unternehmer/eine Firma/eine Filiale; Office Unternehmer einfach und Firmen/Filialen mehrfach; Master ohne Auswahl. Separate Komponenteninstanzen mit festen Modi; Rollenwechsel setzt Zuordnungen zurueck. Seiten- und Backendvalidierung begrenzen Filialkonten auf genau eine Filiale. Rollenvalidierung laut Benutzer erfolgreich als Function deployed.
- [x] Verwaltungsroute, Navigation und Client-Guards fuer berechtigte Master-Benutzer.
- [x] Formular mit Zugangsdaten, Bereichs-Checkboxen und Datenzugriff-Auswahl.
- [x] Anfangspasswort ausschliesslich durch den Master, mindestens 8 Zeichen, ein Feld mit Ein-/Ausblendfunktion. Kein Passwort in Firestore.
- [x] Spaetere Passwortaenderung unter `/passwort` mit erneuter Authentifizierung und Passwortbestaetigung.
- [x] Wiederverwendbare Material-Selects mit abhaengiger Auswahl; inzwischen an lesende Firebase-Abfragen angebunden.
- [x] Drei unabhaengige Mehrfachauswahl-Inputs mit Standard `false`; in der Verwaltungsseite je Rolle fest eingestellt: Filiale nur einfach, Office Firmen/Filialen mehrfach, Master ohne Auswahl.
- [x] Gruppierung nur bei aktivierter Mehrfachauswahl der uebergeordneten Ebene und mehr als einem dort ausgewaehlten Eintrag.
- [x] Anzahl direkt im Select bei mehreren ausgewaehlten Eintraegen; keine Hints oder separate Auswahlstatus-Zeile.
- [x] Bereinigung abhaengiger Auswahl beim Abwaehlen von Unternehmern oder Firmen.
- [x] Store, Service und Callable Function fuer die Benutzeranlage mit der Struktur `Unternehmer-ID -> Firma-ID -> Filial-IDs`.
- [x] Serverseitige Pruefung von Anmeldung, aktivem Profil und Master-Rolle; Anlage mit Admin SDK.
- [x] Vorschau-Sperre im Formular und Submit-Handler entfernt; Validierung und Schutz vor doppeltem Absenden bleiben aktiv.
- [x] `DatenzugriffService` anlegen und den bestehenden `BenutzerVerwaltungStore` um Daten, Auswahl sowie eigene Lade- und Fehlerzustaende erweitern. Unternehmer beim Oeffnen laden, Firmen nach Unternehmerauswahl und Filialen nach Firmenauswahl. Bei Mehrfachauswahl alle ausgewaehlten Eltern beruecksichtigen; bereits geladene Listen anhand der vollstaendigen Unternehmer-/Firmenzuordnung zwischenspeichern. Dokument-IDs fuer die Zuordnung und `customerName`, `companyName`, `branchName` fuer die Anzeige verwenden.
- [x] Store-Auswahl in Formularvalidierung und Anlage-Payload uebernehmen. Das alte `zugriffe`-FormArray wurde entfernt. Ausgewaehlte Unternehmer und Firmen benoetigen vollstaendige untergeordnete Auswahlen; Office-/Filialkonten benoetigen bei der Anlage mindestens eine vollstaendige Unternehmer-/Firmen-/Filialzuordnung. Leere Zuordnungen werden im Formular und Backend abgelehnt. Aktive Master lesen mit leerer Zugriffs-Map alle Collections und Untercollections.
- [x] Bestehende Profile pruefen: Am 19.09.2026 wurde die Collection `benutzer` im Projekt `pur-system` (Datenbank `(default)`) vollstaendig lesend geprueft. Es existiert genau ein Master-Profil mit `zugriffe: []`. Keine alten Firmen-/Filialzugriffe und keine fehlenden Unternehmerzuordnungen vorhanden; eine Migration ist nicht erforderlich. Es wurden keine Firestore-Dokumente veraendert.
- [x] Im Backend pruefen, ob ausgewaehlte Firmen zum Unternehmer und Filialen zur jeweiligen Firma gehoeren. Ungueltige oder manipulierte Zuordnungen ablehnen.
- [x] Unternehmer-/Firmen-/Filialauswahl mit echten Firebase-Daten angebunden und vom Benutzer als funktionierend bestaetigt. Produktive Mock-Daten und Vorschau-Sperre sind entfernt. Der vollstaendige Anlageablauf bleibt als Gesamtablaufpruefung offen.
- [x] Collection-spezifische Rules lokal umgesetzt und im Emulator geprueft: Aktive Master lesen alle Collections inklusive `benutzer`; aktive Office-/Filialprofile lesen nur zugeordnete Unternehmer-/Firmendokumente und freigegebene Filialen samt Untercollections. Eigenes Profil bleibt lesbar. Konten ohne `benutzer`-Dokument behalten bisherigen Altzugriff; diese Kontentrennung wurde vom Benutzer bestaetigt. Deployment und produktives Lesen/Schreiben der Altanwendung sind vom Benutzer bestaetigt; der neue Anlageablauf bleibt als Gesamtablaufpruefung offen.
- [x] Sichere Kontoanlage implementiert und getestet: Ohne erfolgreich gespeichertes Profil wird das neue Auth-Konto nie aktiviert. Bei Aktivierungsfehlern werden Auth-Konto und Profil nach Moeglichkeit deaktiviert und das Auth-Konto entfernt. Das Profil bleibt wegen eventuell ausgestellter Tokens erhalten. Unvollstaendige Bereinigung wird ehrlich gemeldet; manuelle Nachbearbeitung siehe Projekt-Stand.
- [x] Tests fuer den erweiterten Anlage-Payload, serverseitig ungueltige Hierarchien und bestehende Profile ergaenzen; Tests und Builds erfolgreich ausfuehren. Service-Abfragen, abhaengiges Laden, Cache, Lade-/Fehlerzustaende und Auswahluebergabe an den Store sind bereits getestet.
- [x] Vorherige Function und Rules deployed; Altzugriff ist bestaetigt.
- [x] Vereinfachte Rules ohne `zugriffsIndex` deployen; Deployment vom Benutzer bestaetigt.
- [x] Vereinfachte Function ohne `zugriffsIndex` deployen; Deployment vom Benutzer bestaetigt.

#### Aufteilung fuer den Datenzugriff

- Der bestehende `BenutzerVerwaltungStore` in `src/app/stores/domain/benutzer-verwaltung.store.ts` verwaltet zusaetzlich Unternehmer, Firmen, Filialen und deren Auswahl. Er orchestriert das Laden und bereitet die ausgewaehlten Zugriffe fuer die Benutzeranlage vor.
- Der neue `DatenzugriffService` in `src/app/services/firebase/datenzugriff.service.ts` kapselt die lesenden Firestore-Abfragen und die Uebertragung in die Auswahlmodelle. Der bestehende `BenutzerVerwaltungService` bleibt fuer den Aufruf der Benutzeranlage zustaendig.
- Lade- und Fehlerzustaende der Auswahllisten werden getrennt von `inProgress` und dem Feedback der Benutzeranlage gehalten. Leere Listen werden von Ladefehlern unterschieden.
- Die Component `DatenzugriffAuswahl` bleibt unabhaengig von Firebase und dem Verwaltungsstore. Die Verwaltungsseite uebergibt Daten und Auswahl ueber Inputs und reicht Auswahlereignisse der Component an den Store weiter.
- Fuer diesen Umfang ist kein eigener `DatenzugriffStore` vorgesehen. Eine Auslagerung wird erst bei gemeinsam benoetigter Lade- und Auswahllogik auf weiteren Seiten geprueft. Der `PasswortStore` bleibt separat.

#### Naechste Umsetzungsschritte

1. [ ] Office-Firmenfreigabe klaeren: Zugriff auf alle aktuellen und zukuenftigen Filialen der Firma oder stets explizite Filialauswahl? Office darf ausschliesslich freigegebene Firmen/Filialen sehen; kein globaler Lesezugriff. Bis zur Entscheidung die explizite Filialzuordnung beibehalten.
2. [ ] Schreibrechte festlegen: Welche Daten erzeugt/bearbeitet ein Filialkonto in seiner eigenen Filiale? Welche Office-Aktionen (z. B. Mitarbeiter anlegen/bearbeiten) sind innerhalb der freigegebenen Datenbereiche erlaubt? Danach gezielte Backend-/Rules-Pruefungen mit Tests umsetzen; Zugriff der Altanwendung erhalten.
3. [ ] Aktuelles Frontend bereitstellen und mit echten Testkonten pruefen: Anlage, Auth-Konto und Profil samt Zuordnungen, Login, erlaubte und verweigerte Lese-/Schreibzugriffe sowie Passwortwechsel. Die vereinfachte Function und die vereinfachten Rules sind bereits deployed. Erfolgreiche Anlage ueber das Formular wurde vom Benutzer bestaetigt. Anmeldung, Bereichsfreigabe, Verwaltungssperre, Passwortwechsel und erneute Anmeldung wurden vom Benutzer bestaetigt. Der direkte Filial-Lesetest ist ebenfalls erfolgreich: eigene Filiale erlaubt, andere vorhandene Filiale gesperrt. Office-Zugriffe, Unterdokumente und kuenftige Schreibrechte sind noch separat zu pruefen.

Die Rules lesen Unternehmer, Firmen und Filialen direkt aus der verschachtelten Zugriffs-Map. Alte Array-Zugriffe gewaehren Office-/Filialprofilen keine Datenrechte; aktive Master bleiben kompatibel. Fuer Office-/Filialseiten sind gezielte Dokumentabfragen oder auf erlaubte Dokument-IDs beschraenkte Queries erforderlich. Die aktuellen unbeschraenkten Auswahllisten gehoeren zur Master-Verwaltung.

Die sichere Weitergabe des Anfangspassworts liegt beim Master; eine automatische Zustellung ist nicht umgesetzt.

#### Erledigt, wenn

- [ ] Rollenmodell umgesetzt: Filiale genau eine Filiale; Office nur freigegebene Firmen/Filialen; Master ohne Datenzuordnung. Vereinbarte Schreibrechte sind gezielt abgesichert und getestet.
- [ ] Der Master kann ueber die freigegebene Verwaltungsseite einen Benutzer mit echten Unternehmer-, Firmen- und Filialzuordnungen anlegen.
- [ ] Die Zuordnungen werden vollstaendig gespeichert und serverseitig geprueft.
- [x] Datenzugriffe durch deployed Rules abgesichert und im Emulator geprueft; Lesen und Schreiben der Altanwendung nach Deployment bestaetigt. Direkter Server-Lesetest mit dem Filialkonto erfolgreich; Office-Zugriffe bleiben separat zu pruefen.
- [x] Fehlerfaelle einschliesslich fehlgeschlagener Rueckabwicklung sind durch Backend-Tests geprueft; manuelle Nachbearbeitung ist dokumentiert.
- [x] Benutzer koennen `userRole`, `erlaubteBereiche` und `zugriffe` nicht selbst ueber den Client veraendern.
- [x] Es gibt keine oeffentliche Selbstregistrierung.
- [ ] Der aktuelle Gesamtablauf ist deployed und mit realen Daten erfolgreich geprueft.

### 4.2 Bestehende Benutzerprofile verwalten

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

#### Datenmodell

- [x] `IBenutzerProfilEintrag` fuer ein Benutzerprofil mit der Dokument-ID als `uid` ergaenzen.
- [x] `IBenutzerProfilAktualisierung` fuer die direkt bearbeitbaren Profilfelder ergaenzen.
- [x] E-Mail-Adresse und Passwort bewusst aus dem Aktualisierungsmodell ausschliessen.

#### Laden und Speichern

- [ ] Alle Benutzerprofile fuer den Master aus `benutzerprofil` laden und die Dokument-ID als `uid` abbilden.
- [ ] Firebase-Service um das Aktualisieren eines Profils unter `benutzerprofil/{uid}` erweitern.
- [ ] Beim Speichern `aktualisiertAm` mit einem Server-Timestamp setzen.
- [ ] Benutzer-Verwaltungs-Store um Profilbestand, Auswahl, Ladezustand und Aktualisierungsstatus erweitern.
- [ ] Den aktualisierten Eintrag nach erfolgreichem Speichern ohne erneutes Laden in die Store-Liste uebernehmen.

#### Verwaltungsoberflaeche

- [ ] Unter `verwaltung-page` einen Bereich zum Verwalten vorhandener Benutzerprofile anlegen.
- [ ] Benutzer ueber ein `mat-select` auswaehlen und die `uid` als Select-Wert verwenden.
- [ ] Anzeigename und E-Mail-Adresse als verstaendliche Bezeichnung im Benutzer-Select anzeigen.
- [ ] Den Button `Benutzer bearbeiten` erst nach einer gueltigen Benutzerauswahl aktivieren.
- [ ] Das ausgewaehlte `IBenutzerProfilEintrag` an den Bearbeitungsdialog uebergeben.
- [ ] Den Bearbeitungsdialog unter `benutzer-verwaltung/benutzer-bearbeiten-dialog/` fuer Anzeigename, Aktivstatus, Rolle, erlaubte Bereiche und Datenzugriffe anlegen.
- [ ] Die vorhandene `DatenzugriffAuswahl` fuer Unternehmer-, Firmen- und Filialzuordnungen wiederverwenden.
- [ ] Rollenabhaengige Validierung entsprechend der Benutzeranlage uebernehmen.
- [ ] Erfolgs-, Fehler- und Ladezustand in der Oberflaeche anzeigen.

#### Sicherheit und spaetere Auth-Erweiterung

- [ ] Verhindern, dass ein Master sich selbst deaktiviert oder seine eigene Masterrolle entfernt.
- [ ] Firestore Rules beziehungsweise Backend-Schutz fuer die erlaubten Profilaktualisierungen gezielt testen.
- [ ] E-Mail-Aenderungen spaeter ueber eine Cloud Function gleichzeitig in Firebase Auth und Firestore umsetzen.
- [ ] Eine vollstaendige Kontosperre spaeter ueber eine Cloud Function mit Firebase Auth `disabled` und Profilfeld `aktiv` synchronisieren.
- [ ] Festlegen, wie bereits angemeldete Benutzer geaenderte Bereiche und Zugriffe ohne erneute Anmeldung erhalten.

#### Tests und Abschluss

- [ ] Service- und Store-Tests fuer Laden, Aktualisieren und Fehlerfaelle ergaenzen.
- [ ] Dialog- und Seitentests fuer Auswahl, Validierung, Speichern und Selbstschutz ergaenzen.
- [ ] Profilbearbeitung mit einem realen Testkonto pruefen.
- [ ] `npm test`, `npm run test:rules` und `npm run build` erfolgreich ausfuehren.

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
