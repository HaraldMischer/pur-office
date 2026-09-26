<!-- pur-office/docs/todo_next.md -->

# Offene Todos

## 10. Todo: Rollenbezogene hierarchische Navigation und Systemverwaltung aufteilen

### 10.1 Rollenbezogene hierarchische App-Shell-Navigation vorbereiten

#### Ziel

Die App-Shell erhält eine zentral konfigurierte, rollenbezogene Navigationsstruktur, die sowohl direkte Links als auch
ausklappbare Gruppen mit Unterpunkten unterstützt. Die sichtbare Navigation ergibt sich aus der `userRole`, den für diese Rolle
grundsätzlich vorgesehenen Navigationseinträgen und den im Benutzerprofil gespeicherten `erlaubteBereiche`. Guards bleiben die
verbindliche Zugriffskontrolle. Eine eigene Component stellt flache Navigationslisten dar, eine zweite Component übernimmt
verschachtelte Navigationen mit ausklappbaren Gruppen.

#### Betroffene Dateien

Änderungen:

- src/app/components/app-shell/app-sidenav/app-sidenav.ts
- src/app/components/app-shell/app-sidenav/app-sidenav.html
- src/app/components/app-shell/app-sidenav/app-sidenav.scss
- src/app/components/app-shell/app-sidenav/app-sidenav.spec.ts
- src/app/guards/guard-navigation.ts
- src/app/guards/guard-navigation.spec.ts

Neu hinzuzufügen:

- src/app/commons/models/app/navigation.ts
- src/app/commons/constants/navigation.constants.ts
- src/app/components/app-shell/app-sidenav/app-sidenav-flat-navigation/app-sidenav-flat-navigation.ts
- src/app/components/app-shell/app-sidenav/app-sidenav-flat-navigation/app-sidenav-flat-navigation.html
- src/app/components/app-shell/app-sidenav/app-sidenav-flat-navigation/app-sidenav-flat-navigation.scss
- src/app/components/app-shell/app-sidenav/app-sidenav-flat-navigation/app-sidenav-flat-navigation.spec.ts
- src/app/components/app-shell/app-sidenav/app-sidenav-nested-navigation/app-sidenav-nested-navigation.ts
- src/app/components/app-shell/app-sidenav/app-sidenav-nested-navigation/app-sidenav-nested-navigation.html
- src/app/components/app-shell/app-sidenav/app-sidenav-nested-navigation/app-sidenav-nested-navigation.scss
- src/app/components/app-shell/app-sidenav/app-sidenav-nested-navigation/app-sidenav-nested-navigation.spec.ts

#### Schritt 1: Navigationsmodell festlegen

- [ ] Ein typsicheres Navigationsmodell für direkte Links und nicht navigierbare Gruppen mit untergeordneten Einträgen anlegen.
- [ ] Für jede `userRole` eine eigene Navigationsstruktur und die Darstellung `flat` oder `nested` zentral konfigurieren.
- [ ] Gemeinsame Navigationseinträge ohne unnötige Duplizierung wiederverwenden.
- [ ] Routen, Labels, Material-Icons und zugehörige `TAppBereich`-Werte ausschließlich in der zentralen Konfiguration pflegen.
- [ ] Festlegen, dass die Rolle aus dem geladenen Benutzerprofil maßgeblich bleibt und nicht aus der Auslieferungsvariante
      abgeleitet wird.

#### Schritt 2: Getrennte Darstellungskomponenten umsetzen

- [ ] Die bisherige `mat-nav-list` in eine eigenständige Component für flache Navigationen überführen.
- [ ] Eine eigenständige Component für verschachtelte Navigationen mit direkten Links und ausklappbaren Gruppen anlegen.
- [ ] Beide Components über denselben Input für die bereits rollen- und bereichsbezogen gefilterten Navigationseinträge
      anbinden.
- [ ] Beide Components über denselben Output über die Auswahl eines Navigationslinks informieren lassen.
- [ ] Gruppen über einen eindeutig beschrifteten Schalter auf- und zuklappbar machen und untergeordnete Routen visuell
      einrücken.
