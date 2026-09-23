<!-- pur-office/docs/projekt-stand.md -->

# Projekt-Stand: Pur Office

Stand: 23.09.2026. Dieses Dokument beschreibt den aktuellen Umsetzungsstand im Code. Das fachliche Zielbild steht separat im [Projekt-Plan](./projekt-plan.md).

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
- [x] Die Sidebar enthält Links für Dashboard, Schichtplan, Mitarbeiter, Verwaltung und Systemverwaltung, sofern der jeweilige Bereich im Benutzerprofil freigegeben ist.
- [x] Die Toolbar zeigt den Titel der aktiven Route und den Menübutton.
- [x] Die Toolbar bietet einen Dark-/Light-Mode-Umschalter und im Entwicklungsmodus einen Button für die Snapshots der aktiven Stores.
- [x] Die Toolbar zeigt während zentral registrierter Datenabfragen eine globale unbestimmte Progress-Bar.
- [x] Die Loginseite verwendet eine reduzierte App-Shell ohne Sidebar und Navigationstaste, aber mit Pur-Office-Produktkennung in der Toolbar.
- [x] Das Layout reagiert auf kleinere Bildschirmbreiten.
- [x] Die Sidebar enthält den Bereich Systemverwaltung für berechtigte Master-Benutzer.

## Seiten und Routen

- [x] `dashboard-page` wurde unter `src/app/pages/dashboard-page` angelegt.
- [x] `schichtplan-page` wurde unter `src/app/pages/schichtplan-page` angelegt.
- [x] `mitarbeiter-page` wurde unter `src/app/pages/mitarbeiter-page` angelegt.
- [x] Routen für `/dashboard`, `/schichtplan` und `/mitarbeiter` werden per `loadComponent` geladen.
- [x] `/` leitet auf `/dashboard` weiter.
- [x] Die Route `/systemverwaltung` und die `systemverwaltung-page` enthalten die Bereiche Datenstruktur anlegen, Benutzer anlegen und den UI-Dummy Benutzer verwalten.
- [x] Die Route `/verwaltung` enthält die Auswahl zugeordneter Stammdaten und die Bearbeitung bestehender Firmen- und Filialdaten.
- [x] Die geschützte Route `/passwort` ermöglicht angemeldeten Benutzern eine Passwortänderung.

## Firebase-Grundlage

- [x] Firebase und AngularFire sind installiert.
- [x] Firebase-Konfiguration liegt unter `src/environments`.
- [x] Firebase App, Auth und Firestore werden in `app.config.ts` bereitgestellt.
- [x] Firestore ist mit lokalem Cache vorbereitet.
- [x] Firebase Tokens für Auth sowie lesende und schreibende Firestore-Zugriffe sind vorbereitet.
- [x] Technische Firebase-Anbindungen liegen unter `src/app/services/firebase`; fachliche Services liegen getrennt unter `src/app/services/domain`.
- [x] Der technische `FirestoreDbService` kapselt Collection-Lesen, Dokument-Lesen, Anlegen, Merge-Aktualisieren, Server-Zeitstempel und den Angular-Injection-Kontext.
- [x] Firestore-Collection- und Dokumentpfade für Benutzerprofile, Unternehmer, Firmen und Filialen werden zentral in `firebase.constants.ts` erzeugt.
- [x] `BenutzerService`, `UnternehmerService`, `FirmaService` und `FilialeService` verwenden keine direkten AngularFire-Aufrufe mehr, sondern greifen über den `FirestoreDbService` zu.
- [x] Der app-weite `StammdatenStore` initialisiert nach dem Benutzerprofil einmalig die für die Sitzung erlaubten Unternehmer-, Firmen- und Filialdaten; Master laden zusätzlich alle Benutzerprofile.
- [x] Verwaltung, Systemverwaltung und Datenzugriffsauswahl verwenden den gemeinsamen Sitzungsbestand. Er wird bei Neuanlagen direkt aktualisiert und bei Logout oder Benutzerwechsel zurückgesetzt.
- [x] Offline-Ladestrategien, Pending-Sync, Migrationen und Batch-Schreibvorgänge aus der Altanwendung wurden bewusst noch nicht übernommen.
- [x] Es gibt keine öffentliche Selbstregistrierung.

