<!-- pur-office/docs/projekt-plan.md -->

# Projekt-Plan: Pur-System

## Produktidee

Pur-System ist eine Angular-Anwendung zur Darstellung und Bearbeitung von Organisationsdaten sowie zur kontrollierten Verwaltung
von Benutzerzugängen. Es wird in den technischen Auslieferungsvarianten Pur Master, Pur Office, Pur Filiale und Pur Mitarbeiter
bereitgestellt.

## Zielrichtung

- Die fachlichen App-Bereiche lesen Daten aus Firestore und schreiben ausschließlich die jeweils ausdrücklich freigegebenen Daten.
- Die Systemverwaltung bündelt administrative Vorgänge des Masters. Die Verwaltung erlaubt Office und Master das Aktualisieren
  bestehender Firmen- und Filialdaten innerhalb der Firestore Rules. Sicherheitskritische Auth-Vorgänge laufen über ein
  geschütztes Backend.
- Fachliche Bereiche werden klar getrennt.
- UI und Datenzugriff werden über Components, Stores und Services getrennt.
- Das System wird als vier getrennte, installierbare Progressive Web Apps für Master, Office, Filiale und Mitarbeiter
  ausgeliefert.

## Architektur

- Firestore dient für die fachlichen App-Bereiche als Datenquelle für lesende und gezielt freigegebene schreibende Zugriffe.
- Sicherheitskritische administrative Vorgänge an Firebase Auth werden über geschützte Firebase Cloud Functions mit Firebase Admin
  SDK ausgeführt.
- Fachliche Verwaltungsdaten können durch einen aktiven Master direkt aus dem Angular-Client in Firestore geschrieben werden.
  Aktive Office-Konten dürfen ausschließlich ihre zugeordneten Firmen- und Filialdokumente aktualisieren.
- Firestore Rules bleiben bewusst einfach und sichern nur Zugriff und Besitz.
- Fachliche Regeln, Feldvalidierung und UI-Logik werden in der Anwendung umgesetzt.
- Feature-Bereiche werden lazy geladen.
- Persistenter App-State wird zentral und nachvollziehbar gekapselt.

### Architektur-Schichten

- Components enthalten UI und einfache Formular- oder Interaktionslogik.
- Stores halten App-State, Lade- und Fehlerzustände und orchestrieren Service-Aufrufe.
- Fachliche Services kapseln Domänen-Mapping, Sortierung und fachlich benannte Datenoperationen.
- Der technische `FirestoreDbService` kapselt direkte AngularFire-Aufrufe, den Angular-Injection-Kontext, die globale
  Registrierung lesender Ladevorgänge und Echtzeit-Listener für einzelne Dokumente.
- Firestore-Collection- und Dokumentpfade werden zentral erzeugt und nicht in fachlichen Services zusammengesetzt.
- Der bevorzugte Datenfluss ist `Component -> Store -> fachlicher Service -> FirestoreDbService -> Firebase/Firestore`.
- Der app-weite `GlobalBannerService` verwaltet genau einen globalen Hinweis. Die zugehörige App-Shell-Component stellt Art,
  Text und semantische Live-Rolle unterhalb der Toolbar dar. Fachliche Zustände bleiben in ihren Stores und werden in der
  App-Shell auf den Banner-Zustand abgebildet.
- Der app-weite `StammdatenStore` lädt nach dem Benutzerprofil einmalig die für die Sitzung erlaubten Unternehmer, Firmen und
  Filialen. Für Master werden zusätzlich alle Benutzerprofile geladen. Feature-Stores verwenden diesen Sitzungsbestand und lösen
  bei Routenwechseln keine erneuten Stammdatenabfragen aus.
- Fachliche Daten werden zunächst ausschließlich online gelesen und geändert. Dauerhafte lokale Speicherung,
  Synchronisationsstatus und Offline-Schreibvorgänge werden erst bei einem konkreten fachlichen Bedarf pro Datenart ausdrücklich
  festgelegt und über die zentrale Datenzugriffsschicht gekapselt.

