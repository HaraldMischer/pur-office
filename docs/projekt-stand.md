<!-- pur-office/docs/projekt-stand.md -->

# Projekt-Stand: Pur-System

Stand: 25.09.2026. Dieses Dokument beschreibt den aktuellen Umsetzungsstand im Code. Das fachliche Zielbild steht separat im
[Projekt-Plan](./projekt-plan.md).

## Projektbasis

- Angular-Projekt `pur-office` wurde angelegt.
- Angular Standalone Components werden verwendet.
- SCSS ist als Styling-Format eingerichtet.
- Vitest ist als Testumgebung eingerichtet.
- Prettier ist als Projekt-Dependency installiert.
- GitHub-Repository `HaraldMischer/pur-system` wurde angelegt.
- Projektvorgaben wurden in `AGENTS.md` dokumentiert.

## App-Shell und Navigation

- Material-Sidenav-Layout ist in der App-Shell eingebaut.
- `app-sidenav` liegt unter `src/app/components/app-shell/app-sidenav`.
- `app-toolbar` liegt unter `src/app/components/app-shell/app-toolbar`.
- Die Sidebar enthält Links für Dashboard, Schichtplan, Mitarbeiter, Verwaltung und Systemverwaltung, sofern der jeweilige Bereich
  im Benutzerprofil freigegeben ist.
- Die Toolbar zeigt den Titel der aktiven Route und den Menübutton.
- Die Toolbar bietet einen Dark-/Light-Mode-Umschalter und im Entwicklungsmodus einen Button für die Snapshots der aktiven Stores.
- Die Toolbar zeigt während zentral registrierter Datenabfragen eine globale unbestimmte Progress-Bar.
- Die Loginseite verwendet eine reduzierte App-Shell ohne Sidebar und Navigationstaste und zeigt in der Toolbar die gemeinsame
  Produktkennung `Pur-System`.
- Das Layout reagiert auf kleinere Bildschirmbreiten.
- Die Sidebar enthält den Bereich Systemverwaltung für berechtigte Master-Benutzer.

## Seiten und Routen

- `dashboard-page` wurde unter `src/app/pages/dashboard-page` angelegt.
- `schichtplan-page` wurde unter `src/app/pages/schichtplan-page` angelegt.
- `mitarbeiter-page` wurde unter `src/app/pages/mitarbeiter-page` angelegt.
- Routen für `/dashboard`, `/schichtplan` und `/mitarbeiter` werden per `loadComponent` geladen.
- `/` leitet auf `/dashboard` weiter.
- Die Route `/systemverwaltung` und die `systemverwaltung-page` enthalten die Bereiche Datenstruktur anlegen, Benutzer anlegen und
  Benutzer verwalten.
- Die Route `/verwaltung` enthält die Auswahl zugeordneter Stammdaten und die Bearbeitung bestehender Firmen- und Filialdaten.
- Die geschützte Route `/passwort` ermöglicht angemeldeten Benutzern eine Passwortänderung.

## Firebase-Grundlage

- Firebase und AngularFire sind installiert.
- Firebase-Konfiguration liegt unter `src/environments`.
- Firebase App, Auth und Firestore werden in `app.config.ts` bereitgestellt.
- Firestore ist mit lokalem Cache vorbereitet.
- Firebase Tokens für Auth sowie lesende und schreibende Firestore-Zugriffe sind vorbereitet.
- Technische Firebase-Anbindungen liegen unter `src/app/services/firebase`; fachliche Services liegen getrennt unter
  `src/app/services/domain`.
- Der technische `FirestoreDbService` kapselt Collection-Lesen, Dokument-Lesen, Anlegen, Merge-Aktualisieren, Server-Zeitstempel
  und den Angular-Injection-Kontext.
- Firestore-Collection- und Dokumentpfade für Benutzerprofile, Unternehmer, Firmen und Filialen werden zentral in
  `firebase.constants.ts` erzeugt.
- `BenutzerService`, `UnternehmerService`, `FirmaService` und `FilialeService` verwenden keine direkten AngularFire-Aufrufe mehr,
  sondern greifen über den `FirestoreDbService` zu.
- Der app-weite `StammdatenStore` initialisiert nach dem Benutzerprofil einmalig die für die Sitzung erlaubten Unternehmer-,
  Firmen- und Filialdaten; Master laden zusätzlich alle Benutzerprofile.
- Verwaltung, Systemverwaltung und Datenzugriffsauswahl verwenden den gemeinsamen Sitzungsbestand. Er wird bei Neuanlagen direkt
  aktualisiert und bei Logout oder Benutzerwechsel zurückgesetzt.
- Offline-Ladestrategien, Pending-Sync, Migrationen und Batch-Schreibvorgänge aus der Altanwendung wurden bewusst noch nicht
  übernommen.
- Fachliche Daten werden derzeit in allen Auslieferungsvarianten ausschließlich online verwendet. Eine dauerhafte
  Offline-Speicherung fachlicher Daten, Offline-Änderungen und eine spätere Synchronisation sind nicht umgesetzt. Die
  Offline-App-Shell aller vier PWA-Builds bleibt davon getrennt.
- Es gibt keine öffentliche Selbstregistrierung.

## Login und Benutzerberechtigungen

- Die Loginseite verwendet ein Formular mit Anmeldename und Passwort ohne Rollenauswahl. Master-, Office-, Filial- und
  Mitarbeiter-Build ergänzen den eingegebenen Namensbestandteil automatisch um ihr jeweiliges Rollensuffix und für Firebase Auth
  intern um `@pur-system.invalid`. Die allgemeine Entwicklungsumgebung erwartet weiterhin den vollständigen Anmeldenamen.