## Login und Benutzerberechtigungen

- [x] Loginseite mit E-Mail/Passwort-Formular ist angelegt.
- [x] Bestehende Firebase-Benutzer können sich anmelden.
- [x] Benutzerprofile werden lesend aus `benutzerprofil/{uid}` geladen.
- [x] Der Angular-Client schreibt derzeit keine Benutzerprofile direkt; die Anlage von Auth-Konto und Profil ist im Backend umgesetzt. Aktive Master dürfen fachliche Verwaltungsdaten direkt in Firestore schreiben.
- [x] Benutzerprofile enthalten zusätzlich `userRole` mit `filiale`, `office` oder `master`.
- [x] Allgemeine Bereichsfreigaben richten sich nach `erlaubteBereiche`; Systemverwaltung erfordert zusätzlich `userRole: master`, Verwaltung zusätzlich `userRole: office` oder `userRole: master`.
- [x] App-Routen sind mit `authGuard` geschützt.
- [x] Bereichsrouten werden über `bereichGuard` und `data: { bereich: ... }` abgesichert.
- [x] Sidebar-Navigation wird über `erlaubteBereiche` eingeschränkt.
- [x] Der `verwaltungGuard` schließt Filialkonten auch dann von `/verwaltung` aus, wenn deren Profil den Bereichsschlüssel fälschlich enthält.
- [x] Firmen-/Filial-Zugriffe werden im Benutzerprofil als verschachtelte Map `Unternehmer-ID -> Firma-ID -> Filial-IDs` abgebildet.
- [x] Firebase-Fehler werden benutzerfreundlich angezeigt.

## Systemverwaltung und Zugangsdaten

- Der Bereich Systemverwaltung ist im Client durch `erlaubteBereiche` und `userRole: master` geschützt.
- Die `SystemverwaltungPage` ist ein Container für die eigenständigen Bereiche Datenstruktur-Anlage, Benutzeranlage und Benutzerverwaltung.
- Das Formular gliedert sich in Zugangsdaten, erlaubte Bereiche und Datenzugriff. Alle Gruppen verwenden `div`-Elemente mit sichtbaren Überschriften, ohne `role="group"`, `aria-label` oder `aria-labelledby`, statt `fieldset`/`legend`. Die `h2`-Überschriften werden zentral über `pur-form__group-titel` in `forms.scss` gestaltet. Zugangsdaten enthalten Anzeigename, Benutzerrolle, E-Mail und Passwort.
- Der Master vergibt das Anfangspasswort ausschließlich selbst: ein Feld mit Ein-/Ausblendfunktion und dem Label „Passwort (mind. 8 Zeichen)“. Es gibt weder Passwortbestätigung bei der Anlage noch eine Variante zur erstmaligen Passwortvergabe durch den Benutzer.
- Pflichtfelder, E-Mail, Passwortlänge und mindestens ein erlaubter Bereich werden clientseitig validiert.
- `zugangsdaten` ist ein lokaler CSS-Container. Das bestehende `pur-form--grid` zeigt zwei Spalten, bei maximal 600 Pixel Containerbreite eine Spalte. `pur-form__row` verwendet standardmäßig Flex mit Umbruch; die Bereiche-Checkboxen umbrechen nach verfügbarem Platz. Der Aktionsbutton ist rechts ausgerichtet.
- Die Vorschau-Sperre ist entfernt. Gültige Formulare mit gültiger Datenzugriffsauswahl können abgesendet werden; während der Anlage werden weitere Aufrufe verhindert. Nach Erfolg werden Formular, Auswahl und der Absendezustand der FormGroupDirective zurückgesetzt; leere Pflichtfelder zeigen dadurch keine Fehler. Die Erfolgsmeldung bleibt erhalten; bei Fehlern bleiben die Eingaben erhalten.

## Datenstruktur-Anlage

