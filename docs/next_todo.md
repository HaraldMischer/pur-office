<!-- pur-office/docs/next_todo.md -->

# Offene Todos

## 6. Todo: PWA und Offline-Fähigkeit

### 6.1 PWA-Grundlage und technischer Offline-Start

#### Ziel

Pur Office wird als Progressive Web App installierbar und kann auf unterstützten
Desktop- und Mobilgeräten wie eine eigenständige Anwendung gestartet werden. Die
App-Shell und die für den Start erforderlichen statischen Ressourcen stehen nach
dem ersten erfolgreichen Laden auch ohne Netzwerkverbindung zur Verfügung.

Neue Anwendungsversionen werden kontrolliert erkannt und übernommen. Die
Oberfläche informiert verständlich über den Netzwerkzustand, verfügbare Updates
und Funktionen, die aktuell eine Verbindung benötigen. Ohne Service-Worker- oder
Installationsunterstützung bleibt Pur Office weiterhin als normale Webanwendung
nutzbar.

### 6.2 Fachliche Offline-Nutzung und Synchronisation

#### Ziel

Für fachliche Firestore-Daten wird eine abgestufte Offline- und
Synchronisationsstrategie festgelegt. Die installierbare PWA führt nicht
automatisch zu einer dauerhaften lokalen Datenspeicherung oder zu ungeprüften
fachlichen Offline-Schreibzugriffen.

Bereits erfolgreich geladene und für den angemeldeten Benutzer freigegebene
Firestore-Daten können nach einer bewussten Sicherheitsentscheidung dauerhaft
lokal gespeichert und bei einem späteren Anwendungsstart ohne Netzwerkverbindung
lesend verwendet werden. Noch nicht lokal vorhandene Daten bleiben offline als
nicht verfügbar erkennbar. Benutzerwechsel, Abmeldung und gemeinsam genutzte
Geräte dürfen nicht dazu führen, dass ein Benutzer auf zwischengespeicherte Daten
eines anderen Benutzerkontos zugreifen kann.

Aufbauend auf dem lesenden Offline-Betrieb kann für ausdrücklich ausgewählte
fachliche Funktionen eine Offline-Bearbeitung ergänzt werden. Lokal vorgenommene
Änderungen werden eindeutig als noch nicht synchronisiert angezeigt und nach
Wiederherstellung der Verbindung kontrolliert an Firestore übertragen. Die
Anwendung macht erfolgreiche Synchronisationen, dauerhaft abgewiesene
Schreibvorgänge und erforderliche Benutzerentscheidungen nachvollziehbar.

Für Offline-Schreibvorgänge werden fachliche Konfliktregeln festgelegt. Dabei
werden parallele Änderungen, zwischenzeitlich entzogene Berechtigungen,
deaktivierte Benutzerkonten und nicht mehr vorhandene Zieldokumente berücksichtigt.
Die Offline-Bearbeitung wird nur für Datenarten freigegeben, deren Schutzbedarf,
Synchronisationsverhalten und Konfliktauflösung vollständig geklärt und getestet
sind.

# Erledigte Todos

Die folgenden Abschnitte dokumentieren den Abschluss des jeweiligen damaligen Arbeitsschritts. Für den aktuellen Stand gilt der [Projekt-Stand](./projekt-stand.md).

## 4. Done Todo: Systemverwaltung

> **Status am 23.09.2026:**
> Die Systemverwaltungsseite enthält die Bereiche Datenstruktur anlegen, Benutzer
> anlegen und Benutzer verwalten. Die Datenstruktur-Anlage, Benutzeranlage und
> Bearbeitung bestehender Benutzerprofile sind abgeschlossen, deployed und mit
> realen Daten geprüft.

### 4.1 Datenstruktur anlegen

#### Ziel

Ein Master kann die Hierarchie Unternehmer, Firma und Filiale in einem
dreistufigen Material-Stepper auswählen beziehungsweise neu anlegen. Neu
angelegte Einträge werden direkt in Firestore gespeichert, in den jeweiligen
Store übernommen und für den nächsten Schritt ausgewählt.

#### Betroffene Dateien

- src/app/commons/models/domain/adresse.ts
- src/app/commons/models/domain/kontakt.ts
- src/app/commons/models/domain/unternehmer.ts
- src/app/commons/models/domain/firma.ts
- src/app/commons/models/domain/filiale.ts
- src/app/services/domain/unternehmer.service.ts
- src/app/services/domain/firma.service.ts
- src/app/services/domain/filiale.service.ts
- src/app/stores/domain/unternehmer.store.ts
- src/app/stores/domain/firma.store.ts
- src/app/stores/domain/filiale.store.ts
- src/app/pages/systemverwaltung-page/datenstruktur-anlage/
- firestore.rules
- rules-tests/
- docs/projekt-stand.md

#### Schritt 1: Stepper und UI-Grundlage

- [x] Dreistufigen Material-Stepper für Unternehmer, Firma und Filiale anlegen.
- [x] Auswahl, vorbereitete Neuanlage, Navigation und Validierung darstellen.
- [x] Filialanlage und Hierarchie-Zusammenfassung als UI-Dummy darstellen.
- [x] Responsive horizontale und vertikale Ausrichtung umsetzen.
- [x] Manuelle Sichtprüfung des UI-Dummys abschließen.

