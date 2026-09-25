<!-- pur-office/docs/pwa-konfigurationen.md -->

# PWA-Konfigurationen

Die gemeinsame Gegenüberstellung von Auslieferungsvarianten, vorgesehenem Einsatz sowie Online- und Offline-Betrieb steht in der
[Auslieferungs- und Betriebsartenmatrix](./pwa-betriebsarten.md).

## Konfigurationsmatrix

| Variante               | Adresse oder Ziel                 | Befehl                        | Angular-Konfiguration    | Ausgabe                        | Service Worker | Manifest        | Offline-App-Shell |
| ---------------------- | --------------------------------- | ----------------------------- | ------------------------ | ------------------------------ | -------------- | --------------- | ----------------- |
| Entwicklung            | `http://localhost:4200`           | `npm run web:pur-office`      | `development`            | Angular Dev Server             | aus            | Pur Office      | nein              |
| Lokale Filial-PWA      | `http://localhost:8080`           | `npm run pwa:pur-filiale`     | `production,pwa`         | `dist/pur-filiale/browser`     | an             | Pur Filiale     | ja                |
| Mitarbeiter-Build      | `http://localhost:8081`           | `npm run pwa:pur-mitarbeiter` | `production,mitarbeiter` | `dist/pur-mitarbeiter/browser` | an             | Pur Mitarbeiter | ja                |
| Office-Produktion      | `https://pur-office.web.app`      | `npm run build:office`        | `production`             | `dist/pur-office/browser`      | aus            | Pur Office      | nein              |
| Filial-Produktion      | `https://pur-filiale.web.app`     | `npm run build:filiale`       | `production,pwa`         | `dist/pur-filiale/browser`     | an             | Pur Filiale     | ja                |
| Mitarbeiter-Produktion | `https://pur-mitarbeiter.web.app` | `npm run build:mitarbeiter`   | `production,mitarbeiter` | `dist/pur-mitarbeiter/browser` | an             | Pur Mitarbeiter | ja                |

Port `8080` liefert lokal denselben Filial-PWA-Build aus, der für `pur-filiale.web.app` vorgesehen ist. Alle drei vorgesehenen
Produktionsvarianten verwenden im Manifest den Darstellungsmodus `standalone`. Beim Office-Build betrifft dies nur die
browserabhängige Installation und Darstellung in einem eigenen Fenster; ohne Service Worker steht keine Offline-App-Shell zur
Verfügung.

`npm run start-web` bleibt als kurzer Alias für `npm run web:pur-office` verfügbar.

`npm run pwa:pur-mitarbeiter` erzeugt den Mitarbeiter-Build und stellt ihn auf Port `8081` lokal bereit. Die Vorschau entspricht
dem Build, der unter `pur-mitarbeiter.web.app` veröffentlicht ist.

## Service-Worker-Ressourcen

| Ressourcengruppe | Installation                                       | Aktualisierung          | Inhalt                                     |
| ---------------- | -------------------------------------------------- | ----------------------- | ------------------------------------------ |
| `app`            | sofort                                             | sofort                  | `index.html`, Manifest, CSS und JavaScript |
| `fonts`          | sofort                                             | sofort                  | lokale Schriftarten und Material Icons     |
| `assets`         | bei Verwendung                                     | bei neuer Version vorab | Icons und Bilddateien                      |
| Firebase         | nicht durch den Angular Service Worker gespeichert | Serverzugriff           | Auth-, Firestore- und Functions-Anfragen   |

Der Service Worker wird ausschließlich im Filial- und Mitarbeiter-PWA-Build registriert, sobald die Anwendung stabil ist,
spätestens jedoch nach 30 Sekunden. Die Benutzerrolle hat keinen Einfluss auf seine Aktivierung.

## Hosting und Deployment

| Hosting-Target | Firebase-Site     | Deployment                       |
| -------------- | ----------------- | -------------------------------- |
| `office`       | `pur-office`      | `npm run deploy:pur-office`      |
| `filiale`      | `pur-filiale`     | `npm run deploy:pur-filiale`     |
| `mitarbeiter`  | `pur-mitarbeiter` | `npm run deploy:pur-mitarbeiter` |

Die Hosting-Adresse bestimmt über den dort veröffentlichten Build die technische Auslieferungsvariante. Die Benutzerrolle bestimmt
davon getrennt Navigation, Berechtigungen und Datenzugriff innerhalb der Anwendung.

Alle Hosting-Varianten liefern HTML- und direkte SPA-Routen ohne Browser-Cache aus. Manifest und Service-Worker-Steuerdateien
bleiben ebenfalls kurzfristig aktualisierbar; gehashte JavaScript- und CSS-Dateien werden langfristig und unveränderlich
gespeichert. Dadurch kann eine neue App-Version erkannt werden, ohne bestehende Versionsdateien unnötig erneut zu laden.

## Mitarbeiter-PWA

| Merkmal                     | Festgelegter Zielstand beziehungsweise aktueller Umsetzungsstand            |
| --------------------------- | --------------------------------------------------------------------------- |
| Hosting-Site                | `pur-mitarbeiter.web.app` ist im Firebase-Projekt `pur-system` reserviert   |
| Benutzerrolle               | Auth-Rolle `mitarbeiter` migriert, deployed und mit realem Konto geprüft    |
| Erlaubte App-Bereiche       | werden durch den Master im Benutzerprofil zugewiesen                        |
| App-Shell                   | eigene mobile App-Shell mit der Produktkennung „Pur Mitarbeiter“            |
| Build und Ausgabe           | `production,mitarbeiter` erzeugt `dist/pur-mitarbeiter/browser`             |
| Hosting-Target              | `mitarbeiter` ist mit der Firebase-Site `pur-mitarbeiter` verbunden         |
| Deployment                  | `npm run deploy:pur-mitarbeiter` wurde am 25.09.2026 erfolgreich ausgeführt |
| Manifest und Service Worker | Manifest „Pur Mitarbeiter“ und Angular Offline-App-Shell sind eingerichtet  |
| Veröffentlichung            | unter `https://pur-mitarbeiter.web.app` veröffentlicht                      |
| Installationsprüfung        | auf Desktop und physischem iPhone erfolgreich                               |

Die Hosting-Variante erzeugt keine zusätzliche Rollenbeschränkung. Aktive Benutzer verwenden auch in Pur Mitarbeiter die in ihrem
Profil zugewiesenen `erlaubteBereiche`. Administrative Routen bleiben unabhängig vom Hosting durch ihre vorhandenen Rollenguards
geschützt.

Die Auslieferungsvariante bestimmt nur die technische App-Oberfläche. Rolle und `erlaubteBereiche` werden in den Guards geprüft;
fachliche Datenzugriffe müssen zusätzlich durch Backend und Firestore Rules abgesichert werden. Der Mitarbeiterzugang mit Firebase
Auth ist vom fachlichen Mitarbeiterdatensatz einer Firma getrennt. Eine spätere Verknüpfung beider Datensätze, Filialzuordnungen,
Dienstplandaten, persönliche Aktionen und Push-Benachrichtigungen sind noch nicht festgelegt und werden in späteren Todos geplant.