- Der neue Loginablauf ist technisch umgesetzt und mit den neu angelegten Rollen- und Hostingvarianten erfolgreich geprüft. Die
  bisherigen Testkonten werden bewusst nicht migriert; ein neuer Master und alle weiteren Zugänge werden nach dem neuen Modell
  angelegt.
- Benutzerprofile werden aus `benutzerprofil/{uid}` geladen. Aktive Master dürfen die ausdrücklich bearbeitbaren Felder
  vorhandener Profile direkt aktualisieren.
- Die Anlage von Auth-Konto und Profil bleibt im Backend umgesetzt. E-Mail-Adresse, Passwort und Firebase-Auth-Status werden durch
  die clientseitige Profilbearbeitung nicht verändert.
- Benutzerprofile unterstützen `userRole` mit `filiale`, `office`, `master` oder `mitarbeiter`. Die vierte Rolle ist damit
  sprachlich vom fachlichen Mitarbeiterdatensatz abgegrenzt.
- Die zentralen Utilities für technische Anmeldedaten normalisieren Namen, bilden Anmeldenamen im Format
  `<normalisierter-name>-<rolle>` und ergänzen die gemeinsame Domain `@pur-system.invalid`. Das Profilmodell speichert den
  `anmeldename`; Benutzeranlage, Anmeldung, Benutzerverwaltung und Profilkarte verwenden den neuen Ablauf.
- Allgemeine Bereichsfreigaben richten sich nach `erlaubteBereiche`; Systemverwaltung erfordert zusätzlich `userRole: master`,
  Verwaltung zusätzlich `userRole: office` oder `userRole: master`.
- App-Routen sind mit `authGuard` geschützt.
- Bereichsrouten werden über `bereichGuard` und `data: { bereich: ... }` abgesichert.
- Sidebar-Navigation wird über `erlaubteBereiche` eingeschränkt.
- Der `verwaltungGuard` schließt Filialkonten auch dann von `/verwaltung` aus, wenn deren Profil den Bereichsschlüssel fälschlich
  enthält.
- Firmen-/Filial-Zugriffe werden im Benutzerprofil als verschachtelte Map `Unternehmer-ID -> Firma-ID -> Filial-IDs` abgebildet.
- Firebase-Fehler werden benutzerfreundlich angezeigt.

## Systemverwaltung und Zugangsdaten

- Der Bereich Systemverwaltung ist im Client durch `erlaubteBereiche` und `userRole: master` geschützt.
- Verweigert ein Bereichs- oder Rollenguard eine Route, wird bevorzugt zum erlaubten Dashboard und andernfalls zum ersten für die
  Rolle tatsächlich erreichbaren Bereich umgeleitet. Ist kein Bereich erreichbar, führt die Ausweichnavigation zum Login.
- Die `SystemverwaltungPage` ist ein Container für die eigenständigen Bereiche Datenstruktur-Anlage, Benutzeranlage und
  Benutzerverwaltung.
- Das Formular gliedert sich in Zugangsdaten, erlaubte Bereiche und Datenzugriff. Alle Gruppen verwenden `div`-Elemente mit
  sichtbaren Überschriften, ohne `role="group"`, `aria-label` oder `aria-labelledby`, statt `fieldset`/`legend`. Die
  `h2`-Überschriften werden zentral über `pur-form__group-titel` in `forms.scss` gestaltet. Zugangsdaten enthalten Anzeigename,
  Benutzerrolle, den automatisch gebildeten und nicht bearbeitbaren Anmeldenamen sowie das Passwort. Die technische
  Firebase-Adresse wird bei der Anlage nicht angezeigt.
- Der Master vergibt das Anfangspasswort ausschließlich selbst: ein Feld mit Ein-/Ausblendfunktion und dem Label „Passwort min. 8
  Zeichen“. Es gibt weder Passwortbestätigung bei der Anlage noch eine Variante zur erstmaligen Passwortvergabe durch den
  Benutzer.
- Pflichtfelder, ein technisch nutzbarer Anzeigename, Passwortlänge und mindestens ein erlaubter Bereich werden clientseitig
  validiert.
- `zugangsdaten` ist ein lokaler CSS-Container. Das bestehende `pur-form--grid` zeigt zwei Spalten, bei maximal 600 Pixel
  Containerbreite eine Spalte. `pur-form__row` verwendet standardmäßig Flex mit Umbruch; die Bereiche-Checkboxen umbrechen nach
  verfügbarem Platz. Der Aktionsbutton ist rechts ausgerichtet.
- Gültige Formulare mit gültiger Datenzugriffsauswahl können abgesendet werden; während der Anlage werden weitere Aufrufe
  verhindert. Nach Erfolg werden Formular, Auswahl und der Absendezustand der FormGroupDirective zurückgesetzt; leere
  Pflichtfelder zeigen dadurch keine Fehler. Erfolgs- und Fehlermeldungen werden beim Start einer neuen Aktion sowie beim
  Verlassen der Seite zurückgesetzt; bei Fehlern bleiben die Eingaben erhalten.
- Die Benutzerauswahl zeigt Anzeigename und Rollenbezeichnung. Im Bearbeitungsdialog bleiben Anmeldename und technische
  Firebase-Adresse einsehbar; die Profilkarte der App-Shell zeigt unter dem Anzeigenamen den Anmeldenamen.
- Die Rolle `mitarbeiter` kann in der Benutzeranlage mit der Anzeige „Mitarbeiter“ ausgewählt werden. Der Master weist ihre
  `erlaubteBereiche` über dieselben Checkboxen wie bei den bestehenden Rollen zu. Eine Datenzugriffsauswahl wird nicht angezeigt
  und das Profil erhält `zugriffe: {}`. Beim Rollenwechsel werden zuvor ausgewählte fachliche Datenzugriffe entfernt, die
  gewählten Bereiche bleiben erhalten.