## PWA- und Offline-Strategie

### Auslieferungsvarianten

- **Pur Master:** Installierbare PWA für die zentrale Systemverwaltung mit eigener Hosting-Adresse `pur-master.web.app`.
- **Pur Office:** Installierbare PWA für Büro und Verwaltung mit eigener Hosting-Adresse `pur-office.web.app`.
- **Pur Filiale:** Installierbare Progressive Web App. Der Angular Service Worker stellt nach dem ersten erfolgreichen Laden die
  App-Shell und die zum Start erforderlichen statischen Ressourcen offline bereit.
- **Pur Mitarbeiter:** Persönliche mobile PWA innerhalb desselben Angular- und Firebase-Projekts. Sie besitzt einen getrennten
  Build, die eigene Hosting-Adresse `pur-mitarbeiter.web.app` und eine App-Shell mit dem Titel „Pur Mitarbeiter“.

Alle vier Auslieferungsvarianten verwenden eine eigene Produktkennung im Web-App-Manifest. Das jeweilige Login ergänzt den
eingegebenen Namensbestandteil automatisch um das Rollensuffix `master`, `office`, `filiale` oder `mitarbeiter`.

In Pur Mitarbeiter richten sich Anmeldung, App-Shell und Navigation nach den im Benutzerprofil zugewiesenen `erlaubteBereiche`.
Welche fachlichen Mitarbeiterdaten und Funktionen später innerhalb dieser Umgebung angeboten werden, wird bei konkretem fachlichem
Bedarf separat geplant. Der Produktname „Pur Mitarbeiter“ bezeichnet dabei nicht den fachlichen Mitarbeiterdatensatz.

Die Mitarbeiter-App erzeugt keine zusätzliche Rollenbeschränkung. Auch dort bestimmen `erlaubteBereiche` die sichtbaren und
erreichbaren Bereiche. Besondere administrative Routen bleiben zusätzlich durch ihre vorhandenen Rollenguards geschützt.

Die konkreten Build-, Hosting- und Service-Worker-Einstellungen sind in den [PWA-Konfigurationen](./pwa-konfigurationen.md)
zusammengefasst. Die vorgesehene Verwendung und das fachliche Online-/Offline-Verhalten stehen in den
[PWA-Betriebsarten](./pwa-betriebsarten.md).

### Updates und Service Worker

Neue Anwendungsversionen werden im Hintergrund erkannt. Die Anwendung informiert den Benutzer über verfügbare Updates und
ermöglicht einen kontrollierten Wechsel auf die neue Version. Der aktuelle Netzwerkzustand und Funktionen, die eine Verbindung
benötigen, werden in der App-Shell verständlich dargestellt.

Der Service Worker ist ausschließlich für die Anwendungsversion und statische Ressourcen zuständig. Er macht geschützte
Firestore-Daten nicht automatisch offline verfügbar.

### Fachliche Online- und Offline-Nutzung

Fachliche Daten werden in Pur Master, Pur Office, Pur Filiale und Pur Mitarbeiter zunächst ausschließlich online gelesen und
geändert. Es werden keine fachlichen Daten bewusst dauerhaft für einen späteren Offline-Aufruf gespeichert und keine
Offline-Änderungen zur späteren Synchronisation zugelassen.

Das eigene Dokument `benutzerprofil/{uid}` wird während einer wiederhergestellten oder neu gestarteten Anmeldung in Echtzeit
beobachtet. Diese Beobachtung verwendet nur den nicht persistenten Firestore-Speicher. Startet die Anwendung ohne Verbindung,
bleibt die von Firebase Auth wiederhergestellte Anmeldung bestehen; nach der nächsten Serververbindung übernimmt der Listener den
aktuellen Profilstand. Ein inaktives eigenes Profil wird über den globalen Banner-Service app-weit durch einen nicht
ausblendbaren Hinweis angezeigt. Ein Listenerfehler allein ändert den zuletzt bestätigten Aktivstatus nicht.

Eine spätere Ausnahme wird erst bei einem konkreten fachlichen Bedarf einzeln für Datenart, Benutzerrolle, Auslieferungsvariante
und Aktion entschieden. Dabei werden insbesondere Schutzbedarf, Benutzertrennung, veraltete Daten, Berechtigungsänderungen,
Synchronisation und Konfliktbehandlung berücksichtigt.

## Auth und Berechtigungen

### Identität und Anmeldung

Ein Benutzer ist ein authentifizierter Firebase-Auth-User mit `uid`. Firebase Auth klärt die Identität des angemeldeten Benutzers.

Jeder Benutzer besitzt zusätzlich einen unveränderlichen Anmeldenamen im Format `<normalisierter-name>-<rolle>`, beispielsweise
`harald.mischer-master` oder `harald-mischer-master`. Leerzeichen werden als Punkte normalisiert, vorhandene Punkte und
Bindestriche bleiben erhalten, andere Sonderzeichen werden entfernt und deutsche Umlaute sowie `ß` eindeutig umgeschrieben.
Firebase Auth verwendet intern die daraus gebildete technische Adresse `<anmeldename>@pur-system.invalid`. Der Rollenbestandteil
im Anmeldenamen ist ausschließlich Teil der technischen Kennung und gewährt keine Berechtigungen.

Das Loginformular der vier Produktionsvarianten fragt ausschließlich den Namensbestandteil und das Passwort ab. Die jeweilige
Auslieferungsvariante ergänzt automatisch das passende Rollensuffix und für Firebase Auth intern `@pur-system.invalid`. Die
allgemeine Entwicklungsumgebung erwartet weiterhin den vollständigen Anmeldenamen. Eine Rollenauswahl gibt es im Login nicht;
Rolle, Aktivstatus und Bereichsfreigaben werden erst aus dem über die Firebase-UID geladenen Benutzerprofil abgeleitet.

### Benutzeranlage und technische Kennung

Bei der Benutzeranlage erfasst der Master Anzeigename, Benutzerrolle und Anfangspasswort. Die Anwendung bildet daraus automatisch
den nicht bearbeitbaren Anmeldenamen und zeigt ihn im Formular an. Die technische Firebase-Adresse bleibt bei der Anlage verborgen
und wird erst in der Benutzerbearbeitung angezeigt. Die Anwendung übergibt den aus dem Anzeigenamen abgeleiteten
Namensbestandteil zusammen mit dem Anzeigenamen und der Rolle. Die Callable Function normalisiert diesen Namensbestandteil erneut
und erzeugt Anmeldename und technische Adresse verbindlich. Dadurch bleibt die technische Kennung nach der Anlage unabhängig von
späteren Änderungen des Anzeigenamens.

### Benutzerprofil und Bereichsfreigaben

Die Berechtigungen liegen im Firestore-Dokument:

```text
benutzerprofil/{uid}
```

Das Benutzerprofil enthält mit `userRole` die Rollen `filiale`, `office`, `master` und `mitarbeiter`. Die allgemeinen
Bereichsfreigaben richten sich nach `erlaubteBereiche`. `dashboard` ist für jede Rolle verpflichtend und bildet die dauerhaft
erreichbare Hauptseite für den später rollenabhängig dargestellten Hauptinhalt. `systemverwaltung` ist ausschließlich für die
Rolle `master` verpflichtend und für alle anderen Rollen unzulässig.

Die Anwendung beobachtet das eigene Benutzerprofil während der Sitzung. Bei Abmeldung oder Benutzerwechsel wird der bisherige
Listener beendet. Wird das Profil deaktiviert, werden die sitzungsbezogenen Stammdaten zurückgesetzt und der globale Hinweis
„Dieses Profil ist inaktiv. Bitte wende dich an einen Administrator.“ angezeigt. Eine Deaktivierung meldet den Benutzer nicht
automatisch aus. Die vorhandenen Bereichs- und Rollenguards verhindern neue fachliche Navigationen mit einem inaktiven Profil;
die ausschließlich durch Authentifizierung geschützte Passwortseite bleibt erreichbar.

