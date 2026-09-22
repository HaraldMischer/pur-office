<!-- pur-office/docs/projekt-stand.md -->

# Projekt-Stand: Pur Office

Stand: 22.09.2026. Dieses Dokument beschreibt den aktuellen Umsetzungsstand im Code. Das fachliche Zielbild steht separat im [Projekt-Plan](./projekt-plan.md).

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
- [x] Die Sidebar enthaelt Links fuer Dashboard, Schichtplan, Mitarbeiter, Verwaltung und Systemverwaltung, sofern der jeweilige Bereich im Benutzerprofil freigegeben ist.
- [x] Die Toolbar zeigt den Titel der aktiven Route und den Menuebutton.
- [x] Die Toolbar bietet einen Dark-/Light-Mode-Umschalter und im Entwicklungsmodus einen Button fuer die Snapshots der aktiven Stores.
- [x] Die Toolbar zeigt waehrend zentral registrierter Datenabfragen eine globale unbestimmte Progress-Bar.
- [x] Die Loginseite verwendet eine reduzierte App-Shell ohne Sidebar und Navigationstaste, aber mit Pur-Office-Produktkennung in der Toolbar.
- [x] Das Layout reagiert auf kleinere Bildschirmbreiten.
- [x] Die Sidebar enthaelt den Bereich Systemverwaltung fuer berechtigte Master-Benutzer.

## Seiten und Routen

- [x] `dashboard-page` wurde unter `src/app/pages/dashboard-page` angelegt.
- [x] `schichtplan-page` wurde unter `src/app/pages/schichtplan-page` angelegt.
- [x] `mitarbeiter-page` wurde unter `src/app/pages/mitarbeiter-page` angelegt.
- [x] Routen fuer `/dashboard`, `/schichtplan` und `/mitarbeiter` werden per `loadComponent` geladen.
- [x] `/` leitet auf `/dashboard` weiter.
- [x] Die Route `/systemverwaltung` und die `systemverwaltung-page` enthalten die Bereiche Datenstruktur anlegen, Benutzer anlegen und den UI-Dummy Benutzer verwalten.
- [x] Die Route `/verwaltung` und eine eigenstaendige Platzhalterseite fuer die spaetere Bearbeitung zugeordneter Firmen- und Filialdaten sind angelegt.
- [x] Die geschuetzte Route `/passwort` ermoeglicht angemeldeten Benutzern eine Passwortaenderung.

## Firebase-Grundlage

- [x] Firebase und AngularFire sind installiert.
- [x] Firebase-Konfiguration liegt unter `src/environments`.
- [x] Firebase App, Auth und Firestore werden in `app.config.ts` bereitgestellt.
- [x] Firestore ist mit lokalem Cache vorbereitet.
- [x] Firebase Tokens fuer Auth sowie lesende und schreibende Firestore-Zugriffe sind vorbereitet.
- [x] Firebase-nahe Services sind unter `src/app/services/firebase` vorgesehen.
- [x] Der technische `FirestoreDbService` kapselt Collection-Lesen, Dokument-Lesen, Anlegen, Merge-Aktualisieren, Server-Zeitstempel und den Angular-Injection-Kontext.
- [x] Firestore-Collection- und Dokumentpfade fuer Benutzerprofile, Unternehmer, Firmen und Filialen werden zentral in `firebase.constants.ts` erzeugt.
- [x] `BenutzerService`, `UnternehmerService`, `FirmaService` und `FilialeService` verwenden keine direkten AngularFire-Aufrufe mehr, sondern greifen ueber den `FirestoreDbService` zu.
- [x] Offline-Ladestrategien, Pending-Sync, Migrationen und Batch-Schreibvorgaenge aus der Altanwendung wurden bewusst noch nicht uebernommen.
- [x] Es gibt keine oeffentliche Selbstregistrierung.

## Login und Benutzerberechtigungen

