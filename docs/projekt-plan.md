<!-- pur-office/docs/projekt-plan.md -->

# Projekt-Plan: Pur Office

## Produktidee

Pur Office ist eine Angular-Anwendung zur Darstellung von Office- und Organisationsdaten sowie zur kontrollierten Verwaltung von Benutzerzugaengen.

## Zielrichtung

- Die fachlichen App-Bereiche lesen Daten aus Firestore.
- Ausschliesslich der Verwaltungsbereich darf administrative Schreibvorgaenge ausloesen. Sicherheitskritische Auth-Vorgaenge laufen ueber ein geschuetztes Backend; fachliche Stammdaten darf ein aktiver Master innerhalb der Firestore Rules direkt schreiben.
- Fachliche Bereiche werden klar getrennt.
- UI und Datenzugriff werden ueber Components, Stores und Services getrennt.

## Architektur

- Firestore dient fuer die fachlichen App-Bereiche als lesende Datenquelle.
- Sicherheitskritische administrative Vorgaenge an Firebase Auth werden ueber geschuetzte Firebase Cloud Functions mit Firebase Admin SDK ausgefuehrt.
- Fachliche Verwaltungsdaten koennen durch einen aktiven Master direkt aus dem Angular-Client in Firestore geschrieben werden, wenn die Firestore Rules dies erlauben.
- Firestore Rules bleiben bewusst einfach und sichern nur Zugriff und Besitz.
- Fachliche Regeln, Feldvalidierung und UI-Logik werden in der Anwendung umgesetzt.
- Feature-Bereiche werden lazy geladen.
- Persistenter App-State wird zentral und nachvollziehbar gekapselt.

## Architektur-Schichten

- Components enthalten UI und einfache Formular- oder Interaktionslogik.
- Stores halten App-State, Lade- und Fehlerzustaende und orchestrieren Service-Aufrufe.
- Services kapseln externe Systeme und technische Zugriffe, z. B. Firebase Auth und Firestore.
- Der bevorzugte Datenfluss ist `Component -> Store -> Service -> Firebase/Firestore`.

## Auth und Berechtigungen

Ein Benutzer ist ein authentifizierter Firebase-Auth-User mit `uid`.

Firebase Auth klaert die Identitaet: Wer ist eingeloggt?

Die Berechtigungen liegen im Firestore-Dokument:

```text
benutzerprofil/{uid}
```

Das Benutzerprofil enthaelt mit `userRole` zusaetzlich die Rolle `filiale`, `office` oder `master`. Die allgemeinen Bereichsfreigaben richten sich nach `erlaubteBereiche`. Der administrative Bereich `verwaltung` erfordert zusaetzlich die Rolle `master`.

Welche App-Bereiche und welche Datenraeume der Benutzer lesen darf, wird ueber `erlaubteBereiche` und `zugriffe` festgelegt. Die Zugriffe sind als verschachtelte Map `Unternehmer-ID -> Firma-ID -> Filial-IDs` gespeichert. Altprofile mit der frueheren Array-Struktur bleiben fuer Login und Bereichsfreigaben lesbar, gewaehren Office- und Filialkonten aber keinen Datenzugriff. Aktive Master bleiben davon unberuehrt.

Die App speichert keine direkten Firestore-Pfade als Berechtigung, sondern fachliche Berechtigungen. Daraus werden Navigation, Route Guards und Firestore-Abfragen abgeleitet.

Die Firestore Rules erlauben aktiven Mastern das Lesen und Schreiben aller Collections samt Untercollections, einschliesslich aller Benutzerprofile. Office und Filiale lesen Geschaeftsdaten direkt anhand der verschachtelten `zugriffe`-Map und weiterhin ihr eigenes Profil. Ein separater Zugriffsindex wird nicht gespeichert. Weitere Client-Schreibzugriffe profilierter Office- und Filialkonten bleiben gesperrt. Bestaetigte Altanwendungskonten ohne `benutzerprofil`-Dokument behalten ihren bisherigen Zugriff ausserhalb von `benutzerprofil` und `unternehmer`. Clientseitige Guards ersetzen die Rules nicht.

Eine Selbstregistrierung ist nicht vorgesehen. Benutzerzugaenge werden im Zielablauf im Bereich `verwaltung` von einem `master` vorkonfiguriert. Die Angular-App ruft dafuer eine geschuetzte Firebase Cloud Function auf. Die Function prueft die Rolle des aufrufenden Benutzers serverseitig, legt mit dem Firebase Admin SDK den Auth-Benutzer und anschliessend das Dokument `benutzerprofil/{uid}` an. Der angemeldete `master` bleibt dabei eingeloggt.

Der Master vergibt bei der Anlage ein Anfangspasswort mit mindestens 8 Zeichen. Der Benutzer kann dieses nach der Anmeldung ueber `/passwort` freiwillig aendern. Schlaegt das Anlegen des Benutzerdokuments fehl, muss der zuvor erzeugte Auth-Benutzer wieder entfernt werden, damit kein unvollstaendiger Zugang bestehen bleibt.

### Vereinbartes Rollenmodell fuer Datenzugriffe

- **Filiale:** Das Konto repraesentiert genau eine Filiale, in der Daten erzeugt werden. Bei der Anlage ist genau eine vollstaendige Zuordnung aus Unternehmer, Firma und Filiale erforderlich; alle drei Selects verwenden Einfachauswahl.
- **Office:** Das Konto erhaelt Zugriff ausschliesslich auf ausgewaehlte Firmen und deren freigegebene Filialen. Mehrere Firmen und Filialen koennen zugeordnet werden; auch eine Beschraenkung auf einzelne Filialen ist moeglich. Office hat keinen pauschalen Lesezugriff auf alle Daten. Bestimmte Schreibaktionen, beispielsweise Mitarbeiter anlegen, sind vorgesehen, muessen aber pro Datenart und Aktion innerhalb des freigegebenen Datenbereichs festgelegt werden.
- **Master:** Keine Datenzuordnung erforderlich; aktive Master lesen und schreiben alle Collections und Untercollections auch mit `zugriffe: {}`. Bestehende Masterprofile mit der frueheren leeren Liste bleiben ebenfalls funktionsfaehig. Datenstruktur- und Benutzerverwaltung bleiben dem Master vorbehalten.

Noch zu klaeren: Gewaehrt eine Firmenfreigabe automatisch Zugriff auf alle zugehoerigen Filialen einschliesslich zukuenftiger Filialen, oder werden Filialen stets ausdruecklich ausgewaehlt? Bis zur Entscheidung bleibt die vorhandene explizite Filialzuordnung massgeblich. Konkrete Schreibrechte fuer Filial- und Office-Konten sind separat festzulegen und durch Rules abzusichern; die Altanwendung darf nicht beeintraechtigt werden.

## Datenzugriff: Unternehmer, Firmen und Filialen

Pur Office verwendet fuer neue Benutzer die fachlich benannte Firebase-Struktur:

```text
unternehmer/{unternehmerId}/firma/{firmaId}/filiale/{filialId}
```

Die Altanwendung verwendet weiterhin unveraendert `purCustomers/{unternehmerId}/company/{firmaId}/branches/{filialId}`. Ihre Konten ohne `benutzerprofil`-Dokument behalten dort den bisherigen Zugriff, erhalten aber keinen Legacy-Zugriff auf die neue Top-Level-Collection `unternehmer`.

Die Verwaltungsseite erzeugt fuer Filiale und Office getrennte Auswahlkomponenten mit festen Mehrfachauswahl-Einstellungen; bei Master entfaellt die Auswahl. Ein Rollenwechsel setzt die bisherige Zuordnung zurueck. Die Auswahlkomponente selbst schaltet ihre Modi nicht dynamisch um.

Die Auswahl erfolgt abhaengig voneinander: zuerst Unternehmer, danach dessen Firmen, danach deren Filialen. Unternehmer verwenden `name`; fuer die noch nicht migrierten Firmen- und Filialdokumente werden derzeit `companyName` und `branchName` gelesen. Die Zuordnung verwendet die jeweiligen Dokument-IDs.

Die wiederverwendbare Component `datenzugriff-auswahl` stellt drei Material-Selects bereit. Die Mehrfachauswahl ist je Ebene konfigurierbar und standardmaessig deaktiviert; damit verwenden alle drei Selects standardmaessig Einfachauswahl. Firmen werden nur bei aktivierter Unternehmer-Mehrfachauswahl und mehr als einem ausgewaehlten Unternehmer gruppiert; Filialen entsprechend bei Firmen-Mehrfachauswahl und mehr als einer ausgewaehlten Firma. Beim Abwaehlen eines uebergeordneten Eintrags entfaellt dessen abhaengige Auswahl.

Das Laden erfolgt ueber den bestehenden `BenutzerVerwaltungStore` und den `DatenzugriffService`. Die Benutzeranlage muss Unternehmer-, Firmen- und Filialzuordnung serverseitig pruefen. Bestehende Benutzerprofile muessen bei der Erweiterung des Berechtigungsmodells beruecksichtigt werden.

Die Auswahl ist an lesende Firebase-Abfragen und den Anlage-Payload angebunden. Office-/Filialkonten benoetigen bei der Anlage mindestens eine vollstaendige Datenzuordnung; Master duerfen mit einer leeren Zugriffs-Map angelegt werden. Die Function prueft die Existenz der vollstaendigen Unternehmer-/Firmen-/Filialpfade vor der Auth-Anlage. Die Formularsperre ist entfernt. Benutzeranlage, Anmeldung, Bereichsfreigabe und Passwortwechsel wurden grundsaetzlich bestaetigt; der vollstaendige Office-/Filialablauf mit realer neuer Datenhierarchie bleibt zu pruefen. Der genaue Implementierungsstand steht im [Projekt-Stand](./projekt-stand.md), die offenen Integrationsschritte in [Offene Todos](./next_todo.md).

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

- `app-sidenav` enthaelt die Sidebar mit Hauptnavigation.
- `app-toolbar` enthaelt die obere Toolbar mit App-Aktionen.

Aktuell vorgesehene Navigationslinks:

```text
/dashboard    -> Dashboard
/schichtplan  -> Schichtplan
/mitarbeiter  -> Mitarbeiter
/verwaltung   -> Verwaltung
```

Die Sidebar enthaelt die Hauptnavigation der Anwendung. Aktuell sind vier Bereiche vorgesehen:

1. **Dashboard**
   Noch zu bestimmende Daten der einzelnen Filialen.

2. **Schichtplan**
   Schichtplaene der Filialen.

3. **Mitarbeiter**
   Stammdaten der Mitarbeiter.

4. **Verwaltung**
   Administrativer Bereich fuer `master`. Er umfasst die hierarchische Datenstruktur-Anlage, die Anlage vorkonfigurierter Benutzerzugaenge und die geplante Bearbeitung vorhandener Benutzerprofile. Die Auth-Benutzeranlage erfolgt serverseitig ueber eine geschuetzte Firebase Cloud Function mit Firebase Admin SDK; fachliche Stammdaten darf der Master direkt in Firestore schreiben.

Die Benutzeranlage erstellt Auth-Konten zunaechst deaktiviert und aktiviert sie erst nach erfolgreicher Profilspeicherung. Bei unklaren Aktivierungsfehlern bleibt das Profil zur Absicherung vorhandener Tokens erhalten; fehlgeschlagene Bereinigungen werden fuer manuelle Administratorpruefung protokolliert.