- Vorhandene Profile von Mitarbeiterzugängen zeigen ihre Rolle in der Benutzerverwaltung korrekt an. Ihre Bereichsfreigaben können
  durch einen Master bearbeitet werden, ihre Datenzugriffe bleiben leer und ihr Aktivstatus kann weiterhin geändert werden.

## Mitarbeiterrolle und Mitarbeiter-App

- Die eigenständige vierte Auth-Rolle `mitarbeiter` ist im Benutzerprofil, in der Benutzeranlage, in der Profilbearbeitung, in der
  Callable Function und in den Firestore Rules umgesetzt.
- Ein aktiver Master kann einen Mitarbeiterzugang mit Anfangspasswort anlegen. Die bestehende sichere Kontoanlage aktiviert den
  Auth-Benutzer erst nach erfolgreichem Schreiben des Profils. Die Rolle wurde von `personal` zu `mitarbeiter` geändert und in
  Functions, Rules sowie allen Hosting-Builds deployed.
- Mitarbeiterzugänge erhalten die durch den Master ausgewählten `erlaubteBereiche` und weiterhin `zugriffe: {}`. Frontend, Backend
  und Firestore Rules verhindern fachliche Datenzuordnungen. Benutzer mit einem Mitarbeiterzugang können ihr eigenes Profil lesen,
  erhalten aber noch keine fachlichen Datenrechte.
- Anmeldung, Abmeldung und die vorhandene Passwortänderung werden wiederverwendet. Die Vergabe eines neuen vorläufigen Passworts
  durch einen Master ist noch nicht umgesetzt.
- Pur Mitarbeiter ist als installierbare, für Handys optimierte PWA mit eigener App-Shell und der Produktkennung „Pur Mitarbeiter“
  veröffentlicht. Installation und eigenständiger Start wurden auf Desktop und iPhone bestätigt.
- Die Hosting-Variante erzeugt keine zusätzliche Rollenbeschränkung. Navigation und Routenzugriff richten sich nach
  `erlaubteBereiche`; administrative Routen bleiben zusätzlich durch ihre vorhandenen Rollenguards geschützt.
- Ein Mitarbeiterzugang ist vom fachlichen Mitarbeiterdatensatz einer Firma getrennt. Ein Mitarbeiterdatensatz kann ohne
  Mitarbeiterzugang bestehen. Die spätere eindeutige Verknüpfung beider Datensätze, Filialzuordnungen, Dienstplandaten,
  persönliche Aktionen und Push-Benachrichtigungen sind ausdrücklich noch nicht festgelegt und werden bei konkretem fachlichem
  Bedarf separat geplant. `erlaubteBereiche` steuert nur verfügbare App-Funktionen und ersetzt diese fachliche Zuordnung nicht.

## Datenstruktur-Anlage

- Die Systemverwaltungsseite enthält einen linearen Angular-Material-Stepper für die hierarchische Anlage von Unternehmer, Firma
  und Filiale.
- Schritt 1 lädt alle Unternehmer aus `unternehmer`, erlaubt die Auswahl eines vorhandenen Eintrags und öffnet für die Neuanlage
  einen Material-Dialog.
- Der Unternehmerdialog erfasst einen Anzeigenamen sowie die eingebettete Person mit Vorname, Nachname, Adresse und optionalen
  Kontaktdaten. Die fortlaufende Unternehmernummer wird aus der vollständig geladenen Store-Liste mit `max(nummer) + 1` bestimmt.
- Neue Unternehmer werden durch einen aktiven Master direkt unter `unternehmer/{unternehmerId}` in Firestore gespeichert, in die
  sortierte Store-Liste übernommen und anschließend im Stepper ausgewählt.
- Schritt 2 lädt die Firmen des ausgewählten Unternehmers, erlaubt die Auswahl eines vorhandenen Eintrags und öffnet für die
  Neuanlage einen Material-Dialog.
- Der Firmendialog erfasst getrennt den kurzen `anzeigename` für Auswahlen und den vollständigen `firmenname` sowie die Adresse
  und optionale Kontaktdaten. Die fortlaufende Firmennummer wird innerhalb des Unternehmers aus der vollständig geladenen
  Store-Liste mit `max(nummer) + 1` bestimmt.
- Neue Firmen werden direkt unter `unternehmer/{unternehmerId}/firma/{firmaId}` gespeichert, in die sortierte Firmenliste
  übernommen und anschließend im Stepper ausgewählt. Ein Unternehmerwechsel setzt Firma und Filiale zurück und lädt den passenden
  Firmenbestand.
- Schritt 3 lädt die Filialen der ausgewählten Firma und öffnet für die Neuanlage einen Material-Dialog. Eine Auswahl bereits
  vorhandener Filialen ist in diesem reinen Anlageschritt bewusst nicht vorgesehen.
- Der Filialdialog erfasst getrennt den kurzen `anzeigename` für Auswahlen und den vollständigen `filialname` sowie die Adresse
  und optionale Kontaktdaten. Die fortlaufende Filialnummer wird innerhalb der Firma aus der vollständig geladenen Store-Liste mit
  `max(nummer) + 1` bestimmt.
- Neue Filialen werden direkt unter `unternehmer/{unternehmerId}/firma/{firmaId}/filiale/{filialeId}` gespeichert, in die
  sortierte Filialliste übernommen und in der Hierarchie-Zusammenfassung angezeigt. Ein Unternehmer- oder Firmenwechsel setzt die
  abhängige Filiale zurück und lädt den passenden Filialbestand.