- [x] Loginseite mit E-Mail/Passwort-Formular ist angelegt.
- [x] Bestehende Firebase-Benutzer koennen sich anmelden.
- [x] Benutzerprofile werden lesend aus `benutzerprofil/{uid}` geladen.
- [x] Der Angular-Client schreibt derzeit keine Benutzerprofile direkt; die Anlage von Auth-Konto und Profil ist im Backend umgesetzt. Aktive Master duerfen fachliche Verwaltungsdaten direkt in Firestore schreiben.
- [x] Benutzerprofile enthalten zusaetzlich `userRole` mit `filiale`, `office` oder `master`.
- [x] Allgemeine Bereichsfreigaben richten sich nach `erlaubteBereiche`; Systemverwaltung erfordert zusaetzlich `userRole: master`, Verwaltung zusaetzlich `userRole: office` oder `userRole: master`.
- [x] App-Routen sind mit `authGuard` geschuetzt.
- [x] Bereichsrouten werden ueber `bereichGuard` und `data: { bereich: ... }` abgesichert.
- [x] Sidebar-Navigation wird ueber `erlaubteBereiche` eingeschraenkt.
- [x] Der `verwaltungGuard` schliesst Filialkonten auch dann von `/verwaltung` aus, wenn deren Profil den Bereichsschluessel faelschlich enthaelt.
- [x] Firmen-/Filial-Zugriffe werden im Benutzerprofil als verschachtelte Map `Unternehmer-ID -> Firma-ID -> Filial-IDs` abgebildet.
- [x] Firebase-Fehler werden benutzerfreundlich angezeigt.

## Systemverwaltung und Zugangsdaten

- Der Bereich Systemverwaltung ist im Client durch `erlaubteBereiche` und `userRole: master` geschuetzt.
- Die `SystemverwaltungPage` ist ein Container fuer die eigenstaendigen Bereiche Datenstruktur-Anlage, Benutzeranlage und Benutzerverwaltung.
- Das Formular gliedert sich in Zugangsdaten, erlaubte Bereiche und Datenzugriff. Alle Gruppen verwenden `div`-Elemente mit sichtbaren Ueberschriften, ohne `role="group"`, `aria-label` oder `aria-labelledby`, statt `fieldset`/`legend`. Die `h2`-Ueberschriften werden zentral ueber `pur-form__group-titel` in `forms.scss` gestaltet. Zugangsdaten enthalten Anzeigename, Benutzerrolle, E-Mail und Passwort.
- Der Master vergibt das Anfangspasswort ausschliesslich selbst: ein Feld mit Ein-/Ausblendfunktion und dem Label „Passwort (mind. 8 Zeichen)“. Es gibt weder Passwortbestaetigung bei der Anlage noch eine Variante zur erstmaligen Passwortvergabe durch den Benutzer.
- Pflichtfelder, E-Mail, Passwortlaenge und mindestens ein erlaubter Bereich werden clientseitig validiert.
- `zugangsdaten` ist ein lokaler CSS-Container. Das bestehende `pur-form--grid` zeigt zwei Spalten, bei maximal 600 Pixel Containerbreite eine Spalte. `pur-form__row` verwendet standardmaessig Flex mit Umbruch; die Bereiche-Checkboxen umbrechen nach verfuegbarem Platz. Der Aktionsbutton ist rechts ausgerichtet.
- Die Vorschau-Sperre ist entfernt. Gueltige Formulare mit gueltiger Datenzugriffsauswahl koennen abgesendet werden; waehrend der Anlage werden weitere Aufrufe verhindert. Nach Erfolg werden Formular, Auswahl und der Absendezustand der FormGroupDirective zurueckgesetzt; leere Pflichtfelder zeigen dadurch keine Fehler. Die Erfolgsmeldung bleibt erhalten; bei Fehlern bleiben die Eingaben erhalten.

## Datenstruktur-Anlage

- Die Systemverwaltungsseite enthaelt einen linearen Angular-Material-Stepper fuer die hierarchische Anlage von Unternehmer, Firma und Filiale.
- Schritt 1 laedt alle Unternehmer aus `unternehmer`, erlaubt die Auswahl eines vorhandenen Eintrags und oeffnet fuer die Neuanlage einen Material-Dialog.
- Der Unternehmerdialog erfasst einen Anzeigenamen sowie die eingebettete Person mit Vorname, Nachname, Adresse und optionalen Kontaktdaten. Die fortlaufende Unternehmernummer wird aus der vollstaendig geladenen Store-Liste mit `max(nummer) + 1` bestimmt.
- Neue Unternehmer werden durch einen aktiven Master direkt unter `unternehmer/{unternehmerId}` in Firestore gespeichert, in die sortierte Store-Liste uebernommen und anschliessend im Stepper ausgewaehlt.
- Schritt 2 laedt die Firmen des ausgewaehlten Unternehmers, erlaubt die Auswahl eines vorhandenen Eintrags und oeffnet fuer die Neuanlage einen Material-Dialog.
- Der Firmendialog erfasst getrennt den kurzen `anzeigename` fuer Auswahlen und den vollstaendigen `firmenname` sowie die Adresse und optionale Kontaktdaten. Die fortlaufende Firmennummer wird innerhalb des Unternehmers aus der vollstaendig geladenen Store-Liste mit `max(nummer) + 1` bestimmt.
- Neue Firmen werden direkt unter `unternehmer/{unternehmerId}/firma/{firmaId}` gespeichert, in die sortierte Firmenliste uebernommen und anschliessend im Stepper ausgewaehlt. Ein Unternehmerwechsel setzt Firma und Filiale zurueck und laedt den passenden Firmenbestand.
- Schritt 3 laedt die Filialen der ausgewaehlten Firma und oeffnet fuer die Neuanlage einen Material-Dialog. Eine Auswahl bereits vorhandener Filialen ist in diesem reinen Anlageschritt bewusst nicht vorgesehen.
- Der Filialdialog erfasst getrennt den kurzen `anzeigename` fuer Auswahlen und den vollstaendigen `filialname` sowie die Adresse und optionale Kontaktdaten. Die fortlaufende Filialnummer wird innerhalb der Firma aus der vollstaendig geladenen Store-Liste mit `max(nummer) + 1` bestimmt.
- Neue Filialen werden direkt unter `unternehmer/{unternehmerId}/firma/{firmaId}/filiale/{filialeId}` gespeichert, in die sortierte Filialliste uebernommen und in der Hierarchie-Zusammenfassung angezeigt. Ein Unternehmer- oder Firmenwechsel setzt die abhaengige Filiale zurueck und laedt den passenden Filialbestand.
- Pflichtfelder und vollstaendig geladene Listen steuern die Zurueck-/Weiter-Navigation sowie die Freigabe der jeweiligen Anlagedialoge.
- Bis 720 Pixel wechselt der Stepper in die vertikale Ausrichtung.
- Unternehmer, Firma und Filiale werden schrittweise direkt gespeichert; ein zusaetzlicher abschliessender Sammel-Speicherbutton ist deshalb nicht erforderlich.
- Der vollstaendige Anlageablauf wurde vom Benutzer am 22.09.2026 gegen echtes Firestore bestaetigt: Unternehmer, Firma und Filiale wurden unter dem vorgesehenen verschachtelten Pfad gespeichert, im UI korrekt zusammengefasst und nach einem Anwendungsneustart erneut geladen.

## Bestehende Benutzer verwalten

- Unter `systemverwaltung-page/benutzer-verwaltung` ist ein eigenstaendiger UI-Dummy fuer die spaetere Profilbearbeitung angelegt.
- Der Bereich zeigt ein Benutzer-Select, einen erst nach Auswahl aktivierbaren Bearbeiten-Button und einen sichtbaren Hinweis auf die noch fehlende Datenanbindung.
- Es werden keine produktiven Mockprofile verwendet und noch keine Benutzerprofile fuer diesen Bereich geladen oder aktualisiert.
- `IBenutzerProfilEintrag` bildet ein geladenes Profil mit seiner Dokument-ID als `uid` ab. `IBenutzerProfilAktualisierung` begrenzt die vorbereiteten Aenderungen auf Anzeigename, Aktivstatus, Rolle, erlaubte Bereiche und Datenzugriffe; E-Mail-Adresse und Passwort sind ausgeschlossen.
- Die weitere Umsetzung mit Laden, Bearbeitungsdialog, Selbstschutz und Speichern ist in Todo 4.3 beschrieben.

## Firmen- und Filialverwaltung

