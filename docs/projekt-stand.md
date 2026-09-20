<!-- pur-office/docs/projekt-stand.md -->

# Projekt-Stand: Pur Office

Stand: 20.09.2026. Dieses Dokument beschreibt den aktuellen Umsetzungsstand im Code. Das fachliche Zielbild steht separat im [Projekt-Plan](./projekt-plan.md).

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
- [x] Die Route `/verwaltung` und die `verwaltung-page` sind mit dem Formular zur Benutzeranlage und der Datenzugriff-Vorschau umgesetzt.
- [x] Die geschuetzte Route `/passwort` ermoeglicht angemeldeten Benutzern eine Passwortaenderung.

## Firebase-Grundlage

- [x] Firebase und AngularFire sind installiert.
- [x] Firebase-Konfiguration liegt unter `src/environments`.
- [x] Firebase App, Auth und Firestore werden in `app.config.ts` bereitgestellt.
- [x] Firestore ist mit lokalem Cache vorbereitet.
- [x] Firebase Tokens fuer Auth und lesende Firestore-Zugriffe sind vorbereitet.
- [x] Firebase-nahe Services sind unter `src/app/services/firebase` vorgesehen.
- [x] Es gibt keine oeffentliche Selbstregistrierung.

## Login und Benutzerberechtigungen

- [x] Loginseite mit E-Mail/Passwort-Formular ist angelegt.
- [x] Bestehende Firebase-Benutzer koennen sich anmelden.
- [x] Benutzerprofile werden lesend aus `benutzer/{uid}` geladen.
- [x] Der Angular-Client schreibt keine Benutzerprofile direkt; die administrative Anlage ist im Backend umgesetzt.
- [x] Benutzerprofile enthalten zusaetzlich `userRole` mit `filiale`, `office` oder `master`.
- [x] Allgemeine Bereichsfreigaben richten sich nach `erlaubteBereiche`; Verwaltung erfordert zusaetzlich `userRole: master`.
- [x] App-Routen sind mit `authGuard` geschuetzt.
- [x] Bereichsrouten werden ueber `bereichGuard` und `data: { bereich: ... }` abgesichert.
- [x] Sidebar-Navigation wird ueber `erlaubteBereiche` eingeschraenkt.
- [x] Firmen-/Filial-Zugriffe werden im Benutzerprofil als verschachtelte Map `Unternehmer-ID -> Firma-ID -> Filial-IDs` abgebildet.
- [x] Firebase-Fehler werden benutzerfreundlich angezeigt.

## Verwaltung und Zugangsdaten

- Der Bereich Verwaltung ist im Client durch `erlaubteBereiche` und `userRole: master` geschuetzt.
- Das Formular gliedert sich in Zugangsdaten, erlaubte Bereiche und Datenzugriff. Alle Gruppen verwenden `div`-Elemente mit sichtbaren Ueberschriften, ohne `role="group"`, `aria-label` oder `aria-labelledby`, statt `fieldset`/`legend`. Die `h2`-Ueberschriften werden zentral ueber `pur-form__group-titel` in `forms.scss` gestaltet. Zugangsdaten enthalten Anzeigename, Benutzerrolle, E-Mail und Passwort.
- Der Master vergibt das Anfangspasswort ausschliesslich selbst: ein Feld mit Ein-/Ausblendfunktion und dem Label „Passwort (mind. 8 Zeichen)“. Es gibt weder Passwortbestaetigung bei der Anlage noch eine Variante zur erstmaligen Passwortvergabe durch den Benutzer.
- Pflichtfelder, E-Mail, Passwortlaenge und mindestens ein erlaubter Bereich werden clientseitig validiert.
- `zugangsdaten` ist ein lokaler CSS-Container. Das bestehende `pur-form--grid` zeigt zwei Spalten, bei maximal 600 Pixel Containerbreite eine Spalte. `pur-form__row` verwendet standardmaessig Flex mit Umbruch; die Bereiche-Checkboxen umbrechen nach verfuegbarem Platz. Der Aktionsbutton ist rechts ausgerichtet.
- Die Vorschau-Sperre ist entfernt. Gueltige Formulare mit gueltiger Datenzugriffsauswahl koennen abgesendet werden; waehrend der Anlage werden weitere Aufrufe verhindert. Nach Erfolg werden Formular, Auswahl und der Absendezustand der FormGroupDirective zurueckgesetzt; leere Pflichtfelder zeigen dadurch keine Fehler. Die Erfolgsmeldung bleibt erhalten; bei Fehlern bleiben die Eingaben erhalten.

## Datenstruktur-Anlage

