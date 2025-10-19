# DATA VERZEICHNIS
## NeuroGames - Datenstrukturen und Beispiele

Dieses Verzeichnis enthält Beispiel-JSON-Strukturen für die NeuroGames-Datenbank:

### Enthaltene Dateien:

#### `users_example.json`
- **Zweck:** Beispielstruktur für Benutzerdaten
- **Inhalt:** Benutzerkonten mit Spielergebnissen
- **Format:** JSON mit User-Objekten

#### `tracking_example.json`  
- **Zweck:** Beispielstruktur für User-Tracking
- **Inhalt:** Alle Benutzeraktionen mit Zeitstempel
- **Format:** JSON mit Tracking-Events

### Datenstruktur-Spezifikationen:

#### Benutzer-Objekt:
```json
{
  "id": "eindeutige_id",
  "name": "benutzername", 
  "password": "zauberwort",
  "registrationDate": "iso_zeitstempel",
  "gameResults": [array_von_ergebnissen],
  "totalGamesPlayed": number,
  "bestScore": number
}
```

#### Spielergebnis-Objekt:
```json
{
  "id": "eindeutige_id",
  "game": "spielname",
  "punkte": number,
  "uhrzeit": "iso_zeitstempel", 
  "duration": number_in_sekunden,
  "level": number
}
```

#### Tracking-Objekt:
```json
{
  "id": "eindeutige_id",
  "action": "aktionsname",
  "timestamp": "iso_zeitstempel",
  "user": "benutzername",
  "level": "ebenen_id",
  "data": {zusätzliche_daten}
}
```

### Wichtige Hinweise:

1. **Lokalspeicher:** Alle Daten werden im Browser localStorage gespeichert
2. **Format:** ISO-8601 Zeitstempel für Datumsangaben
3. **Eindeutige IDs:** Basierend auf Zeitstempel + Zufallszahl
4. **Liste 5:** Individueller Verlauf als separate, downloadbare Datei
5. **Privacy:** Tracking erfolgt lokal, keine externe Übertragung

### Für Entwickler:

- Verwende die Beispieldateien als Referenz
- Alle JSON-Strukturen sind erweiterbar
- Debug-Funktionen über Browser-Konsole verfügbar
- Export/Import-Funktionen für Liste 5 implementiert