<!-- pur-office/docs/projekt-plan.md -->

# Projekt-Plan: Pur Office

## Produktidee

Pur Office ist eine Angular-Anwendung zur Darstellung von Office- und Organisationsdaten sowie zur kontrollierten Verwaltung von Benutzerzugaengen.

## Zielrichtung

- Die fachlichen App-Bereiche lesen Daten aus Firestore.
- Ausschliesslich der Verwaltungsbereich darf kontrollierte Schreibvorgaenge ueber ein geschuetztes Backend ausloesen.
- Fachliche Bereiche werden klar getrennt.
- UI und Datenzugriff werden ueber Components, Stores und Services getrennt.

## Architektur

- Firestore dient fuer die fachlichen App-Bereiche als lesende Datenquelle.
- Administrative Schreibvorgaenge werden nicht direkt vom Angular-Client ausgefuehrt, sondern ueber geschuetzte Firebase Cloud Functions mit Firebase Admin SDK.
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
benutzer/{uid}
```

Das Benutzerprofil enthaelt mit `userRole` zusaetzlich die Rolle `filiale`, `office` oder `master`. Die allgemeinen Bereichsfreigaben richten sich nach `erlaubteBereiche`. Der administrative Bereich `verwaltung` erfordert zusaetzlich die Rolle `master`.

Welche App-Bereiche und welche Datenraeume der Benutzer lesen darf, wird ueber `erlaubteBereiche` und `zugriffe` festgelegt. Ein Zugriff verbindet immer eine `firmaId` mit den erlaubten `filialIds`, weil Filialen immer unter einer Firma liegen.

Die App speichert keine direkten Firestore-Pfade als Berechtigung, sondern fachliche Berechtigungen. Daraus werden Navigation, Route Guards und Firestore-Abfragen abgeleitet.

Firestore Rules sichern den Zugriff serverseitig ebenfalls ab.

Eine Selbstregistrierung ist nicht vorgesehen. Benutzerzugaenge werden spaeter im Bereich `verwaltung` von einem `master` vorkonfiguriert. Die Angular-App ruft dafuer eine geschuetzte Firebase Cloud Function auf. Die Function prueft die Rolle des aufrufenden Benutzers serverseitig, legt mit dem Firebase Admin SDK den Auth-Benutzer und anschliessend das Dokument `benutzer/{uid}` an. Der angemeldete `master` bleibt dabei eingeloggt.

Der Master vergibt bei der Anlage ein Anfangspasswort mit mindestens 8 Zeichen. Der Benutzer kann dieses nach der Anmeldung ueber `/passwort` freiwillig aendern. Schlaegt das Anlegen des Benutzerdokuments fehl, muss der zuvor erzeugte Auth-Benutzer wieder entfernt werden, damit kein unvollstaendiger Zugang bestehen bleibt.

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
   Administrativer Bereich fuer `master`. Hier werden vorkonfigurierte Benutzerzugaenge mit Rolle, erlaubten Bereichen sowie Firmen- und Filialzugriffen angelegt. Die eigentliche Benutzeranlage erfolgt serverseitig ueber eine geschuetzte Firebase Cloud Function mit Firebase Admin SDK.