- Unter `/verwaltung` ist eine eigenstaendige Seite fuer die spaetere Bearbeitung von Firmen- und Filialstammdaten angelegt. Die Route erfordert den Bereich `verwaltung` und zusaetzlich die Rolle Office oder Master; Filialkonten werden unabhaengig vom Bereichsschluessel ausgeschlossen.
- Drei abhaengige Material-Selects bilden Unternehmer, Firma und Filiale ab. Ein Wechsel des Unternehmers setzt Firma und Filiale zurueck; ein Firmenwechsel setzt die Filiale zurueck.
- Der seitenbezogene `VerwaltungStore` verwaltet die Listen, Auswahlen sowie getrennte Lade-, Leer- und Fehlerzustaende und ist an die Store-Snapshot-Ausgabe angebunden.
- Office-Konten laden ausschliesslich die im Benutzerprofil unter `zugriffe` enthaltenen Unternehmer-, Firmen- und Filialdokumente ueber ihre vollstaendigen Dokumentpfade. Es werden fuer Office keine unbeschraenkten Collection-Abfragen ausgefuehrt.
- Masterkonten besitzen keine erforderliche Zugriffszuordnung und laden deshalb die vollstaendigen Unternehmerlisten sowie nach Auswahl die zugehoerigen Firmen und Filialen.
- Die Auswahl ist angebunden; das Bearbeiten und Speichern der Firmendaten und Filialdaten folgt getrennt in Todo 5.1, Schritt 5 und Schritt 6.

## Globaler Ladeindikator

- Der globale `LoadingService` zaehlt parallele Ladevorgaenge und blendet den Ladeindikator erst nach Abschluss des letzten registrierten Vorgangs aus.
- Die App-Toolbar zeigt waehrend aktiver Ladevorgaenge eine schmale unbestimmte Material-Progress-Bar an ihrem unteren Rand.
- Die aktuellen Firestore-Lesevorgaenge fuer Benutzerprofile, Unternehmer, Firmen und Filialen werden im `FirestoreDbService` zentral an die Ladeanzeige angebunden. Damit werden auch die davon abhaengigen Datenzugriffslisten und Verwaltungslisten erfasst.
- Seiten zeigen keine zusaetzlichen allgemeinen Ladetexte mehr. Fachliche Fehler- und Leerzustaende bleiben direkt im jeweiligen Seitenbereich sichtbar.

## Datenzugriff-Auswahl mit Firebase

