# NeuroGames Data Structure Documentation

## Overview
This document describes the data structures used in NeuroGames for storing user information, game results, and application state.

## User Data Structure

### Main User Object
The primary user object stored in localStorage contains all user-related information:

```javascript
{
  // Basic User Information
  "name": string,              // Username (unique identifier)
  "email": string,             // User email address
  "passwordHash": string,      // Hashed password for authentication
  "registrationDate": string,  // ISO timestamp of registration
  "lastLogin": string,         // ISO timestamp of last login
  
  // Game Statistics
  "totalGamesPlayed": number,  // Total number of games completed
  "totalScore": number,        // Cumulative score across all games
  
  // Detailed Game Results
  "gameResults": [GameResult], // Array of individual game results
  
  // User Preferences
  "preferences": UserPreferences,
  
  // Calculated Statistics
  "statistics": UserStatistics
}
```

### Game Result Structure
Each game session creates a result object with detailed metrics:

```javascript
{
  "game": string,          // Game name (e.g., "Erd Addition")
  "modus": string,         // Difficulty mode (Anfänger, Fortgeschritten, etc.)
  "punkte": number,        // Points scored in the game
  "zeit": number,          // Time played in seconds
  "richtige": number,      // Number of correct answers
  "falsche": number,       // Number of incorrect answers
  "level": number,         // Highest level reached
  "genauigkeit": number,   // Accuracy percentage (0-100)
  "maxStreak": number,     // Longest streak of correct answers
  "datum": string          // ISO timestamp when game was completed
}
```

### User Preferences Structure
Customizable settings for the user experience:

```javascript
{
  "theme": string,              // UI theme preference
  "soundEnabled": boolean,      // Enable/disable sound effects
  "animationsEnabled": boolean, // Enable/disable animations
  "autoExportEnabled": boolean  // Automatic data export
}
```

### User Statistics Structure
Calculated statistics for performance analysis:

```javascript
{
  "averageAccuracy": number,        // Overall accuracy percentage
  "bestScore": number,              // Highest score achieved
  "totalCorrectAnswers": number,    // Cumulative correct answers
  "totalWrongAnswers": number,      // Cumulative incorrect answers
  "averageGameDuration": number,    // Average time per game
  "favoriteGameMode": string,       // Most played game mode
  "playTimeByDay": {               // Play time distribution
    "monday": number,
    "tuesday": number,
    // ... etc for all days
  }
}
```

## Achievement System

### Achievement Object
Tracks unlocked achievements and milestones:

```javascript
{
  "id": string,           // Unique achievement identifier
  "name": string,         // Display name
  "description": string,  // Achievement description
  "unlockedDate": string, // ISO timestamp when unlocked
  "progress": number      // Progress towards achievement (0-100)
}
```

### Standard Achievements
- **first-game**: Complete your first game
- **score-100**: Score 100+ points in a single game
- **streak-10**: Achieve a streak of 10 correct answers
- **daily-player**: Play games 7 days in a row
- **accuracy-95**: Achieve 95%+ accuracy in a game
- **speed-demon**: Complete a game in under 30 seconds

## localStorage Keys

### Primary Storage Keys
- `neurogames_users`: Array of all registered users
- `neurogames_current_user`: Currently logged-in user data
- `neurogames_settings`: Application-wide settings
- `neurogames_suggestions`: Community suggestions
- `neurogames_votes`: Survey votes and preferences

### Session Storage Keys
- `neurogames_session`: Current session information
- `neurogames_temp_data`: Temporary game state data

## Data Export Formats

### JSON Export
Complete user data in JSON format, suitable for backup and data analysis.

### CSV Export
Tabular format with game results, compatible with spreadsheet applications:
```csv
Datum,Spiel,Modus,Punkte,Zeit,Level,Genauigkeit,Richtige,Falsche,MaxStreak
```

### TXT Export
Human-readable text report with statistics and game history.

### HTML Export
Interactive web page with styled statistics and charts.

## Data Validation

### Input Validation Rules
- **Username**: 3-20 characters, alphanumeric and underscore only
- **Email**: Valid email format with @ symbol
- **Password**: Minimum 8 characters, mix of letters, numbers, symbols
- **Scores**: Non-negative integers
- **Time**: Positive numbers in seconds
- **Accuracy**: Percentage between 0-100

### Data Integrity Checks
- Timestamp validation for chronological order
- Score calculation verification
- Achievement prerequisite validation
- Export data completeness checks

## Performance Considerations

### Storage Optimization
- Compress large datasets before storage
- Remove redundant or outdated data
- Implement data archiving for old results

### Memory Management
- Lazy load historical data
- Cache frequently accessed statistics
- Minimize deep object cloning

## Security & Privacy

### Data Protection
- Password hashing using secure algorithms
- Local storage encryption for sensitive data
- No transmission of personal data to external servers
- User consent for data collection and processing

### GDPR Compliance
- Right to data portability (export functionality)
- Right to erasure (account deletion)
- Data minimization principles
- Transparent data usage policies

## Migration & Versioning

### Data Migration Strategy
When updating data structures:
1. Check data version compatibility
2. Migrate old format to new format
3. Preserve user data integrity
4. Provide fallback for failed migrations

### Version Compatibility
- Backward compatibility for at least 2 versions
- Migration scripts for major structure changes
- User notification for breaking changes

## Error Handling

### Common Data Errors
- Corrupted localStorage data
- Invalid JSON parsing
- Missing required fields
- Type mismatches

### Recovery Strategies
- Data validation with fallbacks
- Automatic data repair where possible
- User-friendly error messages
- Data backup and restore options

---

*This documentation is maintained alongside the NeuroGames application and updated with each major release.*