<!-- pur-office/docs/projekt-plan.md -->

# Projekt-Plan: Pur Office

## Produktidee

Pur Office ist eine Angular-Anwendung zur Darstellung von Office- und Organisationsdaten sowie zur kontrollierten Verwaltung von Benutzerzugängen.

## Zielrichtung

- Die fachlichen App-Bereiche lesen Daten aus Firestore und schreiben ausschließlich die jeweils ausdrücklich freigegebenen Daten.
- Die Systemverwaltung bündelt administrative Vorgänge des Masters. Die Verwaltung erlaubt Office und Master das Aktualisieren bestehender Firmen- und Filialdaten innerhalb der Firestore Rules. Sicherheitskritische Auth-Vorgänge laufen über ein geschütztes Backend.
- Fachliche Bereiche werden klar getrennt.
- UI und Datenzugriff werden über Components, Stores und Services getrennt.

## Architektur

- Firestore dient für die fachlichen App-Bereiche als Datenquelle für lesende und gezielt freigegebene schreibende Zugriffe.
- Sicherheitskritische administrative Vorgänge an Firebase Auth werden über geschützte Firebase Cloud Functions mit Firebase Admin SDK ausgeführt.
- Fachliche Verwaltungsdaten können durch einen aktiven Master direkt aus dem Angular-Client in Firestore geschrieben werden. Aktive Office-Konten dürfen ausschließlich ihre zugeordneten Firmen- und Filialdokumente aktualisieren.
- Firestore Rules bleiben bewusst einfach und sichern nur Zugriff und Besitz.
- Fachliche Regeln, Feldvalidierung und UI-Logik werden in der Anwendung umgesetzt.
- Feature-Bereiche werden lazy geladen.
- Persistenter App-State wird zentral und nachvollziehbar gekapselt.

## Architektur-Schichten

- Components enthalten UI und einfache Formular- oder Interaktionslogik.
- Stores halten App-State, Lade- und Fehlerzustände und orchestrieren Service-Aufrufe.
- Fachliche Services kapseln Domänen-Mapping, Sortierung und fachlich benannte Datenoperationen.
- Der technische `FirestoreDbService` kapselt direkte AngularFire-Aufrufe, den Angular-Injection-Kontext und die globale Registrierung lesender Ladevorgänge.
- Firestore-Collection- und Dokumentpfade werden zentral erzeugt und nicht in fachlichen Services zusammengesetzt.
- Der bevorzugte Datenfluss ist `Component -> Store -> fachlicher Service -> FirestoreDbService -> Firebase/Firestore`.
- Der app-weite `StammdatenStore` lädt nach dem Benutzerprofil einmalig die für die Sitzung erlaubten Unternehmer, Firmen und Filialen. Für Master werden zusätzlich alle Benutzerprofile geladen. Feature-Stores verwenden diesen Sitzungsbestand und lösen bei Routenwechseln keine erneuten Stammdatenabfragen aus.
- Offline-Strategien und Synchronisationsstatus werden erst ergänzt, wenn die Datenmanagement- und PWA-Strategie festgelegt ist.

## Auth und Berechtigungen

Ein Benutzer ist ein authentifizierter Firebase-Auth-User mit `uid`.

Firebase Auth klärt die Identität: Wer ist eingeloggt?

Die Berechtigungen liegen im Firestore-Dokument:

```text
benutzerprofil/{uid}
```

Das Benutzerprofil enthält mit `userRole` zusätzlich die Rolle `filiale`, `office` oder `master`. Die allgemeinen Bereichsfreigaben richten sich nach `erlaubteBereiche`. Der administrative Bereich `systemverwaltung` erfordert zusätzlich die Rolle `master`.

Bei der Bearbeitung bestehender Benutzerprofile wird die Freigabe `systemverwaltung` aus der unveränderlichen Rolle abgeleitet: Für Master ist sie fest aktiviert, für Office und Filiale fest deaktiviert.

Welche App-Bereiche und welche Datenräume der Benutzer lesen darf, wird über `erlaubteBereiche` und `zugriffe` festgelegt. Die Zugriffe sind als verschachtelte Map `Unternehmer-ID -> Firma-ID -> Filial-IDs` gespeichert. Altprofile mit der früheren Array-Struktur bleiben für Login und Bereichsfreigaben lesbar, gewähren Office- und Filialkonten aber keinen Datenzugriff. Aktive Master bleiben davon unberührt.

Die App speichert keine direkten Firestore-Pfade als Berechtigung, sondern fachliche Berechtigungen. Daraus werden Navigation, Route Guards und Firestore-Abfragen abgeleitet.