- Pflichtfelder und vollständig geladene Listen steuern die Zurück-/Weiter-Navigation sowie die Freigabe der jeweiligen
  Anlagedialoge.
- Bis 720 Pixel wechselt der Stepper in die vertikale Ausrichtung.
- Unternehmer, Firma und Filiale werden schrittweise direkt gespeichert; ein zusätzlicher abschließender Sammel-Speicherbutton ist
  deshalb nicht erforderlich.
- Der vollständige Anlageablauf wurde vom Benutzer am 22.09.2026 gegen echtes Firestore bestätigt: Unternehmer, Firma und Filiale
  wurden unter dem vorgesehenen verschachtelten Pfad gespeichert, im UI korrekt zusammengefasst und nach einem Anwendungsneustart
  erneut geladen.

## Bestehende Benutzer verwalten

- Unter `systemverwaltung-page/benutzer-verwaltung` ist die Bearbeitung vorhandener Benutzerprofile umgesetzt.
- Das Benutzer-Select verwendet die UID als Wert und zeigt Anzeigename sowie Rollenbezeichnung. Der Bearbeiten-Button wird erst
  nach einer gültigen Auswahl aktiviert.
- Es werden keine produktiven Mockprofile verwendet. Die für Master zentral geladenen Benutzerprofile werden direkt aus dem
  Sitzungsbestand verwendet; Leer-, Lade- und Fehlerzustände bleiben unterscheidbar.
- `IBenutzerProfilEintrag` bildet ein geladenes Profil mit seiner Dokument-ID als `uid` ab. `IBenutzerProfilAktualisierung`
  begrenzt die vorbereiteten Änderungen auf Anzeigename, Aktivstatus, erlaubte Bereiche und Datenzugriffe; Benutzerrolle,
  E-Mail-Adresse und Passwort sind ausgeschlossen.
- Der Bearbeitungsdialog verwendet die vorhandene Datenzugriffsauswahl mit rollenabhängiger Validierung. Erfolgreiche
  Aktualisierungen setzen `aktualisiertAm` serverseitig und werden ohne erneutes Laden in den Stammdaten- und Verwaltungsbestand
  übernommen.
- Die Bereichsfreigabe `systemverwaltung` ist weder bei der Anlage noch im Bearbeitungsdialog frei wählbar: Bei Auswahl der
  Masterrolle wird sie automatisch aktiviert und gegen Abwahl gesperrt; bei Office, Filiale und Mitarbeiter bleibt sie
  deaktiviert. Die Callable Function verändert das übergebene Array `erlaubteBereiche` nicht. Die vorhandenen Rollen-Guards
  bleiben die funktionale Zugriffssicherung.
- Das eigene Masterprofil kann nicht deaktiviert werden. Die Benutzerrolle ist für sämtliche Profile unveränderlich. Dieser
  Selbstschutz sowie die weiteren unveränderlichen Profilfelder sind zusätzlich durch Firestore Rules abgesichert.
- Änderungen am aktuell angemeldeten Masterprofil werden unmittelbar in den lokalen Benutzer-Store übernommen. Andere bereits
  angemeldete Benutzer erhalten geänderte UI-Freigaben spätestens nach einem Neuladen; die Firestore Rules werten den geänderten
  Profilstand sofort aus.

## Firmen- und Filialverwaltung

- Unter `/verwaltung` ist eine eigenständige Seite für die Bearbeitung von Firmen- und Filialstammdaten angelegt. Die Route
  erfordert den Bereich `verwaltung` und zusätzlich die Rolle Office oder Master; Filialkonten werden unabhängig vom
  Bereichsschlüssel ausgeschlossen.
- Master wählen Unternehmer, Firma und Filiale über abhängige Material-Selects. Für Office wird der einzige zugeordnete
  Unternehmer automatisch gewählt und nicht als eigene Auswahl angezeigt; anschließend stehen die erlaubten Firmen und Filialen
  zur Auswahl. Ein Unternehmerwechsel setzt Firma und Filiale zurück; ein Firmenwechsel setzt die Filiale zurück.
- Der seitenbezogene `VerwaltungStore` verwaltet die Listen, Auswahlen sowie getrennte Lade-, Leer- und Fehlerzustände und ist an
  die Store-Snapshot-Ausgabe angebunden.
- Office-Konten laden bei der Sitzungsinitialisierung ausschließlich die im Benutzerprofil unter `zugriffe` enthaltenen
  Unternehmer-, Firmen- und Filialdokumente über ihre vollständigen Dokumentpfade. Es werden für Office keine unbeschränkten
  Collection-Abfragen ausgeführt.
- Masterkonten besitzen keine erforderliche Zugriffszuordnung und laden bei der Sitzungsinitialisierung die vollständige
  Hierarchie sowie alle Benutzerprofile.
- Die Auswahl verwendet anschließend den zentralen Sitzungsbestand. Ausgewählte Firmen und Filialen können über getrennte
  Material-Dialoge bearbeitet werden; sie umfassen Anzeigename, Firmen- beziehungsweise Filialname, vollständige Adresse und
  optionale Kontaktdaten.
- Dokument-ID, Nummer, Aktivstatus und Hierarchiepfad bleiben unverändert. `FirmaService` und `FilialeService` speichern
  ausschließlich die bearbeitbaren Felder und setzen `aktualisiertAm` mit einem Server-Zeitstempel.
- Nach erfolgreichem Speichern werden Verwaltungs- und Stammdatenbestand unmittelbar aktualisiert. Eine weitere Firestore-Abfrage
  ist nicht erforderlich.

## Globaler Ladeindikator