- Die wiederverwendbare Component liegt unter `src/app/components/datenzugriff-auswahl`; ihre Auswahlmodelle liegen in `src/app/commons/models/domain/datenzugriff.ts`.
- Die Systemverwaltungsseite laedt Unternehmer aus `unternehmer`, Firmen aus `firma` und Filialen aus `filiale`. Die produktiven Mock-Daten wurden entfernt. `UnternehmerService`, `FirmaService` und `FilialeService` kapseln Laden und Anlegen ihrer vollstaendigen Domaeneneintraege. Das gemeinsame Datenzugriff-Auswahlmodell und die Firestore-Dokumente verwenden auf allen Ebenen einheitlich `anzeigename`; `DatenzugriffService` bildet alle drei Domaeneneintraege auf kompakte Auswahleintraege ab. Fehlende Anzeigenamen werden durch die Dokument-ID ersetzt.
- Die Gruppe Datenzugriff verwendet einen `div` mit sichtbarer Ueberschrift statt eines `fieldset`: In der Browser-Nachstellung kollabierte ein darin verschachtelter Groessencontainer beim Einblenden von Meldungen. Die Container-Abfrage der wiederverwendbaren Component bleibt erhalten; die Korrektur wurde ein- und dreispaltig geprueft.
- Drei Material-Selects bilden Unternehmer -> Firmen -> Filialen ab. Ohne passende uebergeordnete Auswahl beziehungsweise verfuegbare Optionen sind nachgelagerte Selects deaktiviert.
- Die Inputs `unternehmerMehrfach`, `firmenMehrfach` und `filialenMehrfach` sind standardmaessig alle `false`. Die Systemverwaltungsseite erzeugt je Rolle eigene Komponenteninstanzen mit festen Modi: Filiale `false`, `false`, `false`; Office `false`, `true`, `true`; Master ohne Auswahlkomponente. Rollenwechsel setzt die Zuordnungen zurueck, ohne den Auswahlmodus einer bestehenden Instanz zu aendern.
- Firmen erhalten nur dann Unternehmergruppen, wenn `unternehmerMehrfach` aktiv ist und mehr als ein Unternehmer ausgewaehlt wurde. Filialen erhalten nur dann Firmengruppen, wenn `firmenMehrfach` aktiv ist und mehr als eine Firma ausgewaehlt wurde.
- Bei mehreren ausgewaehlten Eintraegen erscheint die Anzahl direkt im jeweiligen Select. Hints und die separate Auswahlstatus-Zeile wurden entfernt.
- Interne zusammengesetzte Auswahlschluessel erhalten die Unternehmer-/Firmenzuordnung auch bei gleichen untergeordneten IDs. Diese Schluessel sind kein gespeichertes Berechtigungsmodell.
- Abgewaehlte Unternehmer oder Firmen verlieren ihre abhaengige Auswahl; andere Auswahlen bleiben bestehen. Die Auswahlmodi werden beim Einbinden festgelegt und waehrend der Lebensdauer der Component nicht umgeschaltet; je Ebene gibt es ein Select mit gebundenem `multiple`.
- Die Component erhaelt Daten und Auswahl vom `BenutzerVerwaltungStore` ueber die Systemverwaltungsseite. Model-Inputs melden Auswahlereignisse zurueck. Der Store laedt abhaengige Listen, speichert sie nach vollstaendigem Pfad zwischen und bereinigt abhaengige Auswahlen.
- Listen haben eigene Lade-, Leer- und Fehlerzustaende mit Wiederholungsmoeglichkeit. Laufende Abfragen werden je Pfad zusammengefasst; verspaetete Antworten stellen keine abgewaehlte Auswahl wieder her.
- Der Anlage-Payload wird aus der Store-Auswahl als verschachtelte Zugriffs-Map erzeugt; das bisherige `zugriffe`-FormArray wurde entfernt.
- Jeder ausgewaehlte Unternehmer benoetigt mindestens eine Firma, jede ausgewaehlte Firma mindestens eine Filiale. Laufende Abfragen und Ladefehler verhindern die Freigabe der Anlagedaten. Office-/Filialkonten benoetigen mindestens eine vollstaendige Zuordnung. Eine komplett leere Auswahl ist bei der Anlage nur fuer Master erlaubt; Formular und Backend pruefen diese Bedingung.
- Die Datenberechtigungshelfer gewaehren aktiven Mastern uneingeschraenkten Firmen-/Filial-Lesezugriff; fuer Office/Filiale pruefen sie Unternehmer, Firma und gegebenenfalls Filiale direkt in der verschachtelten Map. Alte Array-Zugriffe werden beim Laden auf `{}` normalisiert und gewaehren keine Datenrechte. Das aktuelle Masterprofil liegt unter `benutzerprofil/{uid}` und verwendet die vereinfachte Zugriffsstruktur.

## Backend und Passwortaenderung