- Die Systemverwaltungsseite enthält einen linearen Angular-Material-Stepper für die hierarchische Anlage von Unternehmer, Firma und Filiale.
- Schritt 1 lädt alle Unternehmer aus `unternehmer`, erlaubt die Auswahl eines vorhandenen Eintrags und öffnet für die Neuanlage einen Material-Dialog.
- Der Unternehmerdialog erfasst einen Anzeigenamen sowie die eingebettete Person mit Vorname, Nachname, Adresse und optionalen Kontaktdaten. Die fortlaufende Unternehmernummer wird aus der vollständig geladenen Store-Liste mit `max(nummer) + 1` bestimmt.
- Neue Unternehmer werden durch einen aktiven Master direkt unter `unternehmer/{unternehmerId}` in Firestore gespeichert, in die sortierte Store-Liste übernommen und anschließend im Stepper ausgewählt.
- Schritt 2 lädt die Firmen des ausgewählten Unternehmers, erlaubt die Auswahl eines vorhandenen Eintrags und öffnet für die Neuanlage einen Material-Dialog.
- Der Firmendialog erfasst getrennt den kurzen `anzeigename` für Auswahlen und den vollständigen `firmenname` sowie die Adresse und optionale Kontaktdaten. Die fortlaufende Firmennummer wird innerhalb des Unternehmers aus der vollständig geladenen Store-Liste mit `max(nummer) + 1` bestimmt.
- Neue Firmen werden direkt unter `unternehmer/{unternehmerId}/firma/{firmaId}` gespeichert, in die sortierte Firmenliste übernommen und anschließend im Stepper ausgewählt. Ein Unternehmerwechsel setzt Firma und Filiale zurück und lädt den passenden Firmenbestand.
- Schritt 3 lädt die Filialen der ausgewählten Firma und öffnet für die Neuanlage einen Material-Dialog. Eine Auswahl bereits vorhandener Filialen ist in diesem reinen Anlageschritt bewusst nicht vorgesehen.
- Der Filialdialog erfasst getrennt den kurzen `anzeigename` für Auswahlen und den vollständigen `filialname` sowie die Adresse und optionale Kontaktdaten. Die fortlaufende Filialnummer wird innerhalb der Firma aus der vollständig geladenen Store-Liste mit `max(nummer) + 1` bestimmt.
- Neue Filialen werden direkt unter `unternehmer/{unternehmerId}/firma/{firmaId}/filiale/{filialeId}` gespeichert, in die sortierte Filialliste übernommen und in der Hierarchie-Zusammenfassung angezeigt. Ein Unternehmer- oder Firmenwechsel setzt die abhängige Filiale zurück und lädt den passenden Filialbestand.
- Pflichtfelder und vollständig geladene Listen steuern die Zurück-/Weiter-Navigation sowie die Freigabe der jeweiligen Anlagedialoge.
- Bis 720 Pixel wechselt der Stepper in die vertikale Ausrichtung.
- Unternehmer, Firma und Filiale werden schrittweise direkt gespeichert; ein zusätzlicher abschließender Sammel-Speicherbutton ist deshalb nicht erforderlich.
- Der vollständige Anlageablauf wurde vom Benutzer am 22.09.2026 gegen echtes Firestore bestätigt: Unternehmer, Firma und Filiale wurden unter dem vorgesehenen verschachtelten Pfad gespeichert, im UI korrekt zusammengefasst und nach einem Anwendungsneustart erneut geladen.

## Bestehende Benutzer verwalten

- Unter `systemverwaltung-page/benutzer-verwaltung` ist ein eigenständiger UI-Dummy für die spätere Profilbearbeitung angelegt.
- Der Bereich zeigt ein Benutzer-Select, einen erst nach Auswahl aktivierbaren Bearbeiten-Button und einen sichtbaren Hinweis auf die noch fehlende Datenanbindung.
- Es werden keine produktiven Mockprofile verwendet. Für Master stehen die Benutzerprofile bereits im zentralen Sitzungsbestand bereit; das Benutzer-Select und die Profilaktualisierung sind noch nicht daran angebunden.
- `IBenutzerProfilEintrag` bildet ein geladenes Profil mit seiner Dokument-ID als `uid` ab. `IBenutzerProfilAktualisierung` begrenzt die vorbereiteten Änderungen auf Anzeigename, Aktivstatus, Rolle, erlaubte Bereiche und Datenzugriffe; E-Mail-Adresse und Passwort sind ausgeschlossen.
- Die weitere Umsetzung mit Laden, Bearbeitungsdialog, Selbstschutz und Speichern ist in Todo 4.3 beschrieben.

## Firmen- und Filialverwaltung

- Unter `/verwaltung` ist eine eigenständige Seite für die Bearbeitung von Firmen- und Filialstammdaten angelegt. Die Route erfordert den Bereich `verwaltung` und zusätzlich die Rolle Office oder Master; Filialkonten werden unabhängig vom Bereichsschlüssel ausgeschlossen.
- Master wählen Unternehmer, Firma und Filiale über abhängige Material-Selects. Für Office wird der einzige zugeordnete Unternehmer automatisch gewählt und nicht als eigene Auswahl angezeigt; anschließend stehen die erlaubten Firmen und Filialen zur Auswahl. Ein Unternehmerwechsel setzt Firma und Filiale zurück; ein Firmenwechsel setzt die Filiale zurück.
- Der seitenbezogene `VerwaltungStore` verwaltet die Listen, Auswahlen sowie getrennte Lade-, Leer- und Fehlerzustände und ist an die Store-Snapshot-Ausgabe angebunden.
- Office-Konten laden bei der Sitzungsinitialisierung ausschließlich die im Benutzerprofil unter `zugriffe` enthaltenen Unternehmer-, Firmen- und Filialdokumente über ihre vollständigen Dokumentpfade. Es werden für Office keine unbeschränkten Collection-Abfragen ausgeführt.
- Masterkonten besitzen keine erforderliche Zugriffszuordnung und laden bei der Sitzungsinitialisierung die vollständige Hierarchie sowie alle Benutzerprofile.
- Die Auswahl verwendet anschließend den zentralen Sitzungsbestand. Ausgewählte Firmen und Filialen können über getrennte Material-Dialoge bearbeitet werden; sie umfassen Anzeigename, Firmen- beziehungsweise Filialname, vollständige Adresse und optionale Kontaktdaten.
- Dokument-ID, Nummer, Aktivstatus und Hierarchiepfad bleiben unverändert. `FirmaService` und `FilialeService` speichern ausschließlich die bearbeitbaren Felder und setzen `aktualisiertAm` mit einem Server-Zeitstempel.
- Nach erfolgreichem Speichern werden Verwaltungs- und Stammdatenbestand unmittelbar aktualisiert. Eine weitere Firestore-Abfrage ist nicht erforderlich.

## Globaler Ladeindikator

- Der globale `LoadingService` zählt parallele Ladevorgänge und blendet den Ladeindikator erst nach Abschluss des letzten registrierten Vorgangs aus.
- Die App-Toolbar zeigt während aktiver Ladevorgänge eine schmale unbestimmte Material-Progress-Bar an ihrem unteren Rand.
- Die aktuellen Firestore-Lesevorgänge für Benutzerprofile, Unternehmer, Firmen und Filialen werden im `FirestoreDbService` zentral an die Ladeanzeige angebunden. Damit werden auch die davon abhängigen Datenzugriffslisten und Verwaltungslisten erfasst.
- Seiten zeigen keine zusätzlichen allgemeinen Ladetexte mehr. Fachliche Fehler- und Leerzustände bleiben direkt im jeweiligen Seitenbereich sichtbar.

## Datenzugriff-Auswahl mit Firebase