- Der globale `LoadingService` zählt parallele Ladevorgänge und blendet den Ladeindikator erst nach Abschluss des letzten
  registrierten Vorgangs aus.
- Die App-Toolbar zeigt während aktiver Ladevorgänge eine schmale unbestimmte Material-Progress-Bar an ihrem unteren Rand.
- Die aktuellen Firestore-Lesevorgänge für Benutzerprofile, Unternehmer, Firmen und Filialen werden im `FirestoreDbService`
  zentral an die Ladeanzeige angebunden. Damit werden auch die davon abhängigen Datenzugriffslisten und Verwaltungslisten erfasst.
- Seiten zeigen keine zusätzlichen allgemeinen Ladetexte mehr. Fachliche Fehler- und Leerzustände bleiben direkt im jeweiligen
  Seitenbereich sichtbar.

## Datenzugriff-Auswahl mit Firebase

- Die wiederverwendbare Component liegt unter `src/app/components/datenzugriff-auswahl`; ihre Auswahlmodelle liegen in
  `src/app/commons/models/domain/datenzugriff.ts`.
- Die Systemverwaltungsseite lädt Unternehmer aus `unternehmer`, Firmen aus `firma` und Filialen aus `filiale`. Die produktiven
  Mock-Daten wurden entfernt. `UnternehmerService`, `FirmaService` und `FilialeService` kapseln Laden und Anlegen ihrer
  vollständigen Domäneneinträge. Das gemeinsame Datenzugriff-Auswahlmodell und die Firestore-Dokumente verwenden auf allen Ebenen
  einheitlich `anzeigename`; `DatenzugriffService` bildet alle drei Domäneneinträge auf kompakte Auswahleinträge ab. Fehlende
  Anzeigenamen werden durch die Dokument-ID ersetzt.
- Die Gruppe Datenzugriff verwendet einen `div` mit sichtbarer Überschrift statt eines `fieldset`: In der Browser-Nachstellung
  kollabierte ein darin verschachtelter Größencontainer beim Einblenden von Meldungen. Die Container-Abfrage der
  wiederverwendbaren Component bleibt erhalten; die Korrektur wurde ein- und dreispaltig geprüft.
- Drei Material-Selects bilden Unternehmer -> Firmen -> Filialen ab. Ohne passende übergeordnete Auswahl beziehungsweise
  verfügbare Optionen sind nachgelagerte Selects deaktiviert.
- Die Inputs `unternehmerMehrfach`, `firmenMehrfach` und `filialenMehrfach` sind standardmäßig alle `false`. Die
  Systemverwaltungsseite erzeugt je Rolle eigene Komponenteninstanzen mit festen Modi: Filiale `false`, `false`, `false`; Office
  `false`, `true`, `true`; Master ohne Auswahlkomponente. Rollenwechsel setzt die Zuordnungen zurück, ohne den Auswahlmodus einer
  bestehenden Instanz zu ändern.
- Firmen erhalten nur dann Unternehmergruppen, wenn `unternehmerMehrfach` aktiv ist und mehr als ein Unternehmer ausgewählt wurde.
  Filialen erhalten nur dann Firmengruppen, wenn `firmenMehrfach` aktiv ist und mehr als eine Firma ausgewählt wurde.
- Bei mehreren ausgewählten Einträgen erscheint die Anzahl direkt im jeweiligen Select. Hints und die separate Auswahlstatus-Zeile
  wurden entfernt.
- Interne zusammengesetzte Auswahlschlüssel erhalten die Unternehmer-/Firmenzuordnung auch bei gleichen untergeordneten IDs. Diese
  Schlüssel sind kein gespeichertes Berechtigungsmodell.
- Abgewählte Unternehmer oder Firmen verlieren ihre abhängige Auswahl; andere Auswahlen bleiben bestehen. Die Auswahlmodi werden
  beim Einbinden festgelegt und während der Lebensdauer der Component nicht umgeschaltet; je Ebene gibt es ein Select mit
  gebundenem `multiple`.
- Die Component erhält Daten und Auswahl vom `BenutzerVerwaltungStore` über die Systemverwaltungsseite. Model-Inputs melden
  Auswahlereignisse zurück. Der Store lädt abhängige Listen, speichert sie nach vollständigem Pfad zwischen und bereinigt
  abhängige Auswahlen.
- Listen haben eigene Lade-, Leer- und Fehlerzustände mit Wiederholungsmöglichkeit. Laufende Abfragen werden je Pfad
  zusammengefasst; verspätete Antworten stellen keine abgewählte Auswahl wieder her.
- Der Anlage-Payload wird aus der Store-Auswahl als verschachtelte Zugriffs-Map erzeugt; das bisherige `zugriffe`-FormArray wurde
  entfernt.
- Jeder ausgewählte Unternehmer benötigt mindestens eine Firma, jede ausgewählte Firma mindestens eine Filiale. Laufende Abfragen
  und Ladefehler verhindern die Freigabe der Anlagedaten. Office-/Filialkonten benötigen mindestens eine vollständige Zuordnung.
  Eine komplett leere Auswahl ist bei der Anlage nur für Master erlaubt; Formular und Backend prüfen diese Bedingung.
- Die Datenberechtigungshelfer gewähren aktiven Mastern uneingeschränkten Firmen-/Filial-Lesezugriff; für Office/Filiale prüfen
  sie Unternehmer, Firma und gegebenenfalls Filiale direkt in der verschachtelten Map. Alte Array-Zugriffe werden beim Laden auf
  `{}` normalisiert und gewähren keine Datenrechte. Das aktuelle Masterprofil liegt unter `benutzerprofil/{uid}` und verwendet die
  vereinfachte Zugriffsstruktur.

## Backend und Passwortänderung