- Die Verwaltungsseite enthaelt einen linearen Angular-Material-Stepper als UI-Dummy fuer die hierarchische Anlage von Unternehmer, Firma und Filiale.
- Unternehmer und Firma koennen jeweils als vorhandener Eintrag ausgewaehlt oder als neuer Name vorbereitet werden. Da der Dummy noch keine lesende Datenanbindung besitzt, zeigen die vorhandenen Auswahlen derzeit keine Eintraege; standardmaessig ist die Neuanlage aktiv.
- Pflichtfelder steuern die Zurueck-/Weiter-Navigation. Der dritte Schritt erfasst die Filiale und zeigt die vorbereitete Hierarchie zusammenfassend an.
- Bis 720 Pixel wechselt der Stepper in die vertikale Ausrichtung.
- Es erfolgen noch keine Firestore-Schreibzugriffe. Der abschliessende Anlagebutton ist deaktiviert und die fehlende Speicheranbindung wird sichtbar erklaert.
- Component- und Seitenintegration sind getestet; 120 Frontend-Tests und der Produktionsbuild waren am 20.09.2026 erfolgreich. Die manuelle Sichtpruefung steht noch aus.

## Datenzugriff-Auswahl mit Firebase

- Die wiederverwendbare Component liegt unter `src/app/components/datenzugriff-auswahl`; ihre Auswahlmodelle liegen in `src/app/commons/models/domain/datenzugriff.ts`.
- Die Verwaltungsseite laedt Unternehmer aus `unternehmer`, Firmen aus `firma` und Filialen aus `filiale`. Die produktiven Mock-Daten wurden entfernt. `DatenzugriffService` kapselt die Abfragen und ordnet Dokument-IDs sowie `customerName`, `companyName` und `branchName` dem Auswahlmodell zu. Fehlende Namen werden durch die Dokument-ID ersetzt.
- Die Gruppe Datenzugriff verwendet einen `div` mit sichtbarer Ueberschrift statt eines `fieldset`: In der Browser-Nachstellung kollabierte ein darin verschachtelter Groessencontainer beim Einblenden von Meldungen. Die Container-Abfrage der wiederverwendbaren Component bleibt erhalten; die Korrektur wurde ein- und dreispaltig geprueft.
- Drei Material-Selects bilden Unternehmer -> Firmen -> Filialen ab. Ohne passende uebergeordnete Auswahl beziehungsweise verfuegbare Optionen sind nachgelagerte Selects deaktiviert.
- Die Inputs `unternehmerMehrfach`, `firmenMehrfach` und `filialenMehrfach` sind standardmaessig alle `false`. Die Verwaltungsseite erzeugt je Rolle eigene Komponenteninstanzen mit festen Modi: Filiale `false`, `false`, `false`; Office `false`, `true`, `true`; Master ohne Auswahlkomponente. Rollenwechsel setzt die Zuordnungen zurueck, ohne den Auswahlmodus einer bestehenden Instanz zu aendern.
- Firmen erhalten nur dann Unternehmergruppen, wenn `unternehmerMehrfach` aktiv ist und mehr als ein Unternehmer ausgewaehlt wurde. Filialen erhalten nur dann Firmengruppen, wenn `firmenMehrfach` aktiv ist und mehr als eine Firma ausgewaehlt wurde.
- Bei mehreren ausgewaehlten Eintraegen erscheint die Anzahl direkt im jeweiligen Select. Hints und die separate Auswahlstatus-Zeile wurden entfernt.
- Interne zusammengesetzte Auswahlschluessel erhalten die Unternehmer-/Firmenzuordnung auch bei gleichen untergeordneten IDs. Diese Schluessel sind kein gespeichertes Berechtigungsmodell.
- Abgewaehlte Unternehmer oder Firmen verlieren ihre abhaengige Auswahl; andere Auswahlen bleiben bestehen. Die Auswahlmodi werden beim Einbinden festgelegt und waehrend der Lebensdauer der Component nicht umgeschaltet; je Ebene gibt es ein Select mit gebundenem `multiple`.
- Die Component erhaelt Daten und Auswahl vom `BenutzerVerwaltungStore` ueber die Verwaltungsseite. Model-Inputs melden Auswahlereignisse zurueck. Der Store laedt abhaengige Listen, speichert sie nach vollstaendigem Pfad zwischen und bereinigt abhaengige Auswahlen.
- Listen haben eigene Lade-, Leer- und Fehlerzustaende mit Wiederholungsmoeglichkeit. Laufende Abfragen werden je Pfad zusammengefasst; verspaetete Antworten stellen keine abgewaehlte Auswahl wieder her.
- Der Anlage-Payload wird aus der Store-Auswahl als verschachtelte Zugriffs-Map erzeugt; das bisherige `zugriffe`-FormArray wurde entfernt.
- Jeder ausgewaehlte Unternehmer benoetigt mindestens eine Firma, jede ausgewaehlte Firma mindestens eine Filiale. Laufende Abfragen und Ladefehler verhindern die Freigabe der Anlagedaten. Office-/Filialkonten benoetigen mindestens eine vollstaendige Zuordnung. Eine komplett leere Auswahl ist bei der Anlage nur fuer Master erlaubt; Formular und Backend pruefen diese Bedingung.
- Die Datenberechtigungshelfer gewaehren aktiven Mastern uneingeschraenkten Firmen-/Filial-Lesezugriff; fuer Office/Filiale pruefen sie Unternehmer, Firma und gegebenenfalls Filiale direkt in der verschachtelten Map. Alte Array-Zugriffe werden beim Laden auf `{}` normalisiert und gewaehren keine Datenrechte. Bestandspruefung am 19.09.2026 ueber die Firestore-API im Projekt `pur-system`, Datenbank `(default)`: Die Collection `benutzer` enthaelt genau ein Master-Profil mit `zugriffe: []`. Dieses Altprofil bleibt als Master funktionsfaehig; Firestore-Dokumente wurden nicht veraendert.