- [ ] Gruppen ohne sichtbare Unterpunkte vollständig ausblenden.
- [ ] Aktive Unterrouten hervorheben und ihre übergeordnete Gruppe beim direkten Seitenaufruf automatisch öffnen.
- [ ] Auf kleinen Bildschirmen die Sidebar erst nach Auswahl eines Links schließen; das Öffnen einer Gruppe schließt sie nicht.

#### Schritt 3: Rollenbezogene Darstellung in der App-Shell auswählen

- [ ] In `AppSidenav` anhand der Navigationskonfiguration der aktiven `userRole` zwischen flacher und verschachtelter Component
      wählen.
- [ ] Nur Links an die Darstellungskomponente übergeben, die sowohl in der Navigationsstruktur der Rolle als auch in
      `erlaubteBereiche` enthalten sind.
- [ ] Benutzerkarte, Produkttitel und das Schließen der Sidebar auf kleinen Bildschirmen weiterhin zentral in `AppSidenav`
      koordinieren.
- [ ] Verhindern, dass die beiden Darstellungskomponenten eigene Rollen- oder Berechtigungslogik duplizieren.

#### Schritt 4: Navigation und Ausweichrouten konsistent halten

- [ ] Die Ermittlung erreichbarer Start- und Ausweichrouten an dieselbe Rollen- und Bereichslogik anbinden.
- [ ] Verhindern, dass ein Navigationseintrag sichtbar wird, dessen Route für die jeweilige Rolle nicht erreichbar ist.
- [ ] Die Rollen- und Bereichsprüfung weiterhin durch die vorhandenen Routenguards absichern.

#### Tests und Abschluss

- [ ] Die flache Navigation isoliert auf Links, aktiven Zustand und Auswahlereignis testen.
- [ ] Die verschachtelte Navigation isoliert auf direkte Links, Gruppen, Unterpunkte und Auswahlereignis testen.
- [ ] In `AppSidenav` die Auswahl der richtigen Darstellung für alle vier Rollen sowie erlaubte und nicht erlaubte Bereiche
      testen.
- [ ] Auf- und Zuklappen, automatische Öffnung bei aktiver Unterroute, ausgeblendete leere Gruppen und das Verhalten auf kleinen
      Bildschirmen prüfen.
- [ ] Guard-Tests für rollenbezogene Start- und Ausweichrouten aktualisieren.
- [ ] Navigation mit Tastatur, sichtbarem Fokus und geeigneten zugänglichen Bezeichnungen manuell prüfen.
- [ ] `projekt-plan.md` und `projekt-stand.md` nach der Umsetzung aktualisieren.
- [ ] `npm test` und `npm run build` erfolgreich ausführen.

#### Erledigt, wenn

- [ ] Jede Benutzerrolle verwendet eine eigene zentral definierte Navigationsstruktur.
- [ ] Rollen mit flacher Navigation verwenden die dafür vorgesehene Component.
- [ ] Rollen mit direkten Links und ausklappbaren Gruppen verwenden die verschachtelte Navigations-Component.
- [ ] `AppSidenav` wählt die Darstellung rollenbezogen aus, ohne Rollen- oder Berechtigungslogik in den
      Darstellungskomponenten zu duplizieren.
- [ ] Sichtbare Navigation, erlaubte Bereiche und Routenguards führen nicht zu widersprüchlichen Zugriffsergebnissen.
- [ ] Automatisierte Tests und die manuelle Bedienprüfung sind erfolgreich.

### 10.2 Systemverwaltung in zwei Unterseiten aufteilen

#### Ziel

Der bisherige lange Bereich `Systemverwaltung` wird in der Sidebar als ausklappbare Gruppe dargestellt. Die Gruppe enthält die
Unterpunkte `Datenstruktur anlegen` und `Benutzerverwaltung`. Die Benutzerverwaltung bündelt weiterhin die Anlage neuer Benutzer
und die Bearbeitung vorhandener Benutzerprofile. Beide Unterseiten verwenden zunächst gemeinsam den bestehenden
Bereichsschlüssel `systemverwaltung` und bleiben ausschließlich für aktive Master erreichbar.

#### Betroffene Dateien

Änderungen:

- src/app/app.routes.ts
- src/app/app.routes.spec.ts
- src/app/components/app-shell/app-sidenav/app-sidenav.spec.ts
- src/app/commons/constants/navigation.constants.ts
- src/app/guards/guard-navigation.ts
- src/app/guards/guard-navigation.spec.ts

Neu hinzuzufügen:

- src/app/pages/systemverwaltung-page/benutzer-page/benutzer-page.ts
- src/app/pages/systemverwaltung-page/benutzer-page/benutzer-page.html
- src/app/pages/systemverwaltung-page/benutzer-page/benutzer-page.scss
- src/app/pages/systemverwaltung-page/benutzer-page/benutzer-page.spec.ts

Zu löschen:

- src/app/pages/systemverwaltung-page/systemverwaltung-page.ts
- src/app/pages/systemverwaltung-page/systemverwaltung-page.html
- src/app/pages/systemverwaltung-page/systemverwaltung-page.scss
- src/app/pages/systemverwaltung-page/systemverwaltung-page.spec.ts

#### Schritt 1: Unterrouten festlegen

- [ ] `systemverwaltung` als komponentenlosen Elternpfad mit untergeordneten Routen konfigurieren.
- [ ] Die Unterroute `/systemverwaltung/datenstruktur` für die bestehende Datenstruktur-Anlage einrichten.
- [ ] Die Unterroute `/systemverwaltung/benutzer` für Benutzeranlage und Benutzerverwaltung einrichten.
- [ ] `/systemverwaltung` auf `/systemverwaltung/datenstruktur` weiterleiten, damit bestehende Aufrufe ein eindeutiges Ziel haben.
- [ ] Beide Unterrouten mit Bereichs- und Masterprüfung schützen und direkte Aufrufe ohne Berechtigung sicher umleiten.

#### Schritt 2: Seiten fachlich trennen

- [ ] Die Datenstruktur-Anlage als eigenständigen Seiteninhalt unter ihrer Unterroute darstellen.
- [ ] Eine `BenutzerPage` anlegen, die `Benutzer anlegen` und `Benutzer verwalten` in dieser Reihenfolge bündelt.
- [ ] Die nicht mehr benötigte `SystemverwaltungPage` einschließlich Template, Styles und Spec entfernen.
- [ ] Seitentitel, Toolbar-Titel und Überschriften an die jeweils geöffnete Unterseite anpassen.
- [ ] Die bestehende Formular-, Store- und Service-Logik ohne fachliche Verhaltensänderung weiterverwenden.

#### Schritt 3: Systemverwaltung in die hierarchische Navigation aufnehmen

- [ ] `Systemverwaltung` in der Master-Navigation als nicht navigierbare, ausklappbare Gruppe konfigurieren.
- [ ] `Datenstruktur anlegen` und `Benutzerverwaltung` als untergeordnete Navigationslinks aufnehmen.
- [ ] Die Gruppe bei einer aktiven Systemverwaltungs-Unterroute automatisch geöffnet darstellen.
- [ ] Für andere Rollen weder die Gruppe noch ihre Unterpunkte anzeigen.

#### Tests und Abschluss

- [ ] Routing-Tests für Weiterleitung, direkte Unterrouten und Master-Schutz ergänzen.
- [ ] Component-Tests für die getrennten Seiten und die weiterhin eingebundenen Fachkomponenten ergänzen beziehungsweise
      anpassen.
- [ ] Sidebar-Tests für Gruppenschalter, Unterpunkte, aktiven Zustand und rollenabhängige Sichtbarkeit ergänzen.
- [ ] Beide Unterseiten auf Desktop und einem kleinen Viewport manuell prüfen.
- [ ] `projekt-plan.md` und `projekt-stand.md` nach der Umsetzung aktualisieren.
- [ ] `npm test` und `npm run build` erfolgreich ausführen.

#### Erledigt, wenn

- [ ] `Systemverwaltung` lässt sich in der Master-Sidebar auf- und zuklappen.
- [ ] Datenstruktur-Anlage und Benutzerverwaltung sind über eigene, direkt aufrufbare Unterrouten erreichbar.
- [ ] Benutzeranlage und Bearbeitung vorhandener Benutzerprofile bleiben gemeinsam auf der Benutzerverwaltungsseite verfügbar.
- [ ] Nicht berechtigte Rollen sehen keine Systemverwaltungsnavigation und können keine der Unterrouten öffnen.
- [ ] Automatisierte Tests, Build und manuelle Bedienprüfung sind erfolgreich.