- Store und Service übergeben den erweiterten Anlage-Payload an die Callable Function `createBenutzer`. Eine gültige
  Benutzeranlage kann direkt über das Formular gestartet werden; während eines laufenden Aufrufs werden weitere Aufrufe
  verhindert.
- Der `BenutzerVerwaltungService` erzeugt und startet die Callable Function innerhalb von `runInInjectionContext`, damit
  AngularFire-Aufrufe korrekt im Angular-Injection-Kontext ausgeführt werden.
- Die Function prüft Anmeldung, aktives Profil und `userRole: master` serverseitig und legt per Admin SDK Auth-Benutzer und
  `benutzerprofil/{uid}` an. Die Sitzung des Masters bleibt erhalten.
- Das Backend verlangt für jeden Zugriff eine Unternehmer-ID und prüft vor der Auth-Anlage die Existenz von Unternehmer, Firma und
  Filialen unter ihren vollständigen Pfaden. Fehlende Dokumente, ungültige IDs oder fehlgeschlagene Prüfabfragen brechen die
  Anlage ab. Doppelte Firmenzugriffe werden nur innerhalb desselben Unternehmers zusammengeführt.
- Das Anfangspasswort wird an Firebase Authentication übermittelt und nicht in Firestore gespeichert.
- Auth-Konten werden mit `disabled: true` angelegt. Erst nach bestätigtem Speichern des Profils wird das Konto aktiviert. Ein
  fehlgeschlagener Profil-Schreibvorgang führt nie zur Aktivierung; das deaktivierte Konto wird nach Möglichkeit gelöscht.
- Bei einem Aktivierungsfehler (auch unklarem Timeout-Ergebnis) versucht das Backend unabhängig voneinander Auth-Deaktivierung,
  Profil-Deaktivierung und Auth-Löschung. Das Profil wird nicht gelöscht: Bereits ausgestellte Tokens dürfen nicht auf die
  Legacy-Regel für Konten ohne Profil zurückfallen. Scheitert eine Bereinigung, wird keine erfolgreiche Rückabwicklung behauptet;
  UID und fehlgeschlagener Schritt werden serverseitig protokolliert.
- Manuelle Nachbearbeitung: UID aus dem Fehlerlog prüfen, eventuell vorhandenes Auth-Konto deaktivieren/entfernen und vorhandenes
  Profil auf `aktiv: false` setzen. Das Profil als Sperrdokument erhalten. Wenn mehrere externe Aufrufe scheitern, ist eine
  vollständige automatische Bereinigung nicht garantiert; die Fehlermeldung fordert die Administratorprüfung an.
- Angemeldete Benutzer können ihr Passwort nach erneuter Authentifizierung über die Toolbar und `/passwort` ändern. Auf dieser
  separaten Seite werden neues Passwort und Bestätigung validiert; es gelten mindestens 8 Zeichen.
- Die Functions-Codebase `pur-office` nutzt Node.js 22 und die Region `europe-west1`.

## Rules und Deployment

- Das Firebase-Projekt `pur-system` verwendet getrennte Hosting-Sites für Master, Office, Filiale und Mitarbeiter. Die vier
  Produktionsbuilds sind als installierbare PWAs mit Angular Service Worker konfiguriert.
- Die Firebase-Hosting-Site `pur-master.web.app` wurde am 25.09.2026 angelegt. Hosting-Target, eigener Master-Build, Manifest und
  Deployment-Skript sind eingerichtet; die Site wurde am 26.09.2026 erstmals erfolgreich veröffentlicht.
- Die zusätzliche Firebase-Hosting-Site `pur-mitarbeiter.web.app` wurde am 25.09.2026 für die persönliche Mitarbeiter-PWA
  reserviert und erstmals erfolgreich veröffentlicht. Hosting-Target, eigener Build und Deployment-Skript sind eingerichtet.
- Die Hosting-Targets `master`, `office`, `filiale` und `mitarbeiter` verwenden getrennte Build-Verzeichnisse. Eigene
  Deploy-Skripte bauen vor dem Deployment jeweils die passende Variante und verlangen eine Bestätigung.
- Master, Office, Filiale und Mitarbeiter wurden am 26.09.2026 mit ihren getrennten PWA-Builds erfolgreich auf die jeweils
  zugehörige Firebase-Hosting-Site veröffentlicht.
- Master-, Office-, Filial- und Mitarbeiter-Build verwenden jeweils eine eigene Produktkennung im Web-App-Manifest. Die
  vorhandenen PWA- und Maskable-Icons werden gemeinsam genutzt.
- Die neue Angular-Konfiguration `mitarbeiter` ergänzt den Produktionsbuild zur Kombination `production,mitarbeiter`. Sie erzeugt
  `dist/pur-mitarbeiter/browser` mit aktiviertem Angular Service Worker, eigenem Produktions-Environment und dem Manifest „Pur
  Mitarbeiter“. `npm run pwa:pur-mitarbeiter` stellt den Build lokal auf Port `8083` bereit.
- Das Hosting-Target `mitarbeiter` ist mit der Firebase-Site `pur-mitarbeiter` verbunden. Der Hosting-Block verwendet
  ausschließlich `dist/pur-mitarbeiter/browser`, eigene PWA-Cache-Header und das SPA-Rewrite. `build:mitarbeiter`,
  `pwa:pur-mitarbeiter` und `deploy:pur-mitarbeiter` sind eingerichtet; das Deploy-Skript nennt Projekt, Zieladresse und Service
  Worker vor der erforderlichen Bestätigung. Lokale Vorschau, Bestätigungsabbruch und echtes Deployment wurden erfolgreich
  geprüft.