Ein Mitarbeiter kann für die Mitarbeiter-App optional einen eigenen Mitarbeiterzugang mit Firebase Auth und eigener `uid`
erhalten. Der Zugang wird ausschließlich durch einen Master angelegt; eine Selbstregistrierung ist nicht vorgesehen. Benutzer mit
einem Mitarbeiterzugang verwenden die bestehenden Abläufe für Anmeldung, Abmeldung und Passwortänderung. Der Master kann einen
Mitarbeiterzugang deaktivieren und vergibt bei einem vergessenen Passwort ein neues vorläufiges Passwort.

Der Master weist Mitarbeiterzugängen die benötigten `erlaubteBereiche` bei der Anlage und Bearbeitung des Kontos zu. Die
Auslieferungsvariante erzeugt keine zusätzliche Rollenbeschränkung und gewährt keine fachlichen Datenrechte. Datenzugriffe werden
zusätzlich durch Backend und Firestore Rules abgesichert.

Die Auth-Rolle `mitarbeiter` und ein fachlicher Mitarbeiterdatensatz einer Firma sind getrennte Konzepte. Ein Mitarbeiterdatensatz
kann ohne Mitarbeiterzugang bestehen. Soll ein Mitarbeiter Pur Mitarbeiter verwenden, wird sein Mitarbeiterzugang später eindeutig
mit dem zugehörigen Mitarbeiterdatensatz verknüpft. Erst über diesen Mitarbeiterdatensatz und dessen noch festzulegende
Filialzuordnungen entstehen fachliche Datenrechte, beispielsweise auf Dienstpläne bestimmter Filialen. `erlaubteBereiche` steuert
dagegen ausschließlich, welche App-Funktionen über den Mitarbeiterzugang geöffnet werden dürfen.

Bei der Anlage und Bearbeitung von Benutzerprofilen zeigt die Oberfläche nur die optional wählbaren Bereiche `schichtplan`,
`mitarbeiter` und `verwaltung`. `dashboard` und `systemverwaltung` werden nicht als Checkboxen angeboten. Die Anwendung ergänzt
`dashboard` immer und `systemverwaltung` ausschließlich für Master. Die Callable Function setzt diese Pflichtbereiche bei der
Anlage verbindlich durch; bei Profilaktualisierungen normalisiert der fachliche Service die Bereiche entsprechend. Die Firestore
Rules lehnen Aktualisierungen ohne `dashboard`, Masterprofile ohne `systemverwaltung` und Nicht-Masterprofile mit
`systemverwaltung` ab.

### Datenrechte und Firestore Rules

Welche App-Bereiche und welche Datenräume der Benutzer lesen darf, wird über `erlaubteBereiche` und `zugriffe` festgelegt. Die
Zugriffe sind als verschachtelte Map `Unternehmer-ID -> Firma-ID -> Filial-IDs` gespeichert. Altprofile mit der früheren
Array-Struktur bleiben für Login und Bereichsfreigaben lesbar, gewähren Office- und Filialkonten aber keinen Datenzugriff. Aktive
Master bleiben davon unberührt.

Die App speichert keine direkten Firestore-Pfade als Berechtigung, sondern fachliche Berechtigungen. Daraus werden Navigation,
Route Guards und Firestore-Abfragen abgeleitet.

Die Firestore Rules erlauben aktiven Mastern das Lesen aller Collections samt Untercollections. Fachliche Daten dürfen sie
vollständig schreiben; vorhandene Benutzerprofile dürfen sie nur in den ausdrücklich freigegebenen Feldern aktualisieren.
Benutzerrolle, E-Mail-Adresse und Auth-Daten bleiben dabei unveränderlich. Office und Filiale lesen Geschäftsdaten direkt anhand
der verschachtelten `zugriffe`-Map und weiterhin ihr eigenes Profil. Aktive Office-Konten dürfen ihre zugeordneten Firmen- und
Filialdokumente aktualisieren, aber weder Firmen oder Filialen anlegen oder löschen noch Filial-Untercollections beschreiben.
Filialkonten bleiben vorerst rein lesend. Ein separater Zugriffsindex wird nicht gespeichert. Bestätigte Altanwendungskonten ohne
`benutzerprofil`-Dokument behalten ihren bisherigen Zugriff außerhalb von `benutzerprofil` und `unternehmer`. Clientseitige Guards
ersetzen die Rules nicht.