- Die wiederverwendbare Component liegt unter `src/app/components/datenzugriff-auswahl`; ihre Auswahlmodelle liegen in `src/app/commons/models/domain/datenzugriff.ts`.
- Die Systemverwaltungsseite lädt Unternehmer aus `unternehmer`, Firmen aus `firma` und Filialen aus `filiale`. Die produktiven Mock-Daten wurden entfernt. `UnternehmerService`, `FirmaService` und `FilialeService` kapseln Laden und Anlegen ihrer vollständigen Domäneneinträge. Das gemeinsame Datenzugriff-Auswahlmodell und die Firestore-Dokumente verwenden auf allen Ebenen einheitlich `anzeigename`; `DatenzugriffService` bildet alle drei Domäneneinträge auf kompakte Auswahleinträge ab. Fehlende Anzeigenamen werden durch die Dokument-ID ersetzt.
- Die Gruppe Datenzugriff verwendet einen `div` mit sichtbarer Überschrift statt eines `fieldset`: In der Browser-Nachstellung kollabierte ein darin verschachtelter Größencontainer beim Einblenden von Meldungen. Die Container-Abfrage der wiederverwendbaren Component bleibt erhalten; die Korrektur wurde ein- und dreispaltig geprüft.
- Drei Material-Selects bilden Unternehmer -> Firmen -> Filialen ab. Ohne passende übergeordnete Auswahl beziehungsweise verfügbare Optionen sind nachgelagerte Selects deaktiviert.
- Die Inputs `unternehmerMehrfach`, `firmenMehrfach` und `filialenMehrfach` sind standardmäßig alle `false`. Die Systemverwaltungsseite erzeugt je Rolle eigene Komponenteninstanzen mit festen Modi: Filiale `false`, `false`, `false`; Office `false`, `true`, `true`; Master ohne Auswahlkomponente. Rollenwechsel setzt die Zuordnungen zurück, ohne den Auswahlmodus einer bestehenden Instanz zu ändern.
- Firmen erhalten nur dann Unternehmergruppen, wenn `unternehmerMehrfach` aktiv ist und mehr als ein Unternehmer ausgewählt wurde. Filialen erhalten nur dann Firmengruppen, wenn `firmenMehrfach` aktiv ist und mehr als eine Firma ausgewählt wurde.
- Bei mehreren ausgewählten Einträgen erscheint die Anzahl direkt im jeweiligen Select. Hints und die separate Auswahlstatus-Zeile wurden entfernt.
- Interne zusammengesetzte Auswahlschlüssel erhalten die Unternehmer-/Firmenzuordnung auch bei gleichen untergeordneten IDs. Diese Schlüssel sind kein gespeichertes Berechtigungsmodell.
- Abgewählte Unternehmer oder Firmen verlieren ihre abhängige Auswahl; andere Auswahlen bleiben bestehen. Die Auswahlmodi werden beim Einbinden festgelegt und während der Lebensdauer der Component nicht umgeschaltet; je Ebene gibt es ein Select mit gebundenem `multiple`.
- Die Component erhält Daten und Auswahl vom `BenutzerVerwaltungStore` über die Systemverwaltungsseite. Model-Inputs melden Auswahlereignisse zurück. Der Store lädt abhängige Listen, speichert sie nach vollständigem Pfad zwischen und bereinigt abhängige Auswahlen.
- Listen haben eigene Lade-, Leer- und Fehlerzustände mit Wiederholungsmöglichkeit. Laufende Abfragen werden je Pfad zusammengefasst; verspätete Antworten stellen keine abgewählte Auswahl wieder her.
- Der Anlage-Payload wird aus der Store-Auswahl als verschachtelte Zugriffs-Map erzeugt; das bisherige `zugriffe`-FormArray wurde entfernt.
- Jeder ausgewählte Unternehmer benötigt mindestens eine Firma, jede ausgewählte Firma mindestens eine Filiale. Laufende Abfragen und Ladefehler verhindern die Freigabe der Anlagedaten. Office-/Filialkonten benötigen mindestens eine vollständige Zuordnung. Eine komplett leere Auswahl ist bei der Anlage nur für Master erlaubt; Formular und Backend prüfen diese Bedingung.
- Die Datenberechtigungshelfer gewähren aktiven Mastern uneingeschränkten Firmen-/Filial-Lesezugriff; für Office/Filiale prüfen sie Unternehmer, Firma und gegebenenfalls Filiale direkt in der verschachtelten Map. Alte Array-Zugriffe werden beim Laden auf `{}` normalisiert und gewähren keine Datenrechte. Das aktuelle Masterprofil liegt unter `benutzerprofil/{uid}` und verwendet die vereinfachte Zugriffsstruktur.

## Backend und Passwortänderung