- HTML und direkte SPA-Routen werden ohne Browser-Cache ausgeliefert. Manifest und Service-Worker-Steuerdateien bleiben ebenfalls
  kurzfristig aktualisierbar. Gehashte JavaScript- und CSS-Ressourcen erhalten einen langfristigen unveränderlichen Cache. Die
  produktiven Header wurden nach dem Mitarbeiter-Deployment für `/`, `/login`, Manifest, `ngsw.json`, `ngsw-worker.js` und eine
  gehashte Hauptdatei geprüft.
- Eine Übersicht der tatsächlich eingerichteten lokalen und produktiven Varianten steht in den
  [PWA-Konfigurationen](./pwa-konfigurationen.md). Die vorgesehene Verwendung und das fachliche Online-/Offline-Verhalten stehen
  in den [PWA-Betriebsarten](./pwa-betriebsarten.md).
- Bei einer fehlerhaften PWA-Version wird ausschließlich die betroffene Hosting-Site in der Firebase Console auf die letzte
  funktionierende Veröffentlichung zurückgesetzt. Hilft dieses Rollback wegen eines fehlerhaften Service Workers nicht, wird als
  letzte Notfallmaßnahme für die betroffene Site der von Angular erzeugte `safety-worker.js` unter der bisherigen URL
  `ngsw-worker.js` ausgeliefert, bis die betroffenen Installationen den Service Worker deregistriert und ihre Angular-Caches
  entfernt haben. Anschließend werden Start, Updateverhalten und Service-Worker-Status der betroffenen PWA geprüft.

- Functions-Deployment für die rollenabhängige Validierung (Office mindestens eine, Filiale genau eine vollständige Zuordnung)
  wurde vom Benutzer bestätigt. Benutzeranlage, Anmeldung, Bereichsfreigabe, Systemverwaltungssperre, Passwortwechsel und erneute
  Anmeldung wurden anschließend bestätigt. Am 22.09.2026 wurden zusätzlich reale Office- und Filialkonten mit der neuen
  Unternehmer-/Firma-/Filiale-Hierarchie angelegt, ihre gespeicherten Profile geprüft und Anmeldung, erlaubte Bereiche sowie die
  Umleitung von `/systemverwaltung` erfolgreich bestätigt.

- Die vereinfachte Function ohne Zugriffsindex ist deployed (Benutzerbestätigung). Die sichere Kontoaktivierung bleibt erhalten.
- Lokal umgesetzt, im Emulator geprüft und laut Benutzer deployed: Aktive Master lesen und schreiben alle Collections und
  Untercollections inklusive aller Benutzerprofile, sowohl mit `zugriffe: {}` als auch mit der alten leeren Liste.
- Aktive Office-/Filialprofile lesen nur zugeordnete Unternehmer-/Firmendokumente sowie freigegebene Filialen und deren
  Untercollections. Das eigene Profil bleibt auch für inaktive Konten lesbar. Aktive Office-Konten dürfen zugeordnete Firmen- und
  Filialdokumente vollständig aktualisieren, aber weder anlegen noch löschen und keine Filial-Untercollections beschreiben.
  Filialkonten bleiben vorerst rein lesend. Die aktualisierten Rules mit diesen Office-Schreibrechten wurden am 22.09.2026
  erfolgreich in `pur-system` deployed.
- Benutzeranlage speichert ausschließlich die validierte Zugriffs-Map. Die Rules prüfen Unternehmer-ID, Firma-ID und Filial-ID
  direkt in dieser Struktur; ein separater `zugriffsIndex` ist nicht mehr erforderlich.
- Altanwendung nutzt laut Benutzer ausschließlich Konten ohne `benutzerprofil`-Dokument. Diese behalten den bisherigen
  Lese-/Schreibzugriff außerhalb von `benutzerprofil` und `unternehmer`; Emulator-Tests sichern das ab. Fehlgeschlagene
  Kontoanlage darf kein nutzbares Auth-Konto ohne Profil hinterlassen (lokal durch deaktivierte Anlage abgesichert).
- Office-/Filialqueries müssen erlaubte Dokument-IDs eingrenzen; unbeschränkte Listen werden abgelehnt. Die aktuellen
  unbeschränkten Auswahllisten sind für die Master-Verwaltung vorgesehen.
- Neue Rules sind laut Benutzer produktiv; Lesen und Schreiben in der Altanwendung funktionieren weiterhin. Die sichere
  Kontoaktivierung ist ebenfalls deployed und die Formularsperre wurde entfernt. Ein reales Office-Testkonto konnte seine
  zugeordnete Firma und Filiale über die fachliche Verwaltungsoberfläche erfolgreich aktualisieren. Nicht zugeordnete Dokumente,
  Neuanlagen, Löschungen und Schreibzugriffe auf Filial-Untercollections werden durch Emulator-Tests abgelehnt.
- Die Rules für eingeschränkte Profilaktualisierungen und den Selbstschutz des eigenen Masterprofils wurden am 23.09.2026
  erfolgreich deployed. Die Profilbearbeitung und die bestehenden Office-Zugriffe wurden anschließend mit realen Testkonten
  erfolgreich geprüft.
- Die Rolle `mitarbeiter`, ihre freie Bereichszuweisung und ihre Begrenzung auf `zugriffe: {}` sind in Function und Rules
  deployed. Das vorhandene Testprofil wurde kontrolliert von `personal` zu `mitarbeiter` migriert und anschließend erfolgreich
  geprüft.
- Der Git-Push der aktuellen Änderungen ist kein Firebase-Deployment.

## Tests und Build

Am 25.09.2026 für den aktuellen Frontend-Stand erfolgreich geprüft:

- 296 Frontend-Tests einschließlich vereinfachter Anmeldung, Benutzeranlage und -darstellung, der Rolle `mitarbeiter`,
  Bereichsfreigaben und sicherer Guard-Ausweichnavigation, PWA-Updatebehandlung, Netzwerkstatus, Store-Snapshots,
  Datenstruktur-Anlage, zentraler Stammdateninitialisierung sowie Firmen-, Filial- und Benutzerprofil-Bearbeitung.
- 47 Functions-Tests einschließlich technischer Anmeldedaten, doppelter Anmeldenamen, Mitarbeiterzugangsanlage, Rollenprüfung,
  Hierarchievalidierung und sicherer Kontoaktivierung.
- 28 Firestore-Emulator-Tests für die Begrenzung der Rolle `mitarbeiter`, bestehende Rollen, neue Hierarchie, Untercollections,
  eingeschränkte Queries, Office-Aktualisierungen, Profil-Selbstschutz, unveränderliche Profilfelder sowie die Trennung vom
  Legacy-Zugriff auf `purCustomers`.
- Master-, Office-, Filial- und Mitarbeiter-Produktionsbuild sind als vollständige PWA-Ausgaben konfiguriert. Sie enthalten das
  jeweils passende Manifest, zehn erreichbare App-Icons, lokale Roboto- und Material-Icon-Schriften, `ngsw.json`,
  `ngsw-worker.js` und die Ressourcengruppen `app`, `fonts` und `assets`. Die Builds benötigen in der Codex-Umgebung Zugriff
  außerhalb der Sandbox, weil der native `esbuild`-Prozess innerhalb der eingeschränkten Umgebung mit Exit-Code 134 beendet wird.
  Die bekannte Budgetwarnung beträgt rund 26 kB über dem initialen Limit von 1,50 MB.
- Die Mitarbeiter-App-Shell wurde lokal nach vollständigem Beenden des Webservers in Desktop- und mobiler Viewport-Größe
  erfolgreich aus dem Service-Worker-Cache neu geladen. Die veröffentlichte Login-Seite wurde ohne Browserfehler geladen. Pur
  Mitarbeiter wurde anschließend erfolgreich auf dem Desktop und auf einem physischen iPhone installiert und jeweils als
  eigenständige App geöffnet.

Der durchgängige Benutzeranlageablauf mit realen Daten wurde am 22.09.2026 für je ein Office- und Filialkonto bestätigt. Die
vollständige Hierarchie wurde gespeichert, beide Konten konnten sich anmelden und nur ihre erlaubten Bereiche verwenden; die
Systemverwaltungsroute blieb durch die Masterprüfung gesperrt. Am 23.09.2026 wurden zusätzlich die erfolgreiche Aktualisierung
einer zugeordneten Firma und Filiale mit einem realen Office-Testkonto sowie die Bearbeitung eines vorhandenen Benutzerprofils mit
einem realen Testkonto bestätigt. Am 25.09.2026 wurde ein realer Mitarbeiterzugang zunächst mit dem zwischenzeitlichen
`userRole: personal`, den Bereichen Dashboard und Schichtplan sowie leerer Zugriffs-Map angelegt. Anmeldung, Bereichsnavigation,
Deaktivierung und der Schutz vor unzulässigen Rollenänderungen wurden laut Benutzer erfolgreich geprüft. Anschließend wurde das
Profil zu `userRole: mitarbeiter` migriert, Functions, Rules und alle Hosting-Varianten wurden neu deployed und die Anmeldung
sowie Bereichsnavigation erneut erfolgreich geprüft.

Ebenfalls am 25.09.2026 wurden ein neuer Master und die weiteren Rollenkonten nach dem neuen Anmeldemodell angelegt.
Benutzeranlage, Anmeldung, Passwortänderung, Rollen- und Bereichsgrenzen sowie die vorgesehenen Office-, Filial- und
Mitarbeiter-Auslieferungsvarianten wurden laut Benutzer erfolgreich geprüft. Die bisherigen Testkonten werden nicht migriert. Die
übrigen Schreibgrenzen sind durch die erfolgreichen Firestore-Emulator-Tests abgesichert.

## Rollenpräzisierung: Umsetzung und offene Punkte

- Filialkonten werden genau einer Filiale zugeordnet. Einfachauswahl im UI sowie Seiten- und Backendvalidierung sind umgesetzt;
  mehrere Firmen oder Filialen werden für diese Rolle abgelehnt. Die neue serverseitige Begrenzung wurde laut Benutzer erfolgreich
  deployed.
- Office-Konten bleiben auf ausgewählte Firmen und ausdrücklich zugeordnete Filialen beschränkt; sie erhalten keinen globalen
  Lesezugriff. Eine Firmenfreigabe umfasst weder automatisch alle aktuellen noch zukünftige Filialen.
- Master benötigen keine Datenzuordnung und besitzen globalen Lese- und Schreibzugriff. Die Datenzuordnung ist im Formular für
  Master ausgeblendet; das Formular sendet für Master eine leere Zugriffs-Map.
- Office-Konten dürfen zugeordnete Firmen- und Filialdokumente aktualisieren, jedoch nicht anlegen oder löschen. Schreibrechte für
  Filial-Untercollections sowie eigene Schreibrechte von Filialkonten werden erst zusammen mit den jeweiligen fachlichen
  Funktionen festgelegt und umgesetzt.

## Nächste sinnvolle Schritte

Die konkrete Arbeitsplanung steht in den [offenen Todos](./todo_next.md). Bereits abgeschlossene Aufgaben sind in den
[erledigten Todos](./todo_done.md) dokumentiert. Bewusst zurückgestellte Aufgaben stehen in den
[späteren Todos](./todo_spaeter.md).