Falls eine Fachfunktion später ausdrücklich für den Offline-Betrieb freigegeben wird, dürfen lokal gespeicherte Berechtigungen und
Daten ausschließlich den zuletzt erfolgreich bestätigten Stand abbilden und keine neuen Rechte gewähren. Nach Wiederherstellung
der Verbindung entscheiden weiterhin die aktuellen Firestore Rules über jeden Serverzugriff. Der konkrete Anwendungsfall muss dann
auch zwischenzeitlich entzogene Rechte und deaktivierte Konten behandeln.

### Kontoverwaltung

Eine Selbstregistrierung ist nicht vorgesehen. Benutzerzugänge werden im Zielablauf im Bereich `systemverwaltung` von einem
`master` vorkonfiguriert. Die Angular-App ruft dafür eine geschützte Firebase Cloud Function auf. Die Function prüft die Rolle des
aufrufenden Benutzers serverseitig, legt mit dem Firebase Admin SDK den Auth-Benutzer und anschließend das Dokument
`benutzerprofil/{uid}` an. Der angemeldete `master` bleibt dabei eingeloggt.

Der Master vergibt bei der Anlage ein Anfangspasswort mit mindestens 8 Zeichen. Der Benutzer kann dieses nach der Anmeldung über
`/passwort` freiwillig ändern. Schlägt das Anlegen des Benutzerdokuments fehl, muss der zuvor erzeugte Auth-Benutzer wieder
entfernt werden, damit kein unvollständiger Zugang bestehen bleibt.

Die Benutzeranlage erstellt Auth-Konten zunächst deaktiviert und aktiviert sie erst nach erfolgreicher Profilspeicherung. Bei
unklaren Aktivierungsfehlern bleibt das Profil zur Absicherung vorhandener Tokens erhalten; fehlgeschlagene Bereinigungen werden
für manuelle Administratorprüfung protokolliert.

### Vereinbartes Rollenmodell für Datenzugriffe

- **Filiale:** Das Konto repräsentiert genau eine Filiale, in der Daten erzeugt werden. Bei der Anlage ist genau eine vollständige
  Zuordnung aus Unternehmer, Firma und Filiale erforderlich; alle drei Selects verwenden Einfachauswahl.
- **Office:** Das Konto erhält Zugriff ausschließlich auf ausgewählte Firmen und deren ausdrücklich freigegebene Filialen. Mehrere
  Firmen und Filialen können zugeordnet werden; auch eine Beschränkung auf einzelne Filialen ist möglich. Office hat keinen
  pauschalen Lesezugriff auf alle Daten. Bestehende zugeordnete Firmen- und Filialdokumente dürfen aktualisiert, aber nicht
  angelegt oder gelöscht werden. Weitere Schreibaktionen, beispielsweise Mitarbeiter anlegen, müssen pro Datenart und Aktion
  innerhalb des freigegebenen Datenbereichs festgelegt werden.
- **Master:** Keine Datenzuordnung erforderlich; aktive Master lesen und schreiben alle Collections und Untercollections auch mit
  `zugriffe: {}`. Bestehende Masterprofile mit der früheren leeren Liste bleiben ebenfalls funktionsfähig. Datenstruktur- und
  Benutzerverwaltung bleiben dem Master vorbehalten.