Die Firestore Rules erlauben aktiven Mastern das Lesen aller Collections samt Untercollections. Fachliche Daten dürfen sie vollständig schreiben; vorhandene Benutzerprofile dürfen sie nur in den ausdrücklich freigegebenen Feldern aktualisieren. Benutzerrolle, E-Mail-Adresse und Auth-Daten bleiben dabei unveränderlich. Office und Filiale lesen Geschäftsdaten direkt anhand der verschachtelten `zugriffe`-Map und weiterhin ihr eigenes Profil. Aktive Office-Konten dürfen ihre zugeordneten Firmen- und Filialdokumente aktualisieren, aber weder Firmen oder Filialen anlegen oder löschen noch Filial-Untercollections beschreiben. Filialkonten bleiben vorerst rein lesend. Ein separater Zugriffsindex wird nicht gespeichert. Bestätigte Altanwendungskonten ohne `benutzerprofil`-Dokument behalten ihren bisherigen Zugriff außerhalb von `benutzerprofil` und `unternehmer`. Clientseitige Guards ersetzen die Rules nicht.

Eine Selbstregistrierung ist nicht vorgesehen. Benutzerzugänge werden im Zielablauf im Bereich `systemverwaltung` von einem `master` vorkonfiguriert. Die Angular-App ruft dafür eine geschützte Firebase Cloud Function auf. Die Function prüft die Rolle des aufrufenden Benutzers serverseitig, legt mit dem Firebase Admin SDK den Auth-Benutzer und anschließend das Dokument `benutzerprofil/{uid}` an. Der angemeldete `master` bleibt dabei eingeloggt.

Der Master vergibt bei der Anlage ein Anfangspasswort mit mindestens 8 Zeichen. Der Benutzer kann dieses nach der Anmeldung über `/passwort` freiwillig ändern. Schlägt das Anlegen des Benutzerdokuments fehl, muss der zuvor erzeugte Auth-Benutzer wieder entfernt werden, damit kein unvollständiger Zugang bestehen bleibt.

### Vereinbartes Rollenmodell für Datenzugriffe

- **Filiale:** Das Konto repräsentiert genau eine Filiale, in der Daten erzeugt werden. Bei der Anlage ist genau eine vollständige Zuordnung aus Unternehmer, Firma und Filiale erforderlich; alle drei Selects verwenden Einfachauswahl.
- **Office:** Das Konto erhält Zugriff ausschließlich auf ausgewählte Firmen und deren ausdrücklich freigegebene Filialen. Mehrere Firmen und Filialen können zugeordnet werden; auch eine Beschränkung auf einzelne Filialen ist möglich. Office hat keinen pauschalen Lesezugriff auf alle Daten. Bestehende zugeordnete Firmen- und Filialdokumente dürfen aktualisiert, aber nicht angelegt oder gelöscht werden. Weitere Schreibaktionen, beispielsweise Mitarbeiter anlegen, müssen pro Datenart und Aktion innerhalb des freigegebenen Datenbereichs festgelegt werden.
- **Master:** Keine Datenzuordnung erforderlich; aktive Master lesen und schreiben alle Collections und Untercollections auch mit `zugriffe: {}`. Bestehende Masterprofile mit der früheren leeren Liste bleiben ebenfalls funktionsfähig. Datenstruktur- und Benutzerverwaltung bleiben dem Master vorbehalten.

Eine Firmenfreigabe gewährt nicht automatisch Zugriff auf alle aktuellen oder zukünftigen Filialen. Filialen werden weiterhin ausdrücklich in der verschachtelten Zugriffs-Map zugeordnet. Weitere Schreibrechte für Filial- und Office-Konten sind separat festzulegen und durch Rules abzusichern; die Altanwendung darf nicht beeinträchtigt werden.

## Datenzugriff: Unternehmer, Firmen und Filialen

Pur Office verwendet für neue Benutzer die fachlich benannte Firebase-Struktur:

```text
unternehmer/{unternehmerId}/firma/{firmaId}/filiale/{filialId}
```

Die Altanwendung verwendet weiterhin unverändert `purCustomers/{unternehmerId}/company/{firmaId}/branches/{filialId}`. Ihre Konten ohne `benutzerprofil`-Dokument behalten dort den bisherigen Zugriff, erhalten aber keinen Legacy-Zugriff auf die neue Top-Level-Collection `unternehmer`.

Die Systemverwaltungsseite erzeugt für Filiale und Office getrennte Auswahlkomponenten mit festen Mehrfachauswahl-Einstellungen; bei Master entfällt die Auswahl. Ein Rollenwechsel setzt die bisherige Zuordnung zurück. Die Auswahlkomponente selbst schaltet ihre Modi nicht dynamisch um.