#### Schritt 2: Unternehmer auswählen und anlegen

- [x] Gemeinsame Modelle `IAdresse` und `IKontakt` anlegen.
- [x] Unternehmermodell mit `anzeigename`, eingebetteter `IPerson` sowie Anlage-, Dokument-, Eintrags- und Ergebnis-Typen anlegen.
- [x] `UnternehmerService` und `UnternehmerStore` für Laden und Anlegen umsetzen.
- [x] Die nächste Unternehmernummer aus der vollständig geladenen Liste mit `max(nummer) + 1` bestimmen.
- [x] Neue Unternehmer unter `unternehmer/{unternehmerId}` mit automatischer Dokument-ID, `aktiv`, `erstelltAm` und `aktualisiertAm` speichern.
- [x] Unternehmerdialog mit Anzeigename, Vorname, Nachname, Adresse sowie optionaler E-Mail-Adresse und Telefonnummer umsetzen.
- [x] Pflichtfelder, E-Mail-Adresse und ausschließlich aus Leerzeichen bestehende Eingaben validieren.
- [x] Vorhandene Unternehmer über ein Select auswählen und den Dialog über `Unternehmer anlegen` öffnen.
- [x] Neu angelegte Unternehmer in die Store-Liste übernehmen und automatisch auswählen.
- [x] Schritt 2 erst nach einer gültigen Unternehmerauswahl freigeben.
- [x] Firestore Rules und Rules-Tests für das Schreibrecht aktiver Master erweitern und deployen.

#### Schritt 3: Firma auswählen und anlegen

- [x] Firmenmodell mit getrenntem `anzeigename` und `firmenname` sowie Anlage-, Dokument-, Eintrags- und Ergebnis-Typen festlegen.
- [x] Firmen des ausgewählten Unternehmers laden und sortiert im Store halten.
- [x] Firma-Service und Firma-Store für Laden und Anlegen umsetzen.
- [x] Dialog zum Anlegen einer Firma unter dem ausgewählten Unternehmer erstellen.
- [x] Neue Firma in die Store-Liste übernehmen und automatisch auswählen.
- [x] Filialschritt erst nach einer gültigen Firmenauswahl freigeben.

#### Schritt 4: Filiale anlegen

- [x] Filialmodell mit getrenntem `anzeigename` und `filialname` sowie Anlage-, Dokument-, Eintrags- und Ergebnis-Typen festlegen.
- [x] Filialen der ausgewählten Firma laden und im Store halten.
- [x] Filiale-Service und Filiale-Store für Laden und Anlegen umsetzen.
- [x] Dialog zum Anlegen einer Filiale unter der ausgewählten Firma erstellen.
- [x] Angelegte Filiale in die Store-Liste übernehmen und in der Zusammenfassung anzeigen.
- [x] Vollständige Hierarchie Unternehmer, Firma und Filiale abschließend bestätigen.

#### Tests und Abschluss

- [x] Dialog-, Service-, Store- und Stepper-Tests für die Unternehmer-Anlage ergänzen.
- [x] `npm test`, `npm run test:rules` und `npm run build` für die Unternehmer-Anlage erfolgreich ausführen.
- [x] Unternehmeranlage manuell gegen Firestore prüfen.
- [x] Service-, Store-, Dialog- und Stepper-Tests für die Firmenanlage ergänzen.
- [x] Service-, Store-, Dialog- und Stepper-Tests für die Filialanlage ergänzen.
- [x] Vollständige Datenstruktur-Anlage manuell gegen Firestore prüfen.
- [x] `projekt-stand.md` um den technischen Stand der Filialanlage aktualisieren.
- [x] `npm test`, `npm run test:rules` und `npm run build` für den Gesamtablauf erfolgreich ausführen.

#### Erledigt, wenn

- [x] Der Stepper stellt die drei Hierarchiestufen verständlich und responsiv dar.
- [x] Ein Unternehmer kann ausgewählt oder neu angelegt werden.
- [x] Eine Firma kann für den ausgewählten Unternehmer ausgewählt oder neu angelegt werden.
- [x] Eine Filiale kann technisch für die ausgewählte Firma angelegt werden.
- [x] Die vollständige Hierarchie wird korrekt in Firestore gespeichert, im UI zusammengefasst und nach einem Anwendungsneustart erneut geladen.
- [x] Der reale Gesamtablauf sowie Tests, Rules-Tests und Build sind erfolgreich.

### 4.2 Benutzer anlegen

#### Ziel

Ein serverseitig bestätigter Master kann einen Benutzer mit Anzeigename, Rolle,
E-Mail, Anfangspasswort, erlaubten Bereichen und Datenzugriffen anlegen. Die
Datenzugriffe folgen der Hierarchie
`unternehmer/{unternehmerId}/firma/{firmaId}/filiale/{filialId}`. Eine
Selbstregistrierung bleibt ausgeschlossen und die Sitzung des Masters bleibt
erhalten.

#### Betroffene Dateien

- src/app/commons/models/domain/benutzer.ts
- src/app/commons/models/domain/datenzugriff.ts
- src/app/components/datenzugriff-auswahl/
- src/app/pages/systemverwaltung-page/benutzer-anlage/
- src/app/services/domain/benutzer.service.ts
- src/app/stores/app/stammdaten.store.ts
- src/app/services/domain/datenzugriff.service.ts
- src/app/stores/domain/benutzer-verwaltung.store.ts
- functions/src/index.ts
- firestore.rules
- rules-tests/
- docs/projekt-stand.md

#### Schritt 1: Systemverwaltungszugang und Benutzerformular

- [x] Systemverwaltungsroute, Navigation und Client-Guards für berechtigte Master-Benutzer umsetzen.
- [x] Formular mit Zugangsdaten, Bereichs-Checkboxen und Datenzugriff-Auswahl anlegen.
- [x] Anfangspasswort mit mindestens acht Zeichen und Ein-/Ausblendfunktion erfassen, aber nicht in Firestore speichern.
- [x] Formularvalidierung und Schutz vor doppeltem Absenden umsetzen.
- [x] Formular und Absendezustand nach erfolgreicher Anlage zurücksetzen und die Erfolgsmeldung erhalten.
- [x] Passwortänderung unter `/passwort` mit erneuter Authentifizierung und Passwortbestätigung umsetzen.

#### Schritt 2: Rollen und Datenzugriffe

- [x] Wiederverwendbare Material-Selects für Unternehmer, Firmen und Filialen an echte Firebase-Daten anbinden.
- [x] Rollenabhängige Auswahl umsetzen: Filiale genau eine vollständige Zuordnung, Office eine Unternehmerauswahl und mehrere Firmen beziehungsweise Filialen, Master ohne Datenzuordnung.
- [x] Abhängige Auswahlen bereinigen und bereits geladene Listen nach vollständigem Pfad zwischenspeichern.
- [x] Lade-, Leer- und Fehlerzustände der Datenlisten getrennt vom Anlagezustand verwalten.
- [x] Im gemeinsamen Auswahlmodell und in den Firestore-Dokumenten durchgehend `anzeigename` verwenden.
- [x] Ausgewählte Zugriffe in Formularvalidierung und Anlage-Payload übernehmen.
- [x] Firmen- und Filialzuordnungen im Backend gegen die Firestore-Hierarchie prüfen.
- [x] Office-Firmenfreigabe festlegen: Firmen und Filialen werden explizit zugeordnet; neue Filialen werden nicht automatisch freigegeben.

#### Schritt 3: Konto und Profil sicher anlegen

- [x] Store, Service und Callable Function für die Benutzeranlage umsetzen.
- [x] Anmeldung, aktives Profil und Master-Rolle serverseitig prüfen.
- [x] Auth-Konto und Profil unter `benutzerprofil/{uid}` mit dem Admin SDK sicher anlegen.
- [x] Ohne erfolgreich gespeichertes Profil kein neues Auth-Konto aktivieren und Fehlerfälle kontrolliert bereinigen.
- [x] Vereinfachte Function ohne `zugriffsIndex` deployen; Deployment vom Benutzer bestätigt.
- [x] Vereinfachte Rules ohne `zugriffsIndex` deployen; Deployment vom Benutzer bestätigt.
- [x] Vorhandenes Master-Profil prüfen; eine Datenmigration war nicht erforderlich.

#### Schritt 4: Rechte und realen Gesamtablauf absichern

- [x] Aktive Master für alle benötigten Collections berechtigen.
- [x] Office- und Filialprofile lesend auf zugeordnete Hierarchien samt Untercollections begrenzen.
- [x] Direkten Filial-Lesetest ausführen: eigene Filiale erlaubt, andere Filiale derselben Firma gesperrt.
- [x] Lesen und Schreiben der Altanwendung nach dem Rules-Deployment bestätigen.
- [x] Office-Konten das Aktualisieren zugeordneter Firmen- und Filialdokumente erlauben; Anlegen, Löschen und Schreiben in Untercollections weiterhin sperren.
- [x] Filialkonten vorerst ausschließlich lesend auf ihre zugeordnete Hierarchie begrenzen.
- [x] Aktualisierte Firestore Rules mit den Office-Schreibrechten erfolgreich deployen.
- [x] Office-Zugriffe und Unterdokumente mit realen Testkonten prüfen.

#### Tests und Abschluss

- [x] Service-, Store-, Function-, Rules- und Formulartests für die umgesetzte Benutzeranlage ergänzen.
- [x] Fehlerfälle einschließlich fehlgeschlagener Rückabwicklung durch Backend-Tests prüfen und manuelle Nachbearbeitung dokumentieren.
- [x] Erfolgreiche Benutzeranlage, Anmeldung, Bereichsfreigabe, Systemverwaltungssperre, Passwortwechsel und erneute Anmeldung vom Benutzer bestätigen.
- [x] Den aktuellen Gesamtablauf mit echten Unternehmer-, Firmen- und Filialzuordnungen prüfen.
- [x] Vereinbarte Office- und Filial-Schreibrechte mit Firestore-Emulator-Tests prüfen.
- [x] `projekt-stand.md` nach Abschluss aktualisieren.
- [x] `npm test`, `npm run test:rules` und `npm run build` abschließend erfolgreich ausführen.

#### Erledigt, wenn

- [x] Das Rollenmodell ist vollständig umgesetzt und die vereinbarten Schreibrechte sind abgesichert.
- [x] Der Master kann einen Benutzer mit echten Unternehmer-, Firmen- und Filialzuordnungen anlegen.
- [x] Die Zuordnungen werden vollständig gespeichert und serverseitig geprüft.
- [x] Benutzer können `userRole`, `erlaubteBereiche` und `zugriffe` nicht selbst über den Client verändern.
- [x] Es gibt keine öffentliche Selbstregistrierung.
- [x] Der aktuelle Gesamtablauf ist deployed und mit realen Daten erfolgreich geprüft.

### 4.3 Bestehende Benutzerprofile verwalten

#### Ziel

Ein Master kann vorhandene Profile aus `benutzerprofil` auswählen und deren
Anzeigename, Aktivstatus, erlaubte Bereiche und Datenzugriffe bearbeiten. Die
Benutzerrolle, E-Mail-Adresse und der Firebase-Auth-Status werden in dieser
ersten Ausbaustufe nicht verändert.

#### Betroffene Dateien

- src/app/commons/models/domain/benutzer.ts
- src/app/services/domain/benutzer.service.ts
- src/app/stores/app/stammdaten.store.ts
- src/app/stores/domain/benutzer-verwaltung.store.ts
- src/app/pages/systemverwaltung-page/systemverwaltung-page.ts
- src/app/pages/systemverwaltung-page/systemverwaltung-page.html
- src/app/pages/systemverwaltung-page/systemverwaltung-page.spec.ts
- src/app/pages/systemverwaltung-page/benutzer-verwaltung/
- src/app/pages/systemverwaltung-page/benutzer-verwaltung/benutzer-bearbeiten-dialog/
- firestore.rules
- rules-tests/
- docs/projekt-stand.md

#### Schritt 1: Datenmodell vorbereiten

- [x] `IBenutzerProfilEintrag` für ein Benutzerprofil mit der Dokument-ID als `uid` ergänzen.
- [x] `IBenutzerProfilAktualisierung` für die direkt bearbeitbaren Profilfelder ergänzen.
- [x] Benutzerrolle, E-Mail-Adresse und Passwort bewusst aus dem Aktualisierungsmodell ausschließen.

#### Schritt 2: Benutzerprofile laden und im Store verwalten

- [x] Alle Benutzerprofile für den Master aus `benutzerprofil` laden und die Dokument-ID als `uid` abbilden.
- [x] Benutzer-Verwaltungs-Store um Profilbestand, Auswahl, Ladezustand und Aktualisierungsstatus erweitern.
- [x] Leere Liste, Ladefehler und erfolgreichen Ladezustand unterscheidbar darstellen.

#### Schritt 3: Benutzerprofil auswählen

- [x] Eigenständigen UI-Dummy unter `systemverwaltung-page/benutzer-verwaltung` anlegen.
- [x] Leeres Benutzer-Select und deaktivierten Button `Benutzer bearbeiten` ohne produktive Mockdaten vorbereiten.
- [x] Benutzer über ein `mat-select` auswählen und die `uid` als Select-Wert verwenden.
- [x] Anzeigename und E-Mail-Adresse als verständliche Bezeichnung im Benutzer-Select anzeigen.
- [x] Den Bearbeiten-Button erst nach einer gültigen Benutzerauswahl aktivieren.
- [x] Das ausgewählte `IBenutzerProfilEintrag` an den Bearbeitungsdialog übergeben.

#### Schritt 4: Benutzerprofil bearbeiten und speichern

- [x] Bearbeitungsdialog für Anzeigename, Aktivstatus, erlaubte Bereiche und Datenzugriffe anlegen; die bestehende Rolle nur lesend anzeigen.
- [x] Den Bereich `systemverwaltung` aus der unveränderlichen Rolle ableiten: für Master fest aktiviert, für Office und Filiale fest deaktiviert.
- [x] Vorhandene `DatenzugriffAuswahl` wiederverwenden und rollenabhängige Validierung aus der Benutzeranlage übernehmen.
- [x] Firebase-Service um das Aktualisieren von `benutzerprofil/{uid}` erweitern.
- [x] Beim Speichern `aktualisiertAm` mit einem Server-Timestamp setzen.
- [x] Aktualisierten Eintrag ohne erneutes Laden in die Store-Liste übernehmen.
- [x] Erfolgs-, Fehler-, Lade- und Speicherzustand in der Oberfläche anzeigen.

#### Schritt 5: Selbstschutz und spätere Auth-Erweiterung

- [x] Verhindern, dass ein Master sich selbst deaktiviert; Rollenänderungen generell nicht zulassen.
- [x] Firestore Rules beziehungsweise Backend-Schutz für erlaubte Profilaktualisierungen gezielt testen.
- [x] Festlegen, wie angemeldete Benutzer geänderte Bereiche und Zugriffe ohne erneute Anmeldung erhalten: Das aktuell bearbeitende Masterprofil wird sofort im lokalen Store aktualisiert; andere bereits angemeldete Konten erhalten UI-Freigaben spätestens nach einem Neuladen, während die Rules den neuen Profilstand sofort auswerten.
- [x] E-Mail-Änderungen bleiben einer späteren Cloud Function vorbehalten, die Firebase Auth und Firestore gemeinsam aktualisiert.
- [x] Eine vollständige Kontosperre bleibt einer späteren Cloud Function vorbehalten, die Firebase Auth `disabled` und das Profilfeld `aktiv` synchronisiert.

#### Tests und Abschluss

- [x] Service- und Store-Tests für Laden, Aktualisieren und Fehlerfälle ergänzen.
- [x] Dialog- und Seitentests für Auswahl, Validierung, Speichern und Selbstschutz ergänzen.
- [x] Profilbearbeitung mit einem realen Testkonto prüfen.
- [x] `projekt-stand.md` nach Abschluss aktualisieren.
- [x] `npm test`, `npm run test:rules` und `npm run build` erfolgreich ausführen.

#### Erledigt, wenn

- [x] Ein Master kann ein bestehendes Benutzerprofil über das Select auswählen.
- [x] Anzeigename, Aktivstatus, erlaubte Bereiche und Datenzugriffe können sicher aktualisiert werden; die Benutzerrolle bleibt unverändert.
- [x] E-Mail-Adresse, Passwort und Firebase-Auth-Status bleiben in dieser Ausbaustufe unverändert.
- [x] Der Master kann sich nicht selbst deaktivieren; Rollen können nicht über die Profilbearbeitung verändert werden.
- [x] Die aktualisierte Store-Liste und Oberfläche zeigen den gespeicherten Stand ohne erneutes Laden.
- [x] Tests, Rules-Tests, Build und manuelle Prüfung sind erfolgreich.

## 5. Done Todo: Verwaltung

### 5.1 Firmen- und Filialdaten bearbeiten

#### Ziel

Ein Office-Benutzer kann die Stammdaten seiner zugeordneten Firmen und Filialen
unter `/verwaltung` auswählen und bearbeiten. Ein Master kann denselben Bereich
verwenden, wenn `verwaltung` in seinen erlaubten Bereichen enthalten ist.
Filialkonten erhalten keinen Zugriff auf diesen Verwaltungsbereich. Bestehende
Dokumente werden aktualisiert; Firmen, Filialen und Unterdokumente können hier
weder angelegt noch gelöscht werden.

#### Betroffene Dateien

- src/app/commons/models/app/app-bereich.ts
- src/app/commons/models/domain/firma.ts
- src/app/commons/models/domain/filiale.ts
- src/app/commons/constants/firebase.constants.ts
- src/app/commons/tokens/firebase.tokens.ts
- src/app/components/app-shell/app-sidenav/
- src/app/components/app-shell/app-toolbar/
- src/app/guards/
- src/app/pages/verwaltung-page/
- src/app/services/core/loading.service.ts
- src/app/services/firebase/firestore-db.service.ts
- src/app/services/domain/benutzer.service.ts
- src/app/services/domain/unternehmer.service.ts
- src/app/services/domain/firma.service.ts
- src/app/services/domain/filiale.service.ts
- src/app/stores/domain/firma.store.ts
- src/app/stores/domain/filiale.store.ts
- src/app/stores/app/benutzer.store.ts
- src/app/stores/app/stammdaten.store.ts
- src/app/app.routes.ts
- functions/src/create-benutzer.ts
- firestore.rules
- rules-tests/
- docs/projekt-plan.md
- docs/projekt-stand.md

#### Schritt 1: Verwaltungsbereich und Rollenzugriff anlegen

- [x] `verwaltung` zusätzlich zu `systemverwaltung` als eigenen `TAppBereich` aufnehmen.
- [x] Backend-Validierung der erlaubten Bereiche um `verwaltung` erweitern.
- [x] Eigenständige `verwaltung-page` unter `src/app/pages/verwaltung-page` anlegen.
- [x] Route `/verwaltung` mit `authGuard` und `bereichGuard` anlegen, zusätzlich per Guard auf Office und Master beschränken und nicht berechtigte Benutzer zum Dashboard umleiten.
- [x] Navigationslink `Verwaltung` anhand von `erlaubteBereiche` in der Sidebar einblenden.
- [x] Filialkonten auch bei einem fehlerhaft gesetzten Bereichsschlüssel vom Verwaltungsbereich ausschließen.

#### Schritt 2: Zugeordnete Firmen und Filialen laden

- [x] Datenzugriffe aus dem angemeldeten Benutzerprofil als Grundlage für die erlaubten Dokumentpfade verwenden.
- [x] Zugeordnete Unternehmer, Firmen und Filialen gezielt über ihre Dokumentpfade laden; keine unbeschränkten Collection-Abfragen für Office verwenden.
- [x] Für Master eine Unternehmerauswahl bereitstellen und für Office den einzigen zugeordneten Unternehmer automatisch auswählen; Firmen- und Filialauswahl mit abhängigen Material-Selects aufbauen.
- [x] Auswahl beim Wechsel eines übergeordneten Eintrags konsistent zurücksetzen.
- [x] Lade-, Leer- und Fehlerzustände für die zugeordneten Stammdaten darstellen.

#### Schritt 3: Globalen Ladeindikator vereinheitlichen

- [x] Globalen Lade-Service mit Zähler für parallele Ladevorgänge anlegen.
- [x] Eine unbestimmte Progress-Bar am unteren Rand der App-Toolbar anzeigen.
- [x] Aktuelle Firestore-Lesevorgänge für Benutzerprofil, Unternehmer, Firmen und Filialen zentral registrieren.
- [x] Lokale Ladetexte entfernen; lokale Fehler- und Leerzustände erhalten.
- [x] Service-, Toolbar- und Seitentests für den globalen Ladeindikator ergänzen.

#### Schritt 4: Firestore-Anbindung zentral strukturieren

- [x] Collection- und Dokumentpfade für Benutzerprofile, Unternehmer, Firmen und Filialen zentral definieren.
- [x] Technischen `FirestoreDbService` für Collection-Lesen, Dokument-Lesen, Anlegen, Merge-Aktualisieren und Server-Zeitstempel anlegen.
- [x] Angular-Injection-Kontext und globale Ladeanzeige innerhalb der technischen Firestore-Schicht kapseln.
- [x] `BenutzerService`, `UnternehmerService`, `FirmaService` und `FilialeService` auf den `FirestoreDbService` umstellen, ohne ihre öffentliche API zu ändern.
- [x] Offline-Strategien, Synchronisationsstatus, Migrationen und Batch-Schreibvorgänge bewusst für eine spätere Datenmanagement-Entscheidung ausklammern.
- [x] Tests für technische Firestore-Schicht und fachliche Services anpassen und ergänzen.

#### Schritt 5: Stammdaten für die Sitzung initialisieren

- [x] Nach dem Laden des Benutzerprofils einen app-weiten Stammdatenbestand initialisieren.
- [x] Für Master alle Unternehmer, Firmen, Filialen und Benutzerprofile einmalig laden.
- [x] Für Office- und Filialkonten ausschließlich die im Profil freigegebenen Unternehmer-, Firmen- und Filialdokumente laden.
- [x] Verwaltung, Systemverwaltung und Datenzugriffsauswahl aus dem gemeinsamen Sitzungsbestand versorgen.
- [x] Neu angelegte Unternehmer, Firmen, Filialen und Benutzerprofile ohne erneutes Laden in den Sitzungsbestand übernehmen.
- [x] Identische parallele Firestore-Leseaufträge zusammenfassen und den Sitzungsbestand bei Logout oder Benutzerwechsel zurücksetzen.
- [x] Service- und Store-Tests für vollständiges Master-Laden, eingeschränktes Office-Laden, Cache-Aktualisierung und Reset ergänzen.

#### Schritt 6: Firmendaten bearbeiten

- [x] Aktualisierungsmodell für bearbeitbare Firmendaten festlegen.
- [x] Bearbeitungsdialog für `anzeigename`, `firmenname`, Adresse und Kontaktdaten anlegen.
- [x] Dokument-ID, `nummer`, `aktiv`, `erstelltAm` und Hierarchiepfad nicht als bearbeitbare Felder anbieten.
- [x] `FirmaService` und `VerwaltungStore` um das Aktualisieren einer ausgewählten Firma erweitern.
- [x] Beim Speichern `aktualisiertAm` mit einem Server-Timestamp setzen.
- [x] Aktualisierte Firma ohne erneutes Laden in Verwaltungs- und Stammdatenbestand übernehmen.

#### Schritt 7: Filialdaten bearbeiten

- [x] Aktualisierungsmodell für bearbeitbare Filialdaten festlegen.
- [x] Bearbeitungsdialog für `anzeigename`, `filialname`, Adresse und Kontaktdaten anlegen.
- [x] Dokument-ID, `nummer`, `aktiv`, `erstelltAm` und Hierarchiepfad nicht als bearbeitbare Felder anbieten.
- [x] `FilialeService` und `VerwaltungStore` um das Aktualisieren einer ausgewählten Filiale erweitern.
- [x] Beim Speichern `aktualisiertAm` mit einem Server-Timestamp setzen.
- [x] Aktualisierte Filiale ohne erneutes Laden in Verwaltungs- und Stammdatenbestand übernehmen.

#### Schritt 8: Schreibrechte real prüfen

- [x] Zugeordnete Firma mit einem realen Office-Testkonto erfolgreich aktualisieren.
- [x] Zugeordnete Filiale mit einem realen Office-Testkonto erfolgreich aktualisieren.
- [x] Aktualisierung einer nicht zugeordneten Firma und Filiale ablehnen.
- [x] Anlegen und Löschen von Firmen und Filialen für Office ablehnen.
- [x] Schreiben in Filial-Untercollections für Office weiterhin ablehnen.
- [x] Schreibzugriffe eines Filialkontos weiterhin ablehnen.
- [x] Entscheiden, ob die aktuell vollständige Dokumentaktualisierung später durch feldgenaue Rules eingeschränkt werden soll.

#### Tests und Abschluss

- [x] Guard-, Routen- und Sidebar-Tests für Office, Master und Filiale ergänzen.
- [x] Service- und Store-Tests für das Laden und Aktualisieren von Firmendaten ergänzen.
- [x] Dialog- und Seitentests für Auswahl, Validierung und Speichern von Firmendaten ergänzen.
- [x] Service-, Store-, Dialog- und Seitentests für die Filialdaten-Aktualisierung ergänzen.
- [x] Firestore-Emulator-Tests für erlaubte und verbotene Aktualisierungen erfolgreich ausführen.
- [x] Den Verwaltungsablauf mit einem realen Office-Testkonto prüfen.
- [x] `projekt-plan.md` und `projekt-stand.md` nach Abschluss aktualisieren.
- [x] `npm test`, `npm run test:rules`, Functions-Tests und `npm run build` erfolgreich ausführen.

#### Erledigt, wenn

- [x] Office und Master können den Bereich `/verwaltung` nur mit entsprechender Bereichsfreigabe öffnen.
- [x] Filialkonten können den Verwaltungsbereich nicht öffnen.
- [x] Office sieht ausschließlich die im Benutzerprofil zugeordneten Firmen und Filialen.
- [x] Bearbeitbare Firmen- und Filialdaten können gespeichert und ohne erneutes Laden angezeigt werden.
- [x] Office kann keine nicht zugeordneten Dokumente, Untercollections, Neuanlagen oder Löschungen schreiben.
- [x] Tests, Rules-Tests, Builds und reale manuelle Prüfung sind erfolgreich.

## 3. Done Todo: Login und Benutzerberechtigungen vorbereiten

Ziel:
Bestehende Firebase-Benutzer können sich anmelden. Registrierung erfolgt nicht in dieser App. Nach erfolgreichem Login wird das vorhandene Benutzerprofil aus `benutzer/{uid}` gelesen. Das Profil enthält eine Benutzerrolle und steuert erlaubte App-Bereiche sowie erlaubte Firmen-/Filial-Zugriffe. Die Rolle bleibt zusätzlich am Benutzer gespeichert; die Bereichsfreigaben richten sich derzeit nach `erlaubteBereiche`.

Betroffene Dateien:

- package.json
- package-lock.json
- src/app/app.routes.ts
- src/app/app.ts
- src/app/guards/auth.guard.ts
- src/app/guards/bereich.guard.ts
- src/app/services/firebase/auth.service.ts
- src/app/services/domain/benutzer.service.ts
- src/app/stores/app/benutzer.store.ts
- src/app/commons/models/app/firebase-error.types.ts
- src/app/commons/models/domain/benutzer.ts
- src/app/commons/models/app/app-bereich.ts
- src/app/commons/utils/errors/firebase-error-message.ts
- src/app/pages/auth/login-page/
- docs/projekt-stand.md

Schritte 1: Auth-Service und Benutzer-State

1. [x] Benutzer-Domainmodell für vorhandene Benutzerprofile anlegen.
2. [x] App-Bereich-Typ für erlaubte Bereiche anlegen.
3. [x] Benutzerrollen `filiale`, `office` und `master` im Benutzerprofil abbilden.
4. [x] AuthService für Login, Logout und Auth-State erstellen.
5. [x] BenutzerService für lesenden Zugriff auf `benutzer/{uid}` erstellen.
6. [x] BenutzerStore mit `benutzerProfil`, `inProgress` und `error` anlegen.
7. [x] Benutzerprofil nach Login aus Firestore unter `benutzer/{uid}` lesen.
8. [x] Keine Registrierung und kein Anlegen von Benutzerprofilen in dieser App umsetzen.

Schritte 2: Login und Routing

1. [x] Loginseite mit E-Mail/Passwort-Formular erstellen.
2. [x] Formularvalidierung ergänzen.
3. [x] Loginseite in den Routes eintragen.
4. [x] AuthGuard für geschützte App-Routen anlegen.
5. [x] BereichGuard für `erlaubteBereiche` anlegen.
6. [x] Nach erfolgreichem Login zum Dashboard weiterleiten.
7. [x] Logout-Möglichkeit in der App-Shell vorbereiten.

Schritte 3: Berechtigungen und Datenzugriff

1. [x] Sidebar-Navigation auf `erlaubteBereiche` einschränken.
2. [x] Routen mit Bereich-Daten versehen, z. B. `data: { bereich: 'mitarbeiter' }`.
3. [x] Datenzugriff später über `zugriffe` mit `firmaId` und `filialIds` einschränken.
4. [x] Firestore Rules für serverseitige Absicherung einplanen.

Schritte 4: Fehler, Tests und Abschluss

1. [x] Firebase-Fehler benutzerfreundlich anzeigen.
2. [x] Tests für Service, Store, Guards und Loginformular ergänzen.
3. [x] `projekt-stand.md` nach Umsetzung aktualisieren.
4. [x] `npm test` erfolgreich ausführen.
5. [x] `npm run build` erfolgreich ausführen.

Erledigt wenn:

- [x] Bestehende Benutzer können sich mit E-Mail und Passwort einloggen.
- [x] Die App legt keine Benutzerprofile an.
- [x] Vorhandenes Benutzerprofil wird aus `benutzer/{uid}` gelesen.
- [x] Sidebar und Routen richten sich nach `erlaubteBereiche`.
- [x] Datenzugriff kann über `zugriffe` mit `firmaId` und `filialIds` eingeschränkt werden.
- [x] App-Routen sind für nicht angemeldete Benutzer geschützt.
- [x] Firebase-Fehler werden benutzerfreundlich angezeigt.
- [x] `npm test` läuft erfolgreich.
- [x] `npm run build` läuft erfolgreich.

## 2. Done Todo: Firebase-Grundlage einbinden

Ziel:
Firebase und Firestore werden technisch in die Angular-App eingebunden. Login, Benutzerprofil und Berechtigungen werden noch nicht umgesetzt, sondern erst im nächsten Todo vorbereitet.

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
3. [x] Environment-Dateien für Firebase anlegen.
4. [x] Firebase-Konfiguration über `environment.firebase` bereitstellen.

Schritte 2: AngularFire Provider

1. [x] Firebase App Provider in `app.config.ts` einbinden.
2. [x] Auth Provider in `app.config.ts` einbinden.
3. [x] Firestore Provider in `app.config.ts` einbinden.
4. [x] Firestore mit lokalem Cache vorbereiten.

Schritte 3: Firebase-Struktur

1. [x] Tokens für Auth und Firestore anlegen.
2. [x] Firebase-nahe Service-Struktur unter `src/app/services/firebase` vorbereiten.
3. [x] Noch keine Login- oder Registrierungslogik umsetzen.

Schritte 4: Abschluss

1. [x] `projekt-stand.md` nach Umsetzung aktualisieren.
2. [x] `npm test` erfolgreich ausführen.
3. [x] `npm run build` erfolgreich ausführen.

Erledigt wenn:

- [x] Firebase und AngularFire sind installiert.
- [x] Firebase-Konfiguration liegt in den Environment-Dateien.
- [x] Firebase, Auth und Firestore werden in `app.config.ts` bereitgestellt.
- [x] Firebase Tokens sind vorbereitet.
- [x] Firebase-Service-Ordner ist vorbereitet.
- [x] Es gibt noch keine Registrierung in dieser App.
- [x] `npm test` läuft erfolgreich.
- [x] `npm run build` läuft erfolgreich.

## 1. Done Todo: App-Shell mit Sidebar und Toolbar anlegen

Ziel:
Die App erhält eine Angular-Material-App-Shell mit Toolbar und Sidebar. Die Shell wird in `app-sidenav` und `app-toolbar` unter `src/app/components/app-shell` aufgeteilt. Die Sidebar enthält die Hauptnavigation für Dashboard, Schichtplan und Mitarbeiter.

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
4. [x] Routen für `/dashboard`, `/schichtplan` und `/mitarbeiter` per `loadComponent` vorbereiten und `/` auf `/dashboard` weiterleiten.
5. [x] Tests für die Platzhalter-Seiten ergänzen.

Schritte 2: App-Shell-Components

1. [x] `app-sidenav` unter `src/app/components/app-shell/app-sidenav` anlegen.
2. [x] `app-toolbar` unter `src/app/components/app-shell/app-toolbar` anlegen.
3. [x] Sidebar-Navigation mit Links für Dashboard, Schichtplan und Mitarbeiter anlegen.
4. [x] Toolbar mit Menübutton und App-Titel anlegen.
5. [x] Tests für Sidebar und Toolbar ergänzen.

Schritte 3: App-Layout

1. [x] `app.ts`, `app.html` und `app.scss` auf ein Material-Sidenav-Layout umbauen.
2. [x] Responsive Verhalten für Desktop und kleinere Bildschirme vorbereiten.
3. [x] App-Test an das neue Layout anpassen.

Schritte 4: Abschluss

1. [x] `projekt-stand.md` nach Umsetzung aktualisieren.
2. [x] `next_todo.md` nach Umsetzung abhaken oder in erledigte Todos verschieben.
3. [x] `npm test` erfolgreich ausführen.
4. [x] `npm run build` erfolgreich ausführen.

Erledigt wenn:

- [x] Die App zeigt eine Material-Toolbar und eine Material-Sidebar.
- [x] Die Sidebar liegt in `app-sidenav`.
- [x] Die Toolbar liegt in `app-toolbar`.
- [x] Die Links Dashboard, Schichtplan und Mitarbeiter sind sichtbar.
- [x] Die Navigation funktioniert über Angular Routes.
- [x] Die echten Seiten liegen unter `src/app/pages`.
- [x] `npm test` läuft erfolgreich.
- [x] `npm run build` läuft erfolgreich.