## Backend und Passwortaenderung

- Store und Service uebergeben den erweiterten Anlage-Payload an die Callable Function `createBenutzer`, sobald die weiterhin bestehende Submit-Sperre freigegeben wird.
- Die Function prueft Anmeldung, aktives Profil und `userRole: master` serverseitig und legt per Admin SDK Auth-Benutzer und `benutzer/{uid}` an. Die Sitzung des Masters bleibt erhalten.
- Das Backend verlangt fuer jeden Zugriff eine Unternehmer-ID und prueft vor der Auth-Anlage die Existenz von Unternehmer, Firma und Filialen unter ihren vollstaendigen Pfaden. Fehlende Dokumente, ungueltige IDs oder fehlgeschlagene Pruefabfragen brechen die Anlage ab. Doppelte Firmenzugriffe werden nur innerhalb desselben Unternehmers zusammengefuehrt.
- Das Anfangspasswort wird an Firebase Authentication uebermittelt und nicht in Firestore gespeichert.
- Auth-Konten werden mit `disabled: true` angelegt. Erst nach bestaetigtem Speichern des Profils wird das Konto aktiviert. Ein fehlgeschlagener Profil-Schreibvorgang fuehrt nie zur Aktivierung; das deaktivierte Konto wird nach Moeglichkeit geloescht.
- Bei einem Aktivierungsfehler (auch unklarem Timeout-Ergebnis) versucht das Backend unabhaengig voneinander Auth-Deaktivierung, Profil-Deaktivierung und Auth-Loeschung. Das Profil wird nicht geloescht: Bereits ausgestellte Tokens duerfen nicht auf die Legacy-Regel fuer Konten ohne Profil zurueckfallen. Scheitert eine Bereinigung, wird keine erfolgreiche Rueckabwicklung behauptet; UID und fehlgeschlagener Schritt werden serverseitig protokolliert.
- Manuelle Nachbearbeitung: UID aus dem Fehlerlog pruefen, eventuell vorhandenes Auth-Konto deaktivieren/entfernen und vorhandenes Profil auf `aktiv: false` setzen. Das Profil als Sperrdokument erhalten. Wenn mehrere externe Aufrufe scheitern, ist eine vollstaendige automatische Bereinigung nicht garantiert; die Fehlermeldung fordert die Administratorpruefung an.
- Angemeldete Benutzer koennen ihr Passwort nach erneuter Authentifizierung ueber die Toolbar und `/passwort` aendern. Auf dieser separaten Seite werden neues Passwort und Bestaetigung validiert; es gelten mindestens 8 Zeichen.
- Die Functions-Codebase `pur-office` nutzt Node.js 22 und die Region `europe-west1`.

## Rules und Deployment

- Functions-Deployment fuer die rollenabhaengige Validierung (Office mindestens eine, Filiale genau eine vollstaendige Zuordnung) wurde vom Benutzer bestaetigt. Die Anlage eines Benutzers ueber das Formular war anschliessend erfolgreich; Login und Berechtigungen sind noch separat zu pruefen.

- Die vereinfachte Function ohne Zugriffsindex ist deployed (Benutzerbestaetigung). Die sichere Kontoaktivierung bleibt erhalten.
- Lokal umgesetzt und im Emulator geprueft: Aktive Master lesen alle Collections und Untercollections inklusive aller Benutzerprofile, sowohl mit `zugriffe: {}` als auch mit der alten leeren Liste.
- Aktive Office-/Filialprofile lesen nur zugeordnete Unternehmer-/Firmendokumente sowie freigegebene Filialen und deren Untercollections. Eigenes Profil bleibt auch fuer inaktive Konten lesbar. Keine weiteren Client-Schreibrechte fuer profilierte Konten.
- Benutzeranlage speichert ausschliesslich die validierte Zugriffs-Map. Die Rules pruefen Unternehmer-ID, Firma-ID und Filial-ID direkt in dieser Struktur; ein separater `zugriffsIndex` ist nicht mehr erforderlich.
- Altanwendung nutzt laut Benutzer ausschliesslich Konten ohne `benutzer`-Dokument. Diese behalten den bisherigen Lese-/Schreibzugriff ausserhalb von `benutzer`; Emulator-Tests sichern das ab. Fehlgeschlagene Kontoanlage darf kein nutzbares Auth-Konto ohne Profil hinterlassen (lokal durch deaktivierte Anlage abgesichert).
- Office-/Filialqueries muessen erlaubte Dokument-IDs eingrenzen; unbeschraenkte Listen werden abgelehnt. Die aktuellen unbeschraenkten Auswahllisten sind fuer die Master-Verwaltung vorgesehen.
- Neue Rules sind laut Benutzer produktiv; Lesen und Schreiben in der Altanwendung funktionieren weiterhin. Die sichere Kontoaktivierung ist ebenfalls deployed; die Formularsperre wurde lokal entfernt. Frontend bereitstellen und Gesamtablauf pruefen.
- Der Git-Push der aktuellen Aenderungen ist kein Firebase-Deployment.

## Tests und Build

Am 19.09.2026 fuer die Firebase-Auswahl erfolgreich geprueft:

- 113 Frontend-Tests, darunter Ladeverhalten, Auswahluebergabe, vollstaendige Anlagedaten, Unternehmertrennung und Altprofile.
- 36 Functions-Tests, darunter fehlende Hierarchie-Dokumente, manipulierte IDs, doppelte Zuordnungen und Abbruch vor der Auth-Anlage.
- 21 Firestore-Emulator-Tests fuer Rollen, neue Hierarchie, Untercollections, eingeschraenkte Queries, Schreibschutz sowie die Trennung vom Legacy-Zugriff auf `purCustomers`.
- Functions-Build erneut erfolgreich; Frontend-Build nach Entfernen der Formularsperre erneut erfolgreich.

Die Tests belegen noch keinen durchgaengigen Ablauf mit realen Daten fuer die neue Auswahl. Die Firebase-Anbindung wird durch Service-, Store- und Seitenintegrationstests mit Testdaten geprueft; das Laden der Unternehmer wurde vom Benutzer bestaetigt. Firmen-/Filialauswahl und vollstaendige Kontoanlage sind noch manuell zu pruefen.

## Rollenpraezisierung: Umsetzung und offene Punkte

- Filialkonten werden genau einer Filiale zugeordnet. Einfachauswahl im UI sowie Seiten- und Backendvalidierung sind umgesetzt; mehrere Firmen oder Filialen werden fuer diese Rolle abgelehnt. Die neue serverseitige Begrenzung wurde laut Benutzer erfolgreich deployed.
- Office-Konten bleiben auf ausgewaehlte Firmen/Filialen beschraenkt; sie erhalten keinen globalen Lesezugriff. Ob eine Firmenfreigabe alle aktuellen und zukuenftigen Filialen umfasst, ist noch offen. Aktuell werden Filialen explizit gespeichert.
- Master benoetigen keine Datenzuordnung und besitzen bereits globalen Lesezugriff. Die Datenzuordnung ist im Formular fuer Master ausgeblendet; das Formular sendet fuer Master eine leere Zugriffs-Map.
- Daten in der eigenen Filiale erzeugen sowie bestimmte Office-Schreibaktionen (z. B. Mitarbeiteranlage) sind als Ziel festgehalten. Konkrete Datenarten und Aktionen sind noch zu klaeren. Die derzeitigen Rules erlauben profilierten Konten keine direkten Client-Schreibzugriffe; diese neuen Schreibrechte sind noch nicht umgesetzt.

## Naechste sinnvolle Schritte

Die konkrete Arbeitsplanung steht in [Offene Todos](./next_todo.md).