- Store und Service uebergeben den erweiterten Anlage-Payload an die Callable Function `createBenutzer`. Eine gueltige Benutzeranlage kann direkt ueber das Formular gestartet werden; waehrend eines laufenden Aufrufs werden weitere Aufrufe verhindert.
- Der `BenutzerVerwaltungService` erzeugt und startet die Callable Function innerhalb von `runInInjectionContext`, damit AngularFire-Aufrufe korrekt im Angular-Injection-Kontext ausgefuehrt werden.
- Die Function prueft Anmeldung, aktives Profil und `userRole: master` serverseitig und legt per Admin SDK Auth-Benutzer und `benutzerprofil/{uid}` an. Die Sitzung des Masters bleibt erhalten.
- Das Backend verlangt fuer jeden Zugriff eine Unternehmer-ID und prueft vor der Auth-Anlage die Existenz von Unternehmer, Firma und Filialen unter ihren vollstaendigen Pfaden. Fehlende Dokumente, ungueltige IDs oder fehlgeschlagene Pruefabfragen brechen die Anlage ab. Doppelte Firmenzugriffe werden nur innerhalb desselben Unternehmers zusammengefuehrt.
- Das Anfangspasswort wird an Firebase Authentication uebermittelt und nicht in Firestore gespeichert.
- Auth-Konten werden mit `disabled: true` angelegt. Erst nach bestaetigtem Speichern des Profils wird das Konto aktiviert. Ein fehlgeschlagener Profil-Schreibvorgang fuehrt nie zur Aktivierung; das deaktivierte Konto wird nach Moeglichkeit geloescht.
- Bei einem Aktivierungsfehler (auch unklarem Timeout-Ergebnis) versucht das Backend unabhaengig voneinander Auth-Deaktivierung, Profil-Deaktivierung und Auth-Loeschung. Das Profil wird nicht geloescht: Bereits ausgestellte Tokens duerfen nicht auf die Legacy-Regel fuer Konten ohne Profil zurueckfallen. Scheitert eine Bereinigung, wird keine erfolgreiche Rueckabwicklung behauptet; UID und fehlgeschlagener Schritt werden serverseitig protokolliert.
- Manuelle Nachbearbeitung: UID aus dem Fehlerlog pruefen, eventuell vorhandenes Auth-Konto deaktivieren/entfernen und vorhandenes Profil auf `aktiv: false` setzen. Das Profil als Sperrdokument erhalten. Wenn mehrere externe Aufrufe scheitern, ist eine vollstaendige automatische Bereinigung nicht garantiert; die Fehlermeldung fordert die Administratorpruefung an.
- Angemeldete Benutzer koennen ihr Passwort nach erneuter Authentifizierung ueber die Toolbar und `/passwort` aendern. Auf dieser separaten Seite werden neues Passwort und Bestaetigung validiert; es gelten mindestens 8 Zeichen.
- Die Functions-Codebase `pur-office` nutzt Node.js 22 und die Region `europe-west1`.

## Rules und Deployment

- Functions-Deployment fuer die rollenabhaengige Validierung (Office mindestens eine, Filiale genau eine vollstaendige Zuordnung) wurde vom Benutzer bestaetigt. Benutzeranlage, Anmeldung, Bereichsfreigabe, Systemverwaltungssperre, Passwortwechsel und erneute Anmeldung wurden anschliessend bestaetigt. Am 22.09.2026 wurden zusaetzlich reale Office- und Filialkonten mit der neuen Unternehmer-/Firma-/Filiale-Hierarchie angelegt, ihre gespeicherten Profile geprueft und Anmeldung, erlaubte Bereiche sowie die Umleitung von `/systemverwaltung` erfolgreich bestaetigt.

- Die vereinfachte Function ohne Zugriffsindex ist deployed (Benutzerbestaetigung). Die sichere Kontoaktivierung bleibt erhalten.
- Lokal umgesetzt, im Emulator geprueft und laut Benutzer deployed: Aktive Master lesen und schreiben alle Collections und Untercollections inklusive aller Benutzerprofile, sowohl mit `zugriffe: {}` als auch mit der alten leeren Liste.
- Aktive Office-/Filialprofile lesen nur zugeordnete Unternehmer-/Firmendokumente sowie freigegebene Filialen und deren Untercollections. Das eigene Profil bleibt auch fuer inaktive Konten lesbar. Aktive Office-Konten duerfen zugeordnete Firmen- und Filialdokumente vollstaendig aktualisieren, aber weder anlegen noch loeschen und keine Filial-Untercollections beschreiben. Filialkonten bleiben vorerst rein lesend. Die aktualisierten Rules mit diesen Office-Schreibrechten wurden am 22.09.2026 erfolgreich in `pur-system` deployed.
- Benutzeranlage speichert ausschliesslich die validierte Zugriffs-Map. Die Rules pruefen Unternehmer-ID, Firma-ID und Filial-ID direkt in dieser Struktur; ein separater `zugriffsIndex` ist nicht mehr erforderlich.
- Altanwendung nutzt laut Benutzer ausschliesslich Konten ohne `benutzerprofil`-Dokument. Diese behalten den bisherigen Lese-/Schreibzugriff ausserhalb von `benutzerprofil` und `unternehmer`; Emulator-Tests sichern das ab. Fehlgeschlagene Kontoanlage darf kein nutzbares Auth-Konto ohne Profil hinterlassen (lokal durch deaktivierte Anlage abgesichert).
- Office-/Filialqueries muessen erlaubte Dokument-IDs eingrenzen; unbeschraenkte Listen werden abgelehnt. Die aktuellen unbeschraenkten Auswahllisten sind fuer die Master-Verwaltung vorgesehen.
- Neue Rules sind laut Benutzer produktiv; Lesen und Schreiben in der Altanwendung funktionieren weiterhin. Die sichere Kontoaktivierung ist ebenfalls deployed und die Formularsperre wurde entfernt. Reale Schreibversuche eines Office-Kontos auf Firma, Filiale und Filial-Untercollections bleiben bis zur Umsetzung der entsprechenden fachlichen Oberflaeche offen; die vereinbarten Grenzen sind durch Emulator-Tests abgesichert.
- Der Git-Push der aktuellen Aenderungen ist kein Firebase-Deployment.