- **Mitarbeiter:** Vierte Auth-Rolle für die mobile Mitarbeiter-App. Ein Mitarbeiter kann optional einen eigenen, durch einen
  Master angelegten Mitarbeiterzugang erhalten. Der Master weist die benötigten `erlaubteBereiche` zu; fachliche Datenrechte
  entstehen daraus nicht. Ein fachlicher Mitarbeiterdatensatz kann ohne Mitarbeiterzugang bestehen. Seine mögliche spätere
  Verknüpfung mit einem Zugang, Filialzuordnungen, fachliche Mitarbeiterrollen wie Service, Kasse oder Admin, Dienstplandaten,
  persönliche Aktionen und Push-Benachrichtigungen werden bei konkretem fachlichem Bedarf separat geplant.

Eine Firmenfreigabe gewährt nicht automatisch Zugriff auf alle aktuellen oder zukünftigen Filialen. Filialen werden weiterhin
ausdrücklich in der verschachtelten Zugriffs-Map zugeordnet. Weitere Schreibrechte für Filial- und Office-Konten sind separat
festzulegen und durch Rules abzusichern; die Altanwendung darf nicht beeinträchtigt werden.

## Datenzugriff: Unternehmer, Firmen und Filialen

### Datenmodell

Pur Office verwendet für neue Benutzer die fachlich benannte Firebase-Struktur:

```text
unternehmer/{unternehmerId}/firma/{firmaId}/filiale/{filialId}
```

Die Altanwendung verwendet weiterhin unverändert `purCustomers/{unternehmerId}/company/{firmaId}/branches/{filialId}`. Ihre Konten
ohne `benutzerprofil`-Dokument behalten dort den bisherigen Zugriff, erhalten aber keinen Legacy-Zugriff auf die neue
Top-Level-Collection `unternehmer`.

### Auswahlverhalten

Die Systemverwaltungsseite erzeugt für Filiale und Office getrennte Auswahlkomponenten mit festen Mehrfachauswahl-Einstellungen;
bei Master entfällt die Auswahl. Ein Rollenwechsel setzt die bisherige Zuordnung zurück. Die Auswahlkomponente selbst schaltet
ihre Modi nicht dynamisch um.

Die Auswahl erfolgt abhängig voneinander: zuerst Unternehmer, danach dessen Firmen, danach deren Filialen. Das gemeinsame
Auswahlmodell und die Firestore-Dokumente verwenden für alle Ebenen einheitlich `anzeigename`. Die Zuordnung verwendet die
jeweiligen Dokument-IDs.

Die wiederverwendbare Component `datenzugriff-auswahl` stellt drei Material-Selects bereit. Die Mehrfachauswahl ist je Ebene
konfigurierbar und standardmäßig deaktiviert; damit verwenden alle drei Selects standardmäßig Einfachauswahl. Firmen werden nur
bei aktivierter Unternehmer-Mehrfachauswahl und mehr als einem ausgewählten Unternehmer gruppiert; Filialen entsprechend bei
Firmen-Mehrfachauswahl und mehr als einer ausgewählten Firma. Beim Abwählen eines übergeordneten Eintrags entfällt dessen
abhängige Auswahl.

### Laden und Validierung

Das Laden erfolgt nach der Anmeldung zentral über den `StammdatenStore`. Der `BenutzerVerwaltungStore` stellt daraus die
abhängigen Auswahllisten zusammen; der `DatenzugriffService` bleibt als abgesicherter Ladeweg verfügbar, falls die
Sitzungsinitialisierung nicht erfolgreich abgeschlossen wurde. Die Benutzeranlage muss Unternehmer-, Firmen- und Filialzuordnung
serverseitig prüfen. Bestehende Benutzerprofile müssen bei der Erweiterung des Berechtigungsmodells berücksichtigt werden.

Die Auswahl ist an lesende Firebase-Abfragen und den Anlage-Payload angebunden. Office-/Filialkonten benötigen bei der Anlage
mindestens eine vollständige Datenzuordnung; Master dürfen mit einer leeren Zugriffs-Map angelegt werden. Die Function prüft die
Existenz der vollständigen Unternehmer-/Firmen-/Filialpfade vor der Auth-Anlage. Während der Benutzeranlage ist das vollständige
Formular einschließlich eigenständig verwalteter Unterkomponenten gesperrt; nach Erfolg oder Fehler wird es wieder freigegeben.
Benutzeranlage, Anmeldung, Bereichsfreigabe und Passwortwechsel wurden grundsätzlich bestätigt. Ein reales Office-Testkonto konnte
seine zugeordneten Firmen- und Filialdaten bearbeiten; die vereinbarten Schreibgrenzen sind zusätzlich durch Emulator-Tests
abgesichert.
Der genaue Implementierungsstand steht im [Projekt-Stand](./projekt-stand.md), die unmittelbar anstehenden Schritte in den
[offenen Todos](./todo_next.md) und bewusst zurückgestellte Aufgaben in den [späteren Todos](./todo_spaeter.md).

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

## Navigation

### App-Shell

Die App verwendet ein Angular-Material-Layout mit Toolbar und Sidebar.

Die App-Shell wird in wiederverwendbare Components unter `src/app/components/app-shell` aufgeteilt:

- `app-sidenav` enthält die Sidebar mit Hauptnavigation.
- `app-toolbar` enthält die obere Toolbar mit App-Aktionen.

Die Toolbar zeigt zentral registrierte Lese- und Schreibvorgänge über eine globale unbestimmte Progress-Bar an. Parallele Vorgänge
werden gezählt, damit die Anzeige erst nach Abschluss der letzten laufenden Operation ausgeblendet wird.

Die Navigation wird für jede `userRole` zentral mit der ausdrücklich festgelegten Darstellungsart `flat` oder `nested`
konfiguriert. Die App leitet die Darstellungsart nicht automatisch aus der Anzahl oder Verschachtelung der Navigationseinträge ab.
Benötigt eine weitere Rolle später ausklappbare Gruppen, wird ihre zentrale Rollenkonfiguration auf `nested` umgestellt. Flache
Navigationen und verschachtelte Navigationen mit nicht navigierbaren, ausklappbaren Gruppen verwenden getrennte
Darstellungskomponenten.

Maßgeblich ist die Rolle aus dem geladenen Benutzerprofil. `erlaubteBereiche` filtert ausschließlich die sichtbaren Einträge und
verändert die für die Rolle konfigurierte Darstellungsart nicht. Dieselbe Rollen- und Bereichsauswertung bestimmt die erreichbaren
Start- und Ausweichrouten. Die vorhandenen Routenguards bleiben unabhängig davon die verbindliche Zugriffskontrolle.

### Navigationsbereiche

Die Sidebar enthält die Hauptnavigation der Anwendung. Aktuell sind fünf Bereiche vorgesehen:

1. **Dashboard (`/dashboard`):** Noch zu bestimmende Daten der einzelnen Filialen.

2. **Schichtplan (`/schichtplan`):** Schichtpläne der Filialen.

3. **Mitarbeiter (`/mitarbeiter`):** Stammdaten der Mitarbeiter.

4. **Verwaltung (`/verwaltung`):** Bereich für Office und Master zur Auswahl und Bearbeitung zugeordneter Firmen- und Filialdaten.
   Die Route erfordert zusätzlich die Bereichsfreigabe `verwaltung`; Filialkonten bleiben ausgeschlossen.

5. **Systemverwaltung (`/systemverwaltung`):** Administrativer Bereich für `master`. Er umfasst die hierarchische
   Datenstruktur-Anlage unter `/systemverwaltung/datenstruktur` sowie Benutzeranlage und Bearbeitung vorhandener Benutzerprofile
   unter `/systemverwaltung/benutzer`. In der Sidebar ist der Bereich eine ausklappbare Gruppe mit beiden Unterseiten. Die
   Auth-Benutzeranlage erfolgt serverseitig über eine geschützte Firebase Cloud Function mit Firebase Admin SDK; fachliche
   Stammdaten darf der Master direkt in Firestore schreiben. `/systemverwaltung` leitet auf die Datenstruktur-Anlage weiter.