- Store und Service übergeben den erweiterten Anlage-Payload an die Callable Function `createBenutzer`. Eine gültige Benutzeranlage kann direkt über das Formular gestartet werden; während eines laufenden Aufrufs werden weitere Aufrufe verhindert.
- Der `BenutzerVerwaltungService` erzeugt und startet die Callable Function innerhalb von `runInInjectionContext`, damit AngularFire-Aufrufe korrekt im Angular-Injection-Kontext ausgeführt werden.
- Die Function prüft Anmeldung, aktives Profil und `userRole: master` serverseitig und legt per Admin SDK Auth-Benutzer und `benutzerprofil/{uid}` an. Die Sitzung des Masters bleibt erhalten.
- Das Backend verlangt für jeden Zugriff eine Unternehmer-ID und prüft vor der Auth-Anlage die Existenz von Unternehmer, Firma und Filialen unter ihren vollständigen Pfaden. Fehlende Dokumente, ungültige IDs oder fehlgeschlagene Prüfabfragen brechen die Anlage ab. Doppelte Firmenzugriffe werden nur innerhalb desselben Unternehmers zusammengeführt.
- Das Anfangspasswort wird an Firebase Authentication übermittelt und nicht in Firestore gespeichert.
- Auth-Konten werden mit `disabled: true` angelegt. Erst nach bestätigtem Speichern des Profils wird das Konto aktiviert. Ein fehlgeschlagener Profil-Schreibvorgang führt nie zur Aktivierung; das deaktivierte Konto wird nach Möglichkeit gelöscht.
- Bei einem Aktivierungsfehler (auch unklarem Timeout-Ergebnis) versucht das Backend unabhängig voneinander Auth-Deaktivierung, Profil-Deaktivierung und Auth-Löschung. Das Profil wird nicht gelöscht: Bereits ausgestellte Tokens dürfen nicht auf die Legacy-Regel für Konten ohne Profil zurückfallen. Scheitert eine Bereinigung, wird keine erfolgreiche Rückabwicklung behauptet; UID und fehlgeschlagener Schritt werden serverseitig protokolliert.
- Manuelle Nachbearbeitung: UID aus dem Fehlerlog prüfen, eventuell vorhandenes Auth-Konto deaktivieren/entfernen und vorhandenes Profil auf `aktiv: false` setzen. Das Profil als Sperrdokument erhalten. Wenn mehrere externe Aufrufe scheitern, ist eine vollständige automatische Bereinigung nicht garantiert; die Fehlermeldung fordert die Administratorprüfung an.
- Angemeldete Benutzer können ihr Passwort nach erneuter Authentifizierung über die Toolbar und `/passwort` ändern. Auf dieser separaten Seite werden neues Passwort und Bestätigung validiert; es gelten mindestens 8 Zeichen.
- Die Functions-Codebase `pur-office` nutzt Node.js 22 und die Region `europe-west1`.

## Rules und Deployment

- Functions-Deployment für die rollenabhängige Validierung (Office mindestens eine, Filiale genau eine vollständige Zuordnung) wurde vom Benutzer bestätigt. Benutzeranlage, Anmeldung, Bereichsfreigabe, Systemverwaltungssperre, Passwortwechsel und erneute Anmeldung wurden anschließend bestätigt. Am 22.09.2026 wurden zusätzlich reale Office- und Filialkonten mit der neuen Unternehmer-/Firma-/Filiale-Hierarchie angelegt, ihre gespeicherten Profile geprüft und Anmeldung, erlaubte Bereiche sowie die Umleitung von `/systemverwaltung` erfolgreich bestätigt.