## Tests und Build

Am 22.09.2026 fuer den aktuellen Frontend-Stand erfolgreich geprueft:

- 186 Frontend-Tests einschliesslich Store-Snapshots, Unternehmer-, Firmen- und Filialdialog, Datenstruktur-Stepper und Dummy zur Verwaltung bestehender Benutzer.
- Der Produktions-Build ist nach der Filialanbindung erfolgreich. Alle 22 Rules-Tests sind erfolgreich: Ein aktiver Master darf verschachtelte Filialen schreiben, Office darf zugeordnete Firmen und Filialen aktualisieren, und Altkonten duerfen weder auf die neue Hierarchie noch auf `benutzer` und `benutzerprofil` zugreifen.
- Frontend-Produktionsbuild erfolgreich.

Die folgenden Backend- und Rules-Pruefungen stammen aus dem dokumentierten Stand vom 19.09.2026:

- 36 Functions-Tests, darunter fehlende Hierarchie-Dokumente, manipulierte IDs, doppelte Zuordnungen und Abbruch vor der Auth-Anlage.
- 22 Firestore-Emulator-Tests fuer Rollen, neue Hierarchie, Untercollections, eingeschraenkte Queries, Office-Aktualisierungen, Schreibschutz sowie die Trennung vom Legacy-Zugriff auf `purCustomers`.
- Functions-Build erfolgreich.

Der durchgaengige Benutzeranlageablauf mit realen Daten wurde am 22.09.2026 fuer je ein Office- und Filialkonto bestaetigt. Die vollstaendige Hierarchie wurde gespeichert, beide Konten konnten sich anmelden und nur ihre erlaubten Bereiche verwenden; die Systemverwaltungsroute blieb durch die Masterpruefung gesperrt. Reale Schreibversuche auf Firma, Filiale und Filial-Untercollections sind noch nicht ueber eine fachliche Oberflaeche moeglich und bleiben separat zu pruefen.

## Rollenpraezisierung: Umsetzung und offene Punkte

- Filialkonten werden genau einer Filiale zugeordnet. Einfachauswahl im UI sowie Seiten- und Backendvalidierung sind umgesetzt; mehrere Firmen oder Filialen werden fuer diese Rolle abgelehnt. Die neue serverseitige Begrenzung wurde laut Benutzer erfolgreich deployed.
- Office-Konten bleiben auf ausgewaehlte Firmen/Filialen beschraenkt; sie erhalten keinen globalen Lesezugriff. Ob eine Firmenfreigabe alle aktuellen und zukuenftigen Filialen umfasst, ist noch offen. Aktuell werden Filialen explizit gespeichert.
- Master benoetigen keine Datenzuordnung und besitzen globalen Lese- und Schreibzugriff. Die Datenzuordnung ist im Formular fuer Master ausgeblendet; das Formular sendet fuer Master eine leere Zugriffs-Map.
- Office-Konten duerfen zugeordnete Firmen- und Filialdokumente aktualisieren, jedoch nicht anlegen oder loeschen. Schreibrechte fuer Filial-Untercollections sowie eigene Schreibrechte von Filialkonten werden erst zusammen mit den jeweiligen fachlichen Funktionen festgelegt und umgesetzt.

## Naechste sinnvolle Schritte

Die konkrete Arbeitsplanung steht in [Offene Todos](./next_todo.md).