Die Auswahl erfolgt abhängig voneinander: zuerst Unternehmer, danach dessen Firmen, danach deren Filialen. Das gemeinsame Auswahlmodell und die Firestore-Dokumente verwenden für alle Ebenen einheitlich `anzeigename`. Die Zuordnung verwendet die jeweiligen Dokument-IDs.

Die wiederverwendbare Component `datenzugriff-auswahl` stellt drei Material-Selects bereit. Die Mehrfachauswahl ist je Ebene konfigurierbar und standardmäßig deaktiviert; damit verwenden alle drei Selects standardmäßig Einfachauswahl. Firmen werden nur bei aktivierter Unternehmer-Mehrfachauswahl und mehr als einem ausgewählten Unternehmer gruppiert; Filialen entsprechend bei Firmen-Mehrfachauswahl und mehr als einer ausgewählten Firma. Beim Abwählen eines übergeordneten Eintrags entfällt dessen abhängige Auswahl.

Das Laden erfolgt nach der Anmeldung zentral über den `StammdatenStore`. Der `BenutzerVerwaltungStore` stellt daraus die abhängigen Auswahllisten zusammen; der `DatenzugriffService` bleibt als abgesicherter Ladeweg verfügbar, falls die Sitzungsinitialisierung nicht erfolgreich abgeschlossen wurde. Die Benutzeranlage muss Unternehmer-, Firmen- und Filialzuordnung serverseitig prüfen. Bestehende Benutzerprofile müssen bei der Erweiterung des Berechtigungsmodells berücksichtigt werden.

Die Auswahl ist an lesende Firebase-Abfragen und den Anlage-Payload angebunden. Office-/Filialkonten benötigen bei der Anlage mindestens eine vollständige Datenzuordnung; Master dürfen mit einer leeren Zugriffs-Map angelegt werden. Die Function prüft die Existenz der vollständigen Unternehmer-/Firmen-/Filialpfade vor der Auth-Anlage. Die Formularsperre ist entfernt. Benutzeranlage, Anmeldung, Bereichsfreigabe und Passwortwechsel wurden grundsätzlich bestätigt. Ein reales Office-Testkonto konnte seine zugeordneten Firmen- und Filialdaten bearbeiten; die vereinbarten Schreibgrenzen sind zusätzlich durch Emulator-Tests abgesichert. Der genaue Implementierungsstand steht im [Projekt-Stand](./projekt-stand.md), die offenen Integrationsschritte in [Offene Todos](./next_todo.md).

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

Die App verwendet ein Angular-Material-Layout mit Toolbar und Sidebar.

Die App-Shell wird in wiederverwendbare Components unter `src/app/components/app-shell` aufgeteilt:

- `app-sidenav` enthält die Sidebar mit Hauptnavigation.
- `app-toolbar` enthält die obere Toolbar mit App-Aktionen.

Aktuell vorgesehene Navigationslinks:

```text
/dashboard    -> Dashboard
/schichtplan  -> Schichtplan
/mitarbeiter  -> Mitarbeiter
/verwaltung   -> Verwaltung
/systemverwaltung -> Systemverwaltung
```

Die Sidebar enthält die Hauptnavigation der Anwendung. Aktuell sind fünf Bereiche vorgesehen:

1. **Dashboard**
   Noch zu bestimmende Daten der einzelnen Filialen.

2. **Schichtplan**
   Schichtpläne der Filialen.

3. **Mitarbeiter**
   Stammdaten der Mitarbeiter.

4. **Verwaltung**
   Bereich für Office und Master zur Auswahl und Bearbeitung zugeordneter Firmen- und Filialdaten. Die Route erfordert zusätzlich die Bereichsfreigabe `verwaltung`; Filialkonten bleiben ausgeschlossen.

5. **Systemverwaltung**
   Administrativer Bereich für `master`. Er umfasst die hierarchische Datenstruktur-Anlage, die Anlage vorkonfigurierter Benutzerzugänge und die Bearbeitung vorhandener Benutzerprofile. Die Auth-Benutzeranlage erfolgt serverseitig über eine geschützte Firebase Cloud Function mit Firebase Admin SDK; fachliche Stammdaten darf der Master direkt in Firestore schreiben.

Die Benutzeranlage erstellt Auth-Konten zunächst deaktiviert und aktiviert sie erst nach erfolgreicher Profilspeicherung. Bei unklaren Aktivierungsfehlern bleibt das Profil zur Absicherung vorhandener Tokens erhalten; fehlgeschlagene Bereinigungen werden für manuelle Administratorprüfung protokolliert.