- Die vereinfachte Function ohne Zugriffsindex ist deployed (Benutzerbestätigung). Die sichere Kontoaktivierung bleibt erhalten.
- Lokal umgesetzt, im Emulator geprüft und laut Benutzer deployed: Aktive Master lesen und schreiben alle Collections und Untercollections inklusive aller Benutzerprofile, sowohl mit `zugriffe: {}` als auch mit der alten leeren Liste.
- Aktive Office-/Filialprofile lesen nur zugeordnete Unternehmer-/Firmendokumente sowie freigegebene Filialen und deren Untercollections. Das eigene Profil bleibt auch für inaktive Konten lesbar. Aktive Office-Konten dürfen zugeordnete Firmen- und Filialdokumente vollständig aktualisieren, aber weder anlegen noch löschen und keine Filial-Untercollections beschreiben. Filialkonten bleiben vorerst rein lesend. Die aktualisierten Rules mit diesen Office-Schreibrechten wurden am 22.09.2026 erfolgreich in `pur-system` deployed.
- Benutzeranlage speichert ausschließlich die validierte Zugriffs-Map. Die Rules prüfen Unternehmer-ID, Firma-ID und Filial-ID direkt in dieser Struktur; ein separater `zugriffsIndex` ist nicht mehr erforderlich.
- Altanwendung nutzt laut Benutzer ausschließlich Konten ohne `benutzerprofil`-Dokument. Diese behalten den bisherigen Lese-/Schreibzugriff außerhalb von `benutzerprofil` und `unternehmer`; Emulator-Tests sichern das ab. Fehlgeschlagene Kontoanlage darf kein nutzbares Auth-Konto ohne Profil hinterlassen (lokal durch deaktivierte Anlage abgesichert).
- Office-/Filialqueries müssen erlaubte Dokument-IDs eingrenzen; unbeschränkte Listen werden abgelehnt. Die aktuellen unbeschränkten Auswahllisten sind für die Master-Verwaltung vorgesehen.
- Neue Rules sind laut Benutzer produktiv; Lesen und Schreiben in der Altanwendung funktionieren weiterhin. Die sichere Kontoaktivierung ist ebenfalls deployed und die Formularsperre wurde entfernt. Ein reales Office-Testkonto konnte seine zugeordnete Firma und Filiale über die fachliche Verwaltungsoberfläche erfolgreich aktualisieren. Nicht zugeordnete Dokumente, Neuanlagen, Löschungen und Schreibzugriffe auf Filial-Untercollections werden durch Emulator-Tests abgelehnt.
- Der Git-Push der aktuellen Änderungen ist kein Firebase-Deployment.

## Tests und Build

Am 23.09.2026 für den aktuellen Frontend-Stand erfolgreich geprüft:

- 244 Frontend-Tests einschließlich Store-Snapshots, Datenstruktur-Anlage, zentraler Stammdateninitialisierung sowie Firmen- und Filialdaten-Bearbeitung.
- 36 Functions-Tests einschließlich Rollenprüfung, Hierarchievalidierung und sicherer Kontoaktivierung.
- 22 Firestore-Emulator-Tests für Rollen, neue Hierarchie, Untercollections, eingeschränkte Queries, Office-Aktualisierungen, Schreibschutz sowie die Trennung vom Legacy-Zugriff auf `purCustomers`. Vorhandene, aber nicht zugeordnete Firmen und Filialen können durch Office nicht aktualisiert werden.
- Frontend-Produktionsbuild erfolgreich.

Der durchgängige Benutzeranlageablauf mit realen Daten wurde am 22.09.2026 für je ein Office- und Filialkonto bestätigt. Die vollständige Hierarchie wurde gespeichert, beide Konten konnten sich anmelden und nur ihre erlaubten Bereiche verwenden; die Systemverwaltungsroute blieb durch die Masterprüfung gesperrt. Am 23.09.2026 wurde zusätzlich die erfolgreiche Aktualisierung einer zugeordneten Firma und Filiale mit einem realen Office-Testkonto bestätigt. Die übrigen Schreibgrenzen sind durch die erfolgreichen Firestore-Emulator-Tests abgesichert.

## Rollenpräzisierung: Umsetzung und offene Punkte

- Filialkonten werden genau einer Filiale zugeordnet. Einfachauswahl im UI sowie Seiten- und Backendvalidierung sind umgesetzt; mehrere Firmen oder Filialen werden für diese Rolle abgelehnt. Die neue serverseitige Begrenzung wurde laut Benutzer erfolgreich deployed.
- Office-Konten bleiben auf ausgewählte Firmen und ausdrücklich zugeordnete Filialen beschränkt; sie erhalten keinen globalen Lesezugriff. Eine Firmenfreigabe umfasst weder automatisch alle aktuellen noch zukünftige Filialen.
- Master benötigen keine Datenzuordnung und besitzen globalen Lese- und Schreibzugriff. Die Datenzuordnung ist im Formular für Master ausgeblendet; das Formular sendet für Master eine leere Zugriffs-Map.
- Office-Konten dürfen zugeordnete Firmen- und Filialdokumente aktualisieren, jedoch nicht anlegen oder löschen. Schreibrechte für Filial-Untercollections sowie eigene Schreibrechte von Filialkonten werden erst zusammen mit den jeweiligen fachlichen Funktionen festgelegt und umgesetzt.

## Nächste sinnvolle Schritte

Die konkrete Arbeitsplanung steht in [Offene Todos](./next_todo.md).
