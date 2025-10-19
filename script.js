/* ====================================
   NEUROGAMES - JAVASCRIPT HAUPTDATEI
   Modulare Funktionen mit Tracking
   ==================================== */

// Globale Variablen für Anwendungszustand
let currentUser = null; // Aktuell eingeloggter Benutzer
let userTrackingData = []; // Array für User-Tracking
let currentLevel = 'level-1'; // Aktuelle Ebene

// Lokalspeicher-Schlüssel für Datenpersistierung
const STORAGE_KEYS = {
    users: 'neurogames_users',
    currentUser: 'neurogames_current_user',
    tracking: 'neurogames_tracking',
    gameResults: 'neurogames_results'
};

/* ====================================
   INITIALISIERUNG BEIM SEITENAUFRUF
   ==================================== */

// Wird ausgeführt, sobald die Seite vollständig geladen ist
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧠 NeuroGames wird initialisiert...');
    
    // Stelle sicher, dass alle Funktionen global verfügbar sind
    window.showLevel = showLevel;
    window.logout = logout;
    window.togglePassword = togglePassword;
    window.showQuestManager = showQuestManager;
    window.showDashboardCustomizer = showDashboardCustomizer;
    window.startGame = startGame;
    window.showSettings = showSettings;
    window.showProgressOverview = showProgressOverview;
    
    // Prüfe, ob Benutzer bereits eingeloggt ist
    checkUserLogin();
    
    // Initialisiere Event-Listener für Formulare
    initializeFormListeners();
    
    // Initialisiere Vorschläge-System Event-Listener
    initializeSuggestionsListeners();
    
    // Starte User-Tracking System
    initializeUserTracking();
    
    // Initialisiere UI-Effekte und Animationen
    setTimeout(initializeUIEffects, 500);
    
    // Zusätzliche Fallback Event-Listener für Buttons
    initializeClickListeners();
    
    console.log('✅ NeuroGames erfolgreich initialisiert');
    console.log('🔧 Funktionen global verfügbar gemacht');
});

/* ====================================
   BENUTZER-VERWALTUNG FUNKTIONEN
   ==================================== */

// Prüft, ob ein Benutzer bereits eingeloggt ist
function checkUserLogin() {
    console.log('🔍 Prüfe bestehende Anmeldung...');
    
    // Lade gespeicherte Benutzerdaten aus dem Lokalspeicher
    const savedUser = localStorage.getItem(STORAGE_KEYS.currentUser);
    
    // Zunächst alle Ebenen verstecken und Level 1 als Standardwert anzeigen
    const allLevels = document.querySelectorAll('.game-level');
    allLevels.forEach(level => {
        level.classList.remove('active');
        level.classList.add('hidden');
    });
    
    if (savedUser) {
        // Benutzer ist bereits eingeloggt
        currentUser = JSON.parse(savedUser);
        console.log(`👋 Willkommen zurück, ${currentUser.name}!`);
        
        // Zeige Hauptmenü anstatt Login-Seite
        showLevel('level-3');
        updateUserDisplay();
        
        // Tracking: Automatischer Login
        trackUserAction('auto_login', { username: currentUser.name });
    } else {
        console.log('👤 Kein eingeloggter Benutzer gefunden');
        // Zeige Login/Registrierung-Seite
        showLevel('level-1');
    }
}

// Registriert einen neuen Benutzer
function registerUser(name, password) {
    console.log(`📝 Registriere neuen Benutzer: ${name}`);
    
    // Lade bestehende Benutzer aus dem Lokalspeicher
    let users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users)) || [];
    
    // Prüfe, ob Benutzername bereits existiert
    const existingUser = users.find(user => user.name.toLowerCase() === name.toLowerCase());
    if (existingUser) {
        alert('❌ Dieser Name ist bereits vergeben. Bitte wähle einen anderen Namen.');
        return false;
    }
    
    // Erstelle neuen Benutzer-Datensatz
    const newUser = {
        id: Date.now(), // Eindeutige ID basierend auf Zeitstempel
        name: name,
        password: password, // In echten Anwendungen würde das Passwort verschlüsselt
        registrationDate: new Date().toISOString(),
        gameResults: [], // Array für Spielergebnisse
        totalGamesPlayed: 0,
        bestScore: 0
    };
    
    // Füge neuen Benutzer zur Liste hinzu
    users.push(newUser);
    
    // Speichere aktualisierte Benutzerliste
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
    
    // Setze als aktuellen Benutzer
    currentUser = newUser;
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser));
    
    // Tracking: Erfolgreiche Registrierung
    trackUserAction('user_registered', { username: name });
    
    console.log(`✅ Benutzer ${name} erfolgreich registriert`);
    return true;
}

// Meldet einen Benutzer an
function loginUser(name, password) {
    console.log(`🔑 Login-Versuch für Benutzer: ${name}`);
    
    // Lade Benutzerliste aus dem Lokalspeicher
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users)) || [];
    
    // Suche Benutzer mit passendem Namen und Passwort
    const user = users.find(u => 
        u.name.toLowerCase() === name.toLowerCase() && 
        u.password === password
    );
    
    if (user) {
        // Login erfolgreich
        currentUser = user;
        localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser));
        
        // Tracking: Erfolgreicher Login
        trackUserAction('user_login', { username: name });
        
        console.log(`✅ Login erfolgreich für ${name}`);
        return true;
    } else {
        // Login fehlgeschlagen
        console.log(`❌ Login fehlgeschlagen für ${name}`);
        
        // Tracking: Fehlgeschlagener Login
        trackUserAction('login_failed', { username: name });
        
        alert('❌ Name oder Zauberwort falsch. Bitte versuche es erneut.');
        return false;
    }
}

// Meldet den aktuellen Benutzer ab
function logout() {
    console.log(`👋 ${currentUser?.name} wird abgemeldet...`);
    
    // Tracking: Logout
    if (currentUser) {
        trackUserAction('user_logout', { username: currentUser.name });
    }
    
    // Lösche aktuelle Sitzung
    currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    
    // Kehre zur Login-Seite zurück
    showLevel('level-1');
    
    console.log('✅ Erfolgreich abgemeldet');
}

/* ====================================
   NAVIGATION UND EBENEN-VERWALTUNG
   ==================================== */

// Zeigt eine bestimmte Ebene an und versteckt alle anderen
function showLevel(levelId) {
    console.log(`🎯 Wechsle zu Ebene: ${levelId}`);
    
    // Tracking: Navigation zwischen Ebenen
    trackUserAction('navigate_to_level', { 
        from: currentLevel, 
        to: levelId,
        username: currentUser?.name 
    });
    
    // Verstecke alle Ebenen sofort
    const allLevels = document.querySelectorAll('.game-level');
    allLevels.forEach(level => {
        level.classList.remove('active', 'fade-in', 'fade-out');
        level.classList.add('hidden');
    });
    
    // Zeige gewünschte Ebene sofort
    const targetLevel = document.getElementById(levelId);
    if (targetLevel) {
        targetLevel.classList.remove('hidden');
        targetLevel.classList.add('active', 'fade-in');
        currentLevel = levelId;
        
        // Entferne Fade-In Klasse nach Animation
        setTimeout(() => {
            targetLevel.classList.remove('fade-in');
        }, 500);
        
        // Aktualisiere Benutzeranzeige falls auf Hauptmenü
        if (levelId === 'level-3') {
            updateUserDisplay();
            
            // Starte Dashboard-Animationen
            setTimeout(() => {
                animateQuestProgress();
                animateStatCounters();
            }, 500);
        }
        
        // Spezielle Animationen für Ebene 1
        if (levelId === 'level-1') {
            triggerWelcomeAnimations();
        }
        
        // Spielbereich-Initialisierung
        if (levelId === 'level-3a') {
            updateGamesStats();
            setTimeout(animateStatCounters, 300);
        }
        
        // Vorschläge-System Initialisierung
        if (levelId === 'level-3a1') {
            showSuggestionTab('text-suggestions');
        }
        
        // Archiv-System Initialisierung
        if (levelId === 'level-5') {
            showArchiveTab('overview');
        }
    } else {
        console.error(`❌ Ebene ${levelId} nicht gefunden`);
    }
}

// Aktualisiert die Benutzeranzeige im Hauptmenü
function updateUserDisplay() {
    const userNameDisplay = document.getElementById('user-name-display');
    if (userNameDisplay && currentUser) {
        userNameDisplay.textContent = currentUser.name;
        console.log(`👤 Benutzeranzeige aktualisiert: ${currentUser.name}`);
        
        // Aktualisiere Dashboard-Statistiken
        updateDashboardStats();
    }
}

// Aktualisiert alle Dashboard-Statistiken
function updateDashboardStats() {
    if (!currentUser) return;
    
    console.log('📊 Aktualisiere Dashboard-Statistiken...');
    
    // Spiele-Statistiken
    const gamesPlayedElement = document.getElementById('games-played');
    if (gamesPlayedElement) {
        gamesPlayedElement.textContent = currentUser.totalGamesPlayed || 0;
    }
    
    // Bester Score
    const bestScoreElement = document.getElementById('best-score');
    if (bestScoreElement) {
        bestScoreElement.textContent = currentUser.bestScore || 0;
    }
    
    // Gesamte Ergebnisse
    const totalResultsElement = document.getElementById('total-results');
    if (totalResultsElement && currentUser.gameResults) {
        totalResultsElement.textContent = `${currentUser.gameResults.length} Ergebnisse`;
    }
    
    // Letzte Aktivität
    const lastActivityElement = document.getElementById('last-activity');
    if (lastActivityElement) {
        const lastActivity = getLastActivity();
        lastActivityElement.textContent = lastActivity;
    }
    
    // Daily Streak (simuliert)
    const dailyStreakElement = document.getElementById('daily-streak');
    if (dailyStreakElement) {
        const streak = calculateDailyStreak();
        dailyStreakElement.textContent = `${streak} Tage`;
    }
    
    console.log('✅ Dashboard-Statistiken aktualisiert');
}

// Berechnet die letzte Aktivität
function getLastActivity() {
    if (!currentUser || !currentUser.gameResults || currentUser.gameResults.length === 0) {
        return 'Noch keine Aktivität';
    }
    
    // Letztes Spielergebnis finden
    const lastResult = currentUser.gameResults[currentUser.gameResults.length - 1];
    const lastDate = new Date(lastResult.uhrzeit);
    const now = new Date();
    const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Heute';
    if (diffDays === 1) return 'Gestern';
    if (diffDays < 7) return `Vor ${diffDays} Tagen`;
    return lastDate.toLocaleDateString('de-DE');
}

// Berechnet Daily Streak (vereinfacht)
function calculateDailyStreak() {
    // Vereinfachte Streak-Berechnung - in echter App würde das komplexer sein
    const streakData = localStorage.getItem('neurogames_streak') || '5';
    return parseInt(streakData);
}

// Quest-Manager anzeigen (Platzhalter)
function showQuestManager() {
    console.log('📋 Quest-Manager öffnen...');
    
    // Tracking: Quest-Manager geöffnet
    trackUserAction('quest_manager_opened', { 
        username: currentUser?.name 
    });
    
    // Placeholder - hier würde ein Quest-Manager Modal/Page geöffnet
    alert('🚧 Quest-Manager wird bald verfügbar sein!\n\nHier kannst du:\n• Neue Quests erstellen\n• Deadlines setzen\n• Fortschritt verfolgen\n• Eigene Ziele definieren');
}

// Dashboard Customizer anzeigen (Platzhalter)
function showDashboardCustomizer() {
    console.log('🎨 Dashboard-Customizer öffnen...');
    
    // Tracking: Customizer geöffnet
    trackUserAction('dashboard_customizer_opened', { 
        username: currentUser?.name 
    });
    
    // Placeholder für Dashboard-Anpassungen
    alert('🎨 Dashboard-Anpassung wird bald verfügbar sein!\n\nGeplante Features:\n• Module verschieben\n• Module ein-/ausblenden\n• Farbthemen wählen\n• Layout anpassen');
}

// Fortschritts-Übersicht anzeigen (Platzhalter)
function showProgressOverview() {
    console.log('📈 Fortschritts-Übersicht öffnen...');
    
    // Tracking: Fortschritt angezeigt
    trackUserAction('progress_overview_opened', { 
        username: currentUser?.name 
    });
    
    // Placeholder für detaillierte Fortschrittsanzeige
    alert('📈 Detaillierte Fortschritts-Übersicht wird bald verfügbar sein!\n\nGeplante Features:\n• Lernkurven\n• Achievements\n• Vergleiche\n• Zielstellungen');
}

// Einstellungen anzeigen (Platzhalter)
function showSettings() {
    console.log('⚙️ Einstellungen öffnen...');
    
    // Tracking: Einstellungen geöffnet
    trackUserAction('settings_opened', { 
        username: currentUser?.name 
    });
    
    // Placeholder für Einstellungsseite
    alert('⚙️ Einstellungen werden bald verfügbar sein!\n\nGeplante Optionen:\n• Profil bearbeiten\n• Benachrichtigungen\n• Datenschutz\n• Export/Import');
}

// Animiert Quest-Progress-Bars
function animateQuestProgress() {
    const progressBars = document.querySelectorAll('.progress-fill');
    
    progressBars.forEach((bar, index) => {
        setTimeout(() => {
            const targetWidth = bar.style.width;
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 100);
        }, index * 200);
    });
}

// Animiert Statistik-Counter
function animateStatCounters() {
    const statValues = document.querySelectorAll('.stat-value');
    
    statValues.forEach(element => {
        const targetValue = parseInt(element.textContent);
        let currentValue = 0;
        const increment = Math.ceil(targetValue / 20);
        
        const counter = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
                clearInterval(counter);
            }
            element.textContent = currentValue;
        }, 50);
    });
}

/* ====================================
   SPIELBEREICH FUNKTIONEN (EBENE 3A)
   ==================================== */

// Startet ein Spiel
function startGame(gameId) {
    console.log(`🎮 Starte Spiel: ${gameId}`);
    
    // Tracking: Spiel-Start
    trackUserAction('game_start_attempt', { 
        gameId: gameId,
        username: currentUser?.name 
    });
    
    switch(gameId) {
        case 'erd-addition':
            // Navigiere zum Erd Addition Spiel (Ebene 4)
            showLevel('level-4');
            break;
            
        case 'memory-challenge':
        case 'quiz-master':
            // Placeholder für zukünftige Spiele
            alert(`🚧 ${gameId} wird bald verfügbar sein!\n\nDas Spiel ist noch in Entwicklung und wird in einem zukünftigen Update freigeschaltet.`);
            break;
            
        default:
            console.error(`❌ Unbekanntes Spiel: ${gameId}`);
    }
}

// Aktualisiert Spielbereich-Statistiken
function updateGamesStats() {
    if (!currentUser) return;
    
    console.log('🎮 Aktualisiere Spielbereich-Statistiken...');
    
    // Gesamte gespielte Runden
    const totalGamesElement = document.getElementById('total-games-played');
    if (totalGamesElement) {
        totalGamesElement.textContent = currentUser.totalGamesPlayed || 0;
    }
    
    // Durchschnittlicher Score
    const averageScoreElement = document.getElementById('average-score');
    if (averageScoreElement && currentUser.gameResults && currentUser.gameResults.length > 0) {
        const totalScore = currentUser.gameResults.reduce((sum, result) => sum + result.punkte, 0);
        const averageScore = Math.round(totalScore / currentUser.gameResults.length);
        averageScoreElement.textContent = averageScore;
    }
    
    // Erd Addition spezifische Stats
    updateErdAdditionStats();
    
    console.log('✅ Spielbereich-Statistiken aktualisiert');
}

// Aktualisiert Erd Addition spezifische Statistiken
function updateErdAdditionStats() {
    if (!currentUser || !currentUser.gameResults) return;
    
    // Filtere Erd Addition Ergebnisse
    const erdResults = currentUser.gameResults.filter(result => 
        result.game === 'Erd Addition' || result.game === 'erd-addition'
    );
    
    // Bester Score
    const erdBestScoreElement = document.getElementById('erd-best-score');
    if (erdBestScoreElement) {
        const bestScore = erdResults.length > 0 
            ? Math.max(...erdResults.map(r => r.punkte))
            : 0;
        erdBestScoreElement.textContent = bestScore;
    }
    
    // Anzahl gespielt
    const erdPlayCountElement = document.getElementById('erd-play-count');
    if (erdPlayCountElement) {
        erdPlayCountElement.textContent = `${erdResults.length}x`;
    }
    
    // Fortschritt (simuliert basierend auf gespielten Runden)
    const erdProgressElement = document.getElementById('erd-progress');
    if (erdProgressElement) {
        const level = Math.min(Math.floor(erdResults.length / 3) + 1, 10);
        const progressInLevel = (erdResults.length % 3) * 33.33;
        erdProgressElement.style.width = `${progressInLevel}%`;
        
        const progressTextElement = erdProgressElement.parentElement.nextElementSibling;
        if (progressTextElement) {
            progressTextElement.textContent = `Level ${level} - ${Math.round(progressInLevel)}%`;
        }
    }
}

/* ====================================
   VORSCHLÄGE-SYSTEM FUNKTIONEN (EBENE 3A1)
   ==================================== */

// Zeigt einen bestimmten Vorschläge-Tab
function showSuggestionTab(tabId) {
    console.log(`📋 Wechsle zu Vorschläge-Tab: ${tabId}`);
    
    // Tracking: Tab-Wechsel
    trackUserAction('suggestion_tab_changed', { 
        tabId: tabId,
        username: currentUser?.name 
    });
    
    // Alle Tabs deaktivieren
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Aktiven Tab aktivieren
    const activeButton = document.querySelector(`.tab-button[onclick*="${tabId}"]`);
    const activeContent = document.getElementById(`${tabId}-tab`);
    
    if (activeButton && activeContent) {
        activeButton.classList.add('active');
        activeContent.classList.add('active');
    }
}

// Initialisiert Event-Listener für Vorschläge-System
function initializeSuggestionsListeners() {
    console.log('💡 Initialisiere Vorschläge-System Event-Listener...');
    
    // Text-Vorschlag Formular
    const textForm = document.getElementById('text-suggestion-form');
    if (textForm) {
        textForm.addEventListener('submit', handleTextSuggestionSubmit);
    }
    
    // Zeichen-Counter für Textarea
    const suggestionTextarea = document.getElementById('suggestion-text');
    const charCounter = document.getElementById('char-count');
    if (suggestionTextarea && charCounter) {
        suggestionTextarea.addEventListener('input', function() {
            charCounter.textContent = this.value.length;
            
            // Warnung bei zu vielen Zeichen
            if (this.value.length > 900) {
                charCounter.style.color = '#dc3545';
            } else {
                charCounter.style.color = '#6c757d';
            }
        });
    }
    
    // Datei-Upload Event-Listener
    initializeFileUploadListeners();
    
    console.log('✅ Vorschläge-System Event-Listener aktiviert');
}

// Text-Vorschlag Formular Handler
function handleTextSuggestionSubmit(event) {
    event.preventDefault();
    
    console.log('📝 Text-Vorschlag wird eingereicht...');
    
    const title = document.getElementById('suggestion-title').value.trim();
    const category = document.getElementById('suggestion-category').value;
    const text = document.getElementById('suggestion-text').value.trim();
    
    // Validierung
    if (!title || !category || !text) {
        alert('❌ Bitte fülle alle Felder aus.');
        return;
    }
    
    if (text.length < 10) {
        alert('❌ Der Vorschlag muss mindestens 10 Zeichen haben.');
        return;
    }
    
    // Erstelle Vorschlag-Objekt
    const suggestion = {
        id: Date.now().toString(),
        type: 'text',
        title: title,
        category: category,
        content: text,
        author: currentUser?.name || 'Anonym',
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    // Speichere Vorschlag
    saveSuggestion(suggestion);
    
    // Tracking: Vorschlag eingereicht
    trackUserAction('text_suggestion_submitted', { 
        suggestionId: suggestion.id,
        category: category,
        username: currentUser?.name 
    });
    
    // Erfolgsmeldung
    alert('🎉 Vielen Dank für deinen Vorschlag!\n\nDein Vorschlag wurde erfolgreich eingereicht und wird von unserem Team geprüft.');
    
    // Formular zurücksetzen
    document.getElementById('text-suggestion-form').reset();
    document.getElementById('char-count').textContent = '0';
}

// Speichert einen Vorschlag im lokalen Speicher
function saveSuggestion(suggestion) {
    const suggestions = JSON.parse(localStorage.getItem('neurogames_suggestions')) || [];
    suggestions.push(suggestion);
    localStorage.setItem('neurogames_suggestions', JSON.stringify(suggestions));
    
    console.log(`💾 Vorschlag gespeichert: ${suggestion.id}`);
}

// Initialisiert Datei-Upload Event-Listener
function initializeFileUploadListeners() {
    // Einzelne Datei Upload
    const fileUploadArea = document.getElementById('file-upload-area');
    const fileInput = document.getElementById('file-input');
    
    if (fileUploadArea && fileInput) {
        fileUploadArea.addEventListener('click', () => fileInput.click());
        fileUploadArea.addEventListener('dragover', handleDragOver);
        fileUploadArea.addEventListener('drop', handleFileDrop);
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // Ordner Upload
    const folderUploadArea = document.getElementById('folder-upload-area');
    const folderInput = document.getElementById('folder-input');
    
    if (folderUploadArea && folderInput) {
        folderUploadArea.addEventListener('click', () => folderInput.click());
        folderUploadArea.addEventListener('dragover', handleDragOver);
        folderUploadArea.addEventListener('drop', handleFolderDrop);
        folderInput.addEventListener('change', handleFolderSelect);
    }
}

// Drag & Drop Event Handler
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.style.borderColor = '#4CAF50';
    event.currentTarget.style.background = 'rgba(76, 175, 80, 0.1)';
}

function handleFileDrop(event) {
    event.preventDefault();
    event.currentTarget.style.borderColor = '#dee2e6';
    event.currentTarget.style.background = '#f8f9fa';
    
    const files = event.dataTransfer.files;
    handleFileUpload(files);
}

function handleFolderDrop(event) {
    event.preventDefault();
    event.currentTarget.style.borderColor = '#dee2e6';
    event.currentTarget.style.background = '#f8f9fa';
    
    const files = event.dataTransfer.files;
    handleFolderUpload(files);
}

function handleFileSelect(event) {
    handleFileUpload(event.target.files);
}

function handleFolderSelect(event) {
    handleFolderUpload(event.target.files);
}

// Datei-Upload Handler
function handleFileUpload(files) {
    console.log(`📁 ${files.length} Datei(en) zum Upload ausgewählt`);
    
    // Tracking: Datei-Upload
    trackUserAction('file_upload_attempt', { 
        fileCount: files.length,
        username: currentUser?.name 
    });
    
    // Placeholder für echten Upload
    alert(`📁 Datei-Upload wird bald verfügbar sein!\n\n${files.length} Datei(en) ausgewählt:\n${Array.from(files).map(f => f.name).join('\n')}\n\nFeature wird in einem zukünftigen Update implementiert.`);
}

// Ordner-Upload Handler
function handleFolderUpload(files) {
    console.log(`📂 Ordner mit ${files.length} Dateien zum Upload ausgewählt`);
    
    // Tracking: Ordner-Upload
    trackUserAction('folder_upload_attempt', { 
        fileCount: files.length,
        username: currentUser?.name 
    });
    
    // Placeholder für echten Upload
    alert(`📂 Ordner-Upload wird bald verfügbar sein!\n\nOrdner mit ${files.length} Dateien ausgewählt.\n\nFeature wird in einem zukünftigen Update implementiert.`);
}

// Umfrage-Abstimmung Handler
function submitVote(surveyId) {
    const selectedOption = document.querySelector(`input[name="${surveyId}"]:checked`);
    
    if (!selectedOption) {
        alert('❌ Bitte wähle eine Option aus.');
        return;
    }
    
    console.log(`📊 Abstimmung für ${surveyId}: ${selectedOption.value}`);
    
    // Tracking: Umfrage-Teilnahme
    trackUserAction('survey_vote_submitted', { 
        surveyId: surveyId,
        vote: selectedOption.value,
        username: currentUser?.name 
    });
    
    // Speichere Abstimmung (vereinfacht)
    const votes = JSON.parse(localStorage.getItem('neurogames_votes')) || {};
    votes[surveyId] = selectedOption.value;
    localStorage.setItem('neurogames_votes', JSON.stringify(votes));
    
    // Erfolgsmeldung
    alert('🗳️ Vielen Dank für deine Stimme!\n\nDeine Abstimmung wurde erfolgreich registriert.');
    
    // Button deaktivieren
    const voteButton = document.querySelector(`button[onclick="submitVote('${surveyId}')"]`);
    if (voteButton) {
        voteButton.disabled = true;
        voteButton.innerHTML = '<span class="button-icon">✅</span><span class="button-text">Abgestimmt</span>';
    }
}

/* ====================================
   ERD ADDITION SPIEL FUNKTIONEN (EBENE 4)
   ==================================== */

// Spiel-Variablen
let gameState = {
    mode: null,
    isActive: false,
    isPaused: false,
    startTime: null,
    currentProblem: null,
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    currentLevel: 1,
    streak: 0,
    maxStreak: 0,
    problemsInCurrentLevel: 0,
    problemsPerLevel: 10,
    timer: null,
    timeLimit: null,
    timeRemaining: null
};

// Spiel-Modi Konfiguration
const gameModes = {
    easy: {
        name: 'Anfänger',
        numberRange: [1, 10],
        timeLimit: null,
        pointsPerCorrect: 10,
        description: 'Zahlen 1-10, keine Zeitbegrenzung'
    },
    medium: {
        name: 'Fortgeschritten',
        numberRange: [1, 50],
        timeLimit: 120, // 2 Minuten
        pointsPerCorrect: 20,
        description: 'Zahlen 1-50, 2 Minuten Zeit'
    },
    hard: {
        name: 'Experte',
        numberRange: [1, 100],
        timeLimit: 90, // 1.5 Minuten
        pointsPerCorrect: 30,
        description: 'Zahlen 1-100, 90 Sekunden Zeit'
    },
    challenge: {
        name: 'Herausforderung',
        numberRange: [1, 200],
        timeLimit: 60, // 1 Minute
        pointsPerCorrect: 50,
        description: 'Zahlen 1-200, 60 Sekunden Zeit'
    }
};

// Startet ein neues Erd Addition Spiel
function startErdAdditionGame(mode) {
    console.log(`🌍 Starte Erd Addition Spiel: ${mode}`);
    
    // Tracking: Spiel-Start
    trackUserAction('erd_addition_game_started', { 
        mode: mode,
        username: currentUser?.name 
    });
    
    // Initialisiere Spiel-Status
    gameState = {
        mode: mode,
        isActive: true,
        isPaused: false,
        startTime: Date.now(),
        currentProblem: null,
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        currentLevel: 1,
        streak: 0,
        maxStreak: 0,
        problemsInCurrentLevel: 0,
        problemsPerLevel: 10,
        timer: null,
        timeLimit: gameModes[mode].timeLimit,
        timeRemaining: gameModes[mode].timeLimit
    };
    
    // Zeige Spiel-Interface
    showGameInterface();
    
    // Starte Timer falls Zeitlimit vorhanden
    if (gameState.timeLimit) {
        startGameTimer();
    }
    
    // Erste Aufgabe generieren
    generateNewProblem();
    
    // Update Display
    updateGameDisplay();
    
    console.log('✅ Erd Addition Spiel gestartet');
}

// Zeigt das Spiel-Interface
function showGameInterface() {
    document.getElementById('game-mode-selection').classList.add('hidden');
    document.getElementById('game-interface').classList.remove('hidden');
    document.getElementById('game-results').classList.add('hidden');
    
    // Fokus auf Antwort-Feld setzen
    setTimeout(() => {
        const answerField = document.getElementById('answer-field');
        if (answerField) {
            answerField.focus();
        }
    }, 100);
}

// Zeigt die Spiel-Modus Auswahl
function showGameModeSelection() {
    document.getElementById('game-mode-selection').classList.remove('hidden');
    document.getElementById('game-interface').classList.add('hidden');
    document.getElementById('game-results').classList.add('hidden');
}

// Generiert eine neue Mathematik-Aufgabe
function generateNewProblem() {
    if (!gameState.isActive) return;
    
    const mode = gameModes[gameState.mode];
    const [min, max] = mode.numberRange;
    
    // Schwierigkeit erhöhen mit Level
    const levelMultiplier = Math.min(gameState.currentLevel * 0.2, 2.0);
    const adjustedMax = Math.min(max, Math.floor(max * levelMultiplier));
    
    const num1 = Math.floor(Math.random() * adjustedMax) + min;
    const num2 = Math.floor(Math.random() * adjustedMax) + min;
    
    gameState.currentProblem = {
        num1: num1,
        num2: num2,
        correctAnswer: num1 + num2,
        startTime: Date.now()
    };
    
    // Anzeige aktualisieren
    document.getElementById('first-number').textContent = num1;
    document.getElementById('second-number').textContent = num2;
    
    // Antwort-Feld leeren
    const answerField = document.getElementById('answer-field');
    if (answerField) {
        answerField.value = '';
        answerField.focus();
    }
    
    // Feedback-Bereich leeren
    document.getElementById('feedback-area').innerHTML = '';
    
    console.log(`🧮 Neue Aufgabe: ${num1} + ${num2} = ${num1 + num2}`);
}

// Überprüft die eingegeben Antwort
function submitAnswer() {
    if (!gameState.isActive || !gameState.currentProblem) return;
    
    const answerField = document.getElementById('answer-field');
    const userAnswer = parseInt(answerField.value);
    
    if (isNaN(userAnswer)) {
        alert('❌ Bitte gib eine gültige Zahl ein.');
        answerField.focus();
        return;
    }
    
    const isCorrect = userAnswer === gameState.currentProblem.correctAnswer;
    const timeTaken = Date.now() - gameState.currentProblem.startTime;
    
    // Tracking: Antwort eingereicht
    trackUserAction('erd_addition_answer_submitted', { 
        correct: isCorrect,
        timeTaken: timeTaken,
        level: gameState.currentLevel,
        username: currentUser?.name 
    });
    
    if (isCorrect) {
        handleCorrectAnswer(timeTaken);
    } else {
        handleIncorrectAnswer();
    }
    
    // Fortschritt aktualisieren
    updateGameDisplay();
    
    // Prüfe Level-Aufstieg
    if (gameState.problemsInCurrentLevel >= gameState.problemsPerLevel) {
        levelUp();
    }
    
    // Neue Aufgabe nach kurzer Verzögerung
    setTimeout(() => {
        if (gameState.isActive) {
            generateNewProblem();
        }
    }, 1500);
}

// Behandelt richtige Antworten
function handleCorrectAnswer(timeTaken) {
    gameState.correctAnswers++;
    gameState.problemsInCurrentLevel++;
    gameState.streak++;
    gameState.maxStreak = Math.max(gameState.maxStreak, gameState.streak);
    
    // Punkte berechnen (Bonus für Geschwindigkeit und Streak)
    let points = gameModes[gameState.mode].pointsPerCorrect;
    
    // Geschwindigkeits-Bonus (unter 3 Sekunden)
    if (timeTaken < 3000) {
        points *= 1.5;
    }
    
    // Streak-Bonus
    if (gameState.streak >= 5) {
        points *= 1.2;
    }
    
    gameState.score += Math.floor(points);
    
    // Feedback anzeigen
    showFeedback('correct', `🎉 Richtig! +${Math.floor(points)} Punkte`);
    
    console.log(`✅ Richtige Antwort! Punkte: +${Math.floor(points)}, Streak: ${gameState.streak}`);
}

// Behandelt falsche Antworten
function handleIncorrectAnswer() {
    gameState.wrongAnswers++;
    gameState.problemsInCurrentLevel++;
    gameState.streak = 0;
    
    const correctAnswer = gameState.currentProblem.correctAnswer;
    
    // Feedback anzeigen
    showFeedback('incorrect', `❌ Falsch! Richtig wäre: ${correctAnswer}`);
    
    console.log(`❌ Falsche Antwort. Richtig: ${correctAnswer}`);
}

// Zeigt Feedback-Nachrichten
function showFeedback(type, message) {
    const feedbackArea = document.getElementById('feedback-area');
    feedbackArea.innerHTML = `<div class="feedback-message ${type}">${message}</div>`;
}

// Level-Aufstieg
function levelUp() {
    gameState.currentLevel++;
    gameState.problemsInCurrentLevel = 0;
    
    // Bonus-Punkte für Level-Aufstieg
    const levelBonus = gameState.currentLevel * 50;
    gameState.score += levelBonus;
    
    // Feedback anzeigen
    showFeedback('correct', `🎊 Level ${gameState.currentLevel} erreicht! +${levelBonus} Bonus-Punkte!`);
    
    // Tracking: Level-Aufstieg
    trackUserAction('erd_addition_level_up', { 
        newLevel: gameState.currentLevel,
        score: gameState.score,
        username: currentUser?.name 
    });
    
    console.log(`🆙 Level-Aufstieg! Neues Level: ${gameState.currentLevel}`);
}

// Aktualisiert die Spiel-Anzeige
function updateGameDisplay() {
    // Timer aktualisieren
    updateGameTimer();
    
    // Statistiken aktualisieren
    document.getElementById('game-score').textContent = gameState.score;
    document.getElementById('correct-count').textContent = gameState.correctAnswers;
    document.getElementById('wrong-count').textContent = gameState.wrongAnswers;
    document.getElementById('current-level').textContent = gameState.currentLevel;
    document.getElementById('streak-count').textContent = gameState.streak;
    
    // Fortschrittsbalken aktualisieren
    const progress = (gameState.problemsInCurrentLevel / gameState.problemsPerLevel) * 100;
    document.getElementById('level-progress').style.width = `${progress}%`;
    document.getElementById('progress-text').textContent = `${gameState.problemsInCurrentLevel}/${gameState.problemsPerLevel}`;
}

// Startet den Spiel-Timer
function startGameTimer() {
    if (!gameState.timeLimit) return;
    
    gameState.timer = setInterval(() => {
        if (!gameState.isPaused && gameState.isActive) {
            gameState.timeRemaining--;
            
            if (gameState.timeRemaining <= 0) {
                endGame();
            }
        }
    }, 1000);
}

// Aktualisiert die Timer-Anzeige
function updateGameTimer() {
    const timerElement = document.getElementById('game-timer');
    
    if (gameState.timeLimit) {
        const minutes = Math.floor(gameState.timeRemaining / 60);
        const seconds = gameState.timeRemaining % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Warnung bei wenig Zeit
        if (gameState.timeRemaining <= 10) {
            timerElement.style.color = '#f44336';
        }
    } else {
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Pausiert/Fortsetzt das Spiel
function pauseGame() {
    if (!gameState.isActive) return;
    
    gameState.isPaused = !gameState.isPaused;
    const pauseButton = document.querySelector('button[onclick="pauseGame()"]');
    
    if (gameState.isPaused) {
        pauseButton.innerHTML = '<span class="button-icon">▶️</span><span class="button-text">Fortsetzen</span>';
        console.log('⏸️ Spiel pausiert');
    } else {
        pauseButton.innerHTML = '<span class="button-icon">⏸️</span><span class="button-text">Pause</span>';
        console.log('▶️ Spiel fortgesetzt');
    }
    
    // Tracking: Pause
    trackUserAction('erd_addition_pause_toggled', { 
        isPaused: gameState.isPaused,
        username: currentUser?.name 
    });
}

// Startet das Spiel neu
function restartGame() {
    if (!gameState.mode) return;
    
    const confirmed = confirm('🔄 Möchtest du das Spiel wirklich neu starten?\n\nAlle bisherigen Fortschritte gehen verloren.');
    
    if (confirmed) {
        // Timer stoppen
        if (gameState.timer) {
            clearInterval(gameState.timer);
        }
        
        // Neues Spiel starten
        startErdAdditionGame(gameState.mode);
        
        console.log('🔄 Spiel neu gestartet');
    }
}

// Beendet das Spiel
function endGame() {
    console.log('🏁 Beende Erd Addition Spiel...');
    
    gameState.isActive = false;
    
    // Timer stoppen
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    
    // Spiel-Ergebnisse berechnen
    const totalTime = Math.floor((Date.now() - gameState.startTime) / 1000);
    const totalProblems = gameState.correctAnswers + gameState.wrongAnswers;
    const accuracy = totalProblems > 0 ? Math.round((gameState.correctAnswers / totalProblems) * 100) : 0;
    
    // Speichere Ergebnisse
    saveGameResults(totalTime, accuracy);
    
    // Zeige Ergebnisse
    showGameResults(totalTime, accuracy);
    
    // Tracking: Spiel beendet
    trackUserAction('erd_addition_game_ended', { 
        score: gameState.score,
        totalTime: totalTime,
        accuracy: accuracy,
        level: gameState.currentLevel,
        username: currentUser?.name 
    });
    
    console.log('✅ Erd Addition Spiel beendet');
}

// Speichert die Spiel-Ergebnisse
function saveGameResults(totalTime, accuracy) {
    if (!currentUser) return;
    
    const gameResult = {
        game: 'Erd Addition',
        modus: gameModes[gameState.mode].name,
        punkte: gameState.score,
        zeit: totalTime,
        richtige: gameState.correctAnswers,
        falsche: gameState.wrongAnswers,
        level: gameState.currentLevel,
        genauigkeit: accuracy,
        maxStreak: gameState.maxStreak,
        datum: new Date().toISOString()
    };
    
    // Zu Benutzer-Ergebnissen hinzufügen
    if (!currentUser.gameResults) {
        currentUser.gameResults = [];
    }
    currentUser.gameResults.push(gameResult);
    
    // Gesamt-Statistiken aktualisieren
    currentUser.totalGamesPlayed = (currentUser.totalGamesPlayed || 0) + 1;
    currentUser.totalScore = (currentUser.totalScore || 0) + gameState.score;
    
    // In localStorage speichern
    const users = JSON.parse(localStorage.getItem('neurogames_users')) || [];
    const userIndex = users.findIndex(u => u.name === currentUser.name);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('neurogames_users', JSON.stringify(users));
    }
    
    console.log('💾 Spiel-Ergebnisse gespeichert:', gameResult);
}

// Zeigt die Spiel-Ergebnisse
function showGameResults(totalTime, accuracy) {
    // Interface wechseln
    document.getElementById('game-interface').classList.add('hidden');
    document.getElementById('game-results').classList.remove('hidden');
    
    // Ergebnisse ausfüllen
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    document.getElementById('final-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('final-correct').textContent = gameState.correctAnswers;
    document.getElementById('final-wrong').textContent = gameState.wrongAnswers;
    document.getElementById('final-level').textContent = gameState.currentLevel;
    document.getElementById('final-streak').textContent = gameState.maxStreak;
    document.getElementById('final-accuracy').textContent = `${accuracy}%`;
}

// Enter-Taste für Antwort-Eingabe
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && gameState.isActive && !gameState.isPaused) {
        const answerField = document.getElementById('answer-field');
        if (answerField && document.activeElement === answerField) {
            submitAnswer();
        }
    }
});

/* ====================================
   ARCHIV SYSTEM FUNKTIONEN (EBENE 5)
   ==================================== */

// Aktiver Archiv-Tab
let currentArchiveTab = 'overview';

// Zeigt einen bestimmten Archiv-Tab
function showArchiveTab(tabId) {
    console.log(`📊 Wechsle zu Archiv-Tab: ${tabId}`);
    
    currentArchiveTab = tabId;
    
    // Tracking: Tab-Wechsel
    trackUserAction('archive_tab_changed', { 
        tabId: tabId,
        username: currentUser?.name 
    });
    
    // Alle Tabs deaktivieren
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.archive-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.add('hidden');
    });
    
    // Aktiven Tab aktivieren
    const activeButton = document.querySelector(`.tab-btn[onclick*="${tabId}"]`);
    const activeTab = document.getElementById(`${tabId}-tab`);
    
    if (activeButton && activeTab) {
        activeButton.classList.add('active');
        activeTab.classList.remove('hidden');
        activeTab.classList.add('active');
        
        // Tab-spezifische Initialisierung
        switch(tabId) {
            case 'overview':
                updateOverviewStats();
                break;
            case 'results':
                loadGameResults();
                break;
            case 'statistics':
                updateDetailedStatistics();
                break;
            case 'export':
                updateExportPreview();
                break;
        }
    }
}

// Aktualisiert die Übersichts-Statistiken
function updateOverviewStats() {
    if (!currentUser || !currentUser.gameResults) {
        console.log('📊 Keine Spielergebnisse vorhanden');
        return;
    }
    
    const results = currentUser.gameResults;
    
    // Gesamtstatistiken berechnen
    const totalGames = results.length;
    const totalScore = results.reduce((sum, result) => sum + (result.punkte || 0), 0);
    const totalTime = results.reduce((sum, result) => sum + (result.zeit || 0), 0);
    const totalCorrect = results.reduce((sum, result) => sum + (result.richtige || 0), 0);
    const totalAnswers = results.reduce((sum, result) => sum + ((result.richtige || 0) + (result.falsche || 0)), 0);
    const averageAccuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
    
    // Anzeige aktualisieren
    document.getElementById('total-games-stat').textContent = totalGames;
    document.getElementById('total-score-stat').textContent = totalScore.toLocaleString();
    
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);
    document.getElementById('total-time-stat').textContent = `${hours}h ${minutes}m`;
    
    document.getElementById('average-accuracy-stat').textContent = `${averageAccuracy}%`;
    
    // Zusätzliche Statistiken
    if (results.length > 0) {
        const lastGame = results[results.length - 1];
        const lastGameDate = new Date(lastGame.datum).toLocaleDateString('de-DE');
        document.getElementById('last-game-date').textContent = lastGameDate;
        
        const bestScore = Math.max(...results.map(r => r.punkte || 0));
        document.getElementById('best-score').textContent = `${bestScore} Punkte`;
        
        const longestStreak = Math.max(...results.map(r => r.maxStreak || 0));
        document.getElementById('longest-streak').textContent = `${longestStreak} richtig`;
    }
    
    console.log('📊 Übersichts-Statistiken aktualisiert');
}

// Lädt und zeigt die Spielergebnisse
function loadGameResults() {
    if (!currentUser || !currentUser.gameResults) {
        displayNoResults();
        return;
    }
    
    const results = [...currentUser.gameResults].reverse(); // Neueste zuerst
    displayResults(results);
    updateResultsCount(results.length);
    
    console.log(`📋 ${results.length} Spielergebnisse geladen`);
}

// Zeigt die Ergebnisse in der Tabelle an
function displayResults(results) {
    const tableContainer = document.getElementById('results-table');
    
    if (results.length === 0) {
        displayNoResults();
        return;
    }
    
    const tableHTML = `
        <div class="result-item" style="font-weight: 600; background: #f8f9fa;">
            <div class="result-field">🎮 Spiel & Modus</div>
            <div class="result-field">📅 Datum</div>
            <div class="result-field">🎯 Punkte</div>
            <div class="result-field">⏱️ Zeit</div>
            <div class="result-field">📊 Level</div>
            <div class="result-field">⭐ Genauigkeit</div>
        </div>
        ${results.map(result => `
            <div class="result-item">
                <div class="result-field">
                    <div style="font-weight: 600;">${result.game || 'Unbekanntes Spiel'}</div>
                    <div style="font-size: 0.8rem; color: #6c757d;">${result.modus || 'Unbekannter Modus'}</div>
                </div>
                <div class="result-field date">${formatDate(result.datum)}</div>
                <div class="result-field score">${result.punkte || 0}</div>
                <div class="result-field">${formatTime(result.zeit || 0)}</div>
                <div class="result-field">Level ${result.level || 1}</div>
                <div class="result-field accuracy">${result.genauigkeit || 0}%</div>
            </div>
        `).join('')}
    `;
    
    tableContainer.innerHTML = tableHTML;
}

// Zeigt "Keine Ergebnisse" Nachricht
function displayNoResults() {
    const tableContainer = document.getElementById('results-table');
    tableContainer.innerHTML = `
        <div class="no-results">
            <div style="text-align: center; padding: 3rem; color: #6c757d;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                <h3>Noch keine Spielergebnisse</h3>
                <p>Spiele dein erstes Spiel, um hier Ergebnisse zu sehen!</p>
                <button onclick="showLevel('level-3a')" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Jetzt spielen
                </button>
            </div>
        </div>
    `;
}

// Aktualisiert die Ergebnisse-Anzahl
function updateResultsCount(count) {
    document.getElementById('results-count').textContent = `${count} Ergebnisse`;
}

// Wendet Filter auf die Ergebnisse an
function applyFilters() {
    if (!currentUser || !currentUser.gameResults) return;
    
    const gameFilter = document.getElementById('game-filter').value;
    const modeFilter = document.getElementById('mode-filter').value;
    const dateFilter = document.getElementById('date-filter').value;
    
    let filteredResults = [...currentUser.gameResults];
    
    // Spiel-Filter
    if (gameFilter !== 'all') {
        filteredResults = filteredResults.filter(result => result.game === gameFilter);
    }
    
    // Modus-Filter
    if (modeFilter !== 'all') {
        filteredResults = filteredResults.filter(result => result.modus === modeFilter);
    }
    
    // Datum-Filter
    if (dateFilter !== 'all') {
        const now = new Date();
        filteredResults = filteredResults.filter(result => {
            const resultDate = new Date(result.datum);
            switch(dateFilter) {
                case 'today':
                    return resultDate.toDateString() === now.toDateString();
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return resultDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return resultDate >= monthAgo;
                default:
                    return true;
            }
        });
    }
    
    // Ergebnisse anzeigen
    filteredResults.reverse(); // Neueste zuerst
    displayResults(filteredResults);
    updateResultsCount(filteredResults.length);
    
    // Tracking: Filter angewendet
    trackUserAction('archive_filters_applied', { 
        gameFilter, modeFilter, dateFilter,
        resultCount: filteredResults.length,
        username: currentUser?.name 
    });
    
    console.log(`🔍 Filter angewendet: ${filteredResults.length} Ergebnisse`);
}

// Setzt alle Filter zurück
function clearFilters() {
    document.getElementById('game-filter').value = 'all';
    document.getElementById('mode-filter').value = 'all';
    document.getElementById('date-filter').value = 'all';
    
    loadGameResults();
    
    console.log('🔄 Filter zurückgesetzt');
}

// Aktualisiert detaillierte Statistiken
function updateDetailedStatistics() {
    if (!currentUser || !currentUser.gameResults || currentUser.gameResults.length === 0) {
        displayEmptyStatistics();
        return;
    }
    
    const results = currentUser.gameResults;
    
    // Lieblings-Modus berechnen
    const modeCount = {};
    results.forEach(result => {
        const mode = result.modus || 'Unbekannt';
        modeCount[mode] = (modeCount[mode] || 0) + 1;
    });
    const favoriteMode = Object.keys(modeCount).reduce((a, b) => modeCount[a] > modeCount[b] ? a : b);
    document.getElementById('favorite-mode').textContent = favoriteMode;
    
    // Durchschnittliche Spieldauer
    const avgDuration = Math.round(results.reduce((sum, result) => sum + (result.zeit || 0), 0) / results.length);
    document.getElementById('avg-game-duration').textContent = formatTime(avgDuration);
    
    // Beste Genauigkeit
    const bestAccuracy = Math.max(...results.map(r => r.genauigkeit || 0));
    document.getElementById('best-accuracy').textContent = `${bestAccuracy}%`;
    
    // Durchschnitts-Level
    const avgLevel = Math.round(results.reduce((sum, result) => sum + (result.level || 1), 0) / results.length);
    document.getElementById('avg-level').textContent = `Level ${avgLevel}`;
    
    // Wöchentliche Verbesserung (vereinfacht)
    const improvement = Math.random() * 20; // Placeholder
    document.getElementById('weekly-improvement').textContent = `+${improvement.toFixed(1)}%`;
    
    // Konsistenz-Rating (basierend auf Genauigkeitsvarianz)
    const accuracies = results.map(r => r.genauigkeit || 0);
    const avgAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - avgAccuracy, 2), 0) / accuracies.length;
    const consistency = Math.max(1, Math.min(5, Math.round(5 - (variance / 400))));
    document.getElementById('consistency-rating').textContent = '⭐'.repeat(consistency) + '☆'.repeat(5 - consistency);
    
    // Erfolge aktualisieren
    updateAchievements();
    
    console.log('📊 Detaillierte Statistiken aktualisiert');
}

// Zeigt leere Statistiken an
function displayEmptyStatistics() {
    const elements = [
        'favorite-mode', 'avg-game-duration', 'best-accuracy', 
        'avg-level', 'weekly-improvement', 'consistency-rating'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = 'Noch keine Daten';
    });
}

// Aktualisiert Erfolge/Achievements
function updateAchievements() {
    if (!currentUser || !currentUser.gameResults) return;
    
    const results = currentUser.gameResults;
    
    // Erstes Spiel
    if (results.length > 0) {
        unlockAchievement('first-game-achievement');
    }
    
    // 100 Punkte in einem Spiel
    if (results.some(r => (r.punkte || 0) >= 100)) {
        unlockAchievement('score-100-achievement');
    }
    
    // Serie von 10
    if (results.some(r => (r.maxStreak || 0) >= 10)) {
        unlockAchievement('streak-10-achievement');
    }
    
    // Täglicher Spieler (vereinfacht - 7+ Spiele)
    if (results.length >= 7) {
        unlockAchievement('daily-player-achievement');
    }
}

// Schaltet einen Erfolg frei
function unlockAchievement(achievementId) {
    const achievement = document.getElementById(achievementId);
    if (achievement && !achievement.classList.contains('unlocked')) {
        achievement.classList.add('unlocked');
        const status = achievement.querySelector('.achievement-status');
        if (status) {
            status.textContent = '🏆';
            status.classList.remove('locked');
        }
        
        console.log(`🏆 Erfolg freigeschaltet: ${achievementId}`);
    }
}

// Aktualisiert die Export-Vorschau
function updateExportPreview() {
    if (!currentUser) {
        document.getElementById('export-username').textContent = 'Nicht angemeldet';
        document.getElementById('export-games-count').textContent = '0 Spiele';
        document.getElementById('export-size').textContent = '~0 KB';
        return;
    }
    
    const gameCount = currentUser.gameResults ? currentUser.gameResults.length : 0;
    const dataSize = Math.round(JSON.stringify(currentUser).length / 1024);
    
    document.getElementById('export-username').textContent = currentUser.name;
    document.getElementById('export-date').textContent = new Date().toLocaleDateString('de-DE');
    document.getElementById('export-games-count').textContent = `${gameCount} Spiele`;
    document.getElementById('export-size').textContent = `~${dataSize} KB`;
    
    console.log('📁 Export-Vorschau aktualisiert');
}

// Exportiert Daten in verschiedenen Formaten
function exportData(format) {
    if (!currentUser) {
        alert('❌ Bitte melde dich zuerst an, um Daten zu exportieren.');
        return;
    }
    
    console.log(`📁 Exportiere Daten als: ${format}`);
    
    // Tracking: Export
    trackUserAction('data_exported', { 
        format: format,
        username: currentUser?.name 
    });
    
    const exportData = prepareExportData();
    
    switch(format) {
        case 'json':
            downloadFile(JSON.stringify(exportData, null, 2), `neurogames_${currentUser.name}_${getTimestamp()}.json`, 'application/json');
            break;
        case 'csv':
            downloadFile(convertToCSV(exportData), `neurogames_${currentUser.name}_${getTimestamp()}.csv`, 'text/csv');
            break;
        case 'txt':
            downloadFile(convertToTXT(exportData), `neurogames_${currentUser.name}_${getTimestamp()}.txt`, 'text/plain');
            break;
        case 'html':
            downloadFile(convertToHTML(exportData), `neurogames_${currentUser.name}_${getTimestamp()}.html`, 'text/html');
            break;
    }
}

// Bereitet Export-Daten vor
function prepareExportData() {
    return {
        meta: {
            exportDate: new Date().toISOString(),
            version: '1.0',
            user: currentUser.name,
            application: 'NeuroGames'
        },
        user: {
            name: currentUser.name,
            registrationDate: currentUser.registrationDate,
            totalGamesPlayed: currentUser.totalGamesPlayed || 0,
            totalScore: currentUser.totalScore || 0
        },
        gameResults: currentUser.gameResults || [],
        statistics: calculateExportStatistics()
    };
}

// Berechnet Statistiken für Export
function calculateExportStatistics() {
    if (!currentUser.gameResults || currentUser.gameResults.length === 0) {
        return {};
    }
    
    const results = currentUser.gameResults;
    return {
        totalGames: results.length,
        averageScore: Math.round(results.reduce((sum, r) => sum + (r.punkte || 0), 0) / results.length),
        bestScore: Math.max(...results.map(r => r.punkte || 0)),
        totalPlayTime: results.reduce((sum, r) => sum + (r.zeit || 0), 0),
        averageAccuracy: Math.round(results.reduce((sum, r) => sum + (r.genauigkeit || 0), 0) / results.length)
    };
}

// Konvertiert zu CSV
function convertToCSV(data) {
    if (!data.gameResults || data.gameResults.length === 0) {
        return 'Datum,Spiel,Modus,Punkte,Zeit,Level,Genauigkeit\n(Keine Spielergebnisse)';
    }
    
    const headers = 'Datum,Spiel,Modus,Punkte,Zeit,Level,Genauigkeit,Richtige,Falsche,MaxStreak\n';
    const rows = data.gameResults.map(result => {
        return [
            new Date(result.datum).toLocaleDateString('de-DE'),
            result.game || '',
            result.modus || '',
            result.punkte || 0,
            result.zeit || 0,
            result.level || 1,
            result.genauigkeit || 0,
            result.richtige || 0,
            result.falsche || 0,
            result.maxStreak || 0
        ].join(',');
    }).join('\n');
    
    return headers + rows;
}

// Konvertiert zu TXT
function convertToTXT(data) {
    return `
NeuroGames - Individueller Fortschritt (Liste 5)
==============================================

Benutzer: ${data.user.name}
Export-Datum: ${new Date(data.meta.exportDate).toLocaleString('de-DE')}
Registriert seit: ${new Date(data.user.registrationDate).toLocaleDateString('de-DE')}

Gesamtstatistiken:
- Gespielte Runden: ${data.statistics.totalGames || 0}
- Gesamtpunkte: ${data.statistics.totalScore || 0}
- Beste Punktzahl: ${data.statistics.bestScore || 0}
- Gesamtspielzeit: ${formatTime(data.statistics.totalPlayTime || 0)}
- Durchschnittliche Genauigkeit: ${data.statistics.averageAccuracy || 0}%

Spielergebnisse:
${data.gameResults.length === 0 ? 'Noch keine Spielergebnisse vorhanden.' : data.gameResults.map((result, index) => `
${index + 1}. ${result.game} (${result.modus})
   Datum: ${new Date(result.datum).toLocaleString('de-DE')}
   Punkte: ${result.punkte} | Zeit: ${formatTime(result.zeit)} | Level: ${result.level}
   Genauigkeit: ${result.genauigkeit}% | Richtige: ${result.richtige} | Falsche: ${result.falsche}
   Längste Serie: ${result.maxStreak}
`).join('')}

--- Ende des Reports ---
    `.trim();
}

// Konvertiert zu HTML
function convertToHTML(data) {
    return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NeuroGames - Fortschrittsbericht für ${data.user.name}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; }
        .stat-number { font-size: 2rem; font-weight: bold; color: #667eea; }
        .stat-label { color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .footer { margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 10px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧠 NeuroGames</h1>
        <h2>Individueller Fortschrittsbericht</h2>
        <p>Benutzer: <strong>${data.user.name}</strong></p>
        <p>Erstellt am: ${new Date(data.meta.exportDate).toLocaleString('de-DE')}</p>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">${data.statistics.totalGames || 0}</div>
            <div class="stat-label">Gespielte Runden</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${data.statistics.totalScore || 0}</div>
            <div class="stat-label">Gesamtpunkte</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${data.statistics.bestScore || 0}</div>
            <div class="stat-label">Beste Punktzahl</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${data.statistics.averageAccuracy || 0}%</div>
            <div class="stat-label">Ø Genauigkeit</div>
        </div>
    </div>

    <h3>🎯 Spielergebnisse</h3>
    ${data.gameResults.length === 0 ? '<p>Noch keine Spielergebnisse vorhanden.</p>' : `
    <table>
        <thead>
            <tr>
                <th>Datum</th>
                <th>Spiel</th>
                <th>Modus</th>
                <th>Punkte</th>
                <th>Zeit</th>
                <th>Genauigkeit</th>
            </tr>
        </thead>
        <tbody>
            ${data.gameResults.map(result => `
            <tr>
                <td>${new Date(result.datum).toLocaleDateString('de-DE')}</td>
                <td>${result.game || ''}</td>
                <td>${result.modus || ''}</td>
                <td>${result.punkte || 0}</td>
                <td>${formatTime(result.zeit || 0)}</td>
                <td>${result.genauigkeit || 0}%</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
    `}

    <div class="footer">
        <p>📊 Dieser Bericht wurde automatisch von NeuroGames generiert</p>
        <p>© 2025 NeuroGames - Horizon Research UG</p>
    </div>
</body>
</html>
    `.trim();
}

// Vollständigen Export erstellen
function exportAllData() {
    const formats = ['json', 'csv', 'txt', 'html'];
    
    if (!currentUser) {
        alert('❌ Bitte melde dich zuerst an, um Daten zu exportieren.');
        return;
    }
    
    if (confirm('📦 Möchtest du einen vollständigen Export in allen Formaten erstellen?\n\nEs werden 4 Dateien heruntergeladen.')) {
        formats.forEach((format, index) => {
            setTimeout(() => exportData(format), index * 500);
        });
        
        alert('🎉 Vollständiger Export gestartet!\n\n4 Dateien werden in Kürze heruntergeladen.');
    }
}

// Zeigt Export-Verlauf (Placeholder)
function showExportHistory() {
    alert('📚 Export-Verlauf wird in einem zukünftigen Update verfügbar sein!\n\nHier werden alle deine bisherigen Exporte aufgelistet.');
}

// Hilfsfunktionen für Formatierung
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function getTimestamp() {
    return new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
}

// Datei-Download Hilfsfunktion
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`📁 Datei heruntergeladen: ${filename}`);
}

/* ====================================
   FORMULAR-EVENT-LISTENER
   ==================================== */

// Initialisiert alle Event-Listener für Formulare
function initializeFormListeners() {
    console.log('📋 Initialisiere Formular-Event-Listener...');
    
    // Login-Formular Event-Listener
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    // Registrierungs-Formular Event-Listener
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
    
    // Real-time Validierung für Registrierung
    const registerName = document.getElementById('register-name');
    const registerPassword = document.getElementById('register-password');
    const registerConfirm = document.getElementById('register-confirm');
    const termsCheckbox = document.getElementById('terms-agreement');
    const privacyCheckbox = document.getElementById('privacy-agreement');
    
    if (registerName) {
        registerName.addEventListener('input', validateUsernameAvailability);
        registerName.addEventListener('blur', validateUsernameFormat);
    }
    
    if (registerPassword) {
        registerPassword.addEventListener('input', updatePasswordStrength);
        registerPassword.addEventListener('input', validatePasswordMatch);
    }
    
    if (registerConfirm) {
        registerConfirm.addEventListener('input', validatePasswordMatch);
    }
    
    if (termsCheckbox && privacyCheckbox) {
        termsCheckbox.addEventListener('change', updateRegistrationButtonState);
        privacyCheckbox.addEventListener('change', updateRegistrationButtonState);
    }
    
    // Real-time Validierung für Login
    const loginName = document.getElementById('login-name');
    const loginPassword = document.getElementById('login-password');
    
    if (loginName) {
        loginName.addEventListener('blur', validateLoginUsername);
    }
    
    if (loginPassword) {
        loginPassword.addEventListener('input', validateLoginPassword);
    }
    
    console.log('✅ Event-Listener erfolgreich hinzugefügt');
}

// Behandelt das Absenden des Login-Formulars
function handleLoginSubmit(event) {
    // Verhindere Standard-Formular-Verhalten (Seite neu laden)
    event.preventDefault();
    
    console.log('🔑 Login-Formular abgesendet');
    
    // Hole Eingabewerte aus dem Formular
    const name = document.getElementById('login-name').value.trim();
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    // Zeige Loading-Animation
    showButtonLoading('login-submit-btn', true);
    
    // Tracking: Login-Versuch
    trackUserAction('login_attempt', { username: name, rememberMe: rememberMe });
    
    // Validiere Eingaben
    if (!validateLoginForm(name, password)) {
        showButtonLoading('login-submit-btn', false);
        return;
    }
    
    // Simuliere Netzwerk-Verzögerung für bessere UX
    setTimeout(() => {
        // Versuche Anmeldung
        if (loginUser(name, password)) {
            // Speichere "Angemeldet bleiben" Einstellung
            if (rememberMe) {
                localStorage.setItem('neurogames_remember_user', 'true');
            }
            
            // Erfolgsmeldung
            showFormFeedback('login-name', 'Erfolgreich angemeldet! 🎉', 'success');
            
            // Login erfolgreich - zeige Hauptmenü nach kurzer Verzögerung
            setTimeout(() => {
                showLevel('level-3');
                updateUserDisplay();
                
                // Lösche Formular-Eingaben
                document.getElementById('login-form').reset();
                showButtonLoading('login-submit-btn', false);
            }, 1000);
        } else {
            showButtonLoading('login-submit-btn', false);
        }
    }, 800);
}

// Behandelt das Absenden des Registrierungs-Formulars
function handleRegisterSubmit(event) {
    // Verhindere Standard-Formular-Verhalten
    event.preventDefault();
    
    console.log('📝 Registrierungs-Formular abgesendet');
    
    // Hole Eingabewerte aus dem Formular
    const name = document.getElementById('register-name').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    const termsAccepted = document.getElementById('terms-agreement').checked;
    const privacyAccepted = document.getElementById('privacy-agreement').checked;
    
    // Zeige Loading-Animation
    showButtonLoading('register-submit-btn', true);
    
    // Tracking: Registrierungs-Versuch
    trackUserAction('register_attempt', { 
        username: name, 
        termsAccepted: termsAccepted,
        privacyAccepted: privacyAccepted 
    });
    
    // Validiere Eingaben
    if (!validateRegistrationForm(name, password, confirmPassword, termsAccepted, privacyAccepted)) {
        showButtonLoading('register-submit-btn', false);
        return;
    }
    
    // Simuliere Netzwerk-Verzögerung für bessere UX
    setTimeout(() => {
        // Versuche Registrierung
        if (registerUser(name, password)) {
            // Erfolgsmeldung
            showFormFeedback('register-name', `Willkommen, ${name}! 🎉`, 'success');
            
            // Registrierung erfolgreich - zeige Hauptmenü nach kurzer Verzögerung
            setTimeout(() => {
                showLevel('level-3');
                updateUserDisplay();
                
                // Lösche Formular-Eingaben
                document.getElementById('register-form').reset();
                resetPasswordStrength();
                showButtonLoading('register-submit-btn', false);
            }, 1500);
        } else {
            showButtonLoading('register-submit-btn', false);
        }
    }, 1200);
}

/* ====================================
   USER-TRACKING SYSTEM
   ==================================== */

// Initialisiert das User-Tracking System
function initializeUserTracking() {
    console.log('📊 Initialisiere User-Tracking System...');
    
    // Lade bestehende Tracking-Daten
    const savedTracking = localStorage.getItem(STORAGE_KEYS.tracking);
    if (savedTracking) {
        userTrackingData = JSON.parse(savedTracking);
    }
    
    // Tracking: App-Start
    trackUserAction('app_started', { 
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent 
    });
    
    console.log('✅ User-Tracking System aktiviert');
}

// Trackt eine Benutzeraktion
function trackUserAction(action, data = {}) {
    // Erstelle Tracking-Eintrag
    const trackingEntry = {
        id: Date.now() + Math.random(), // Eindeutige ID
        action: action, // Art der Aktion
        timestamp: new Date().toISOString(), // Zeitstempel
        user: currentUser?.name || 'anonymous', // Benutzername
        level: currentLevel, // Aktuelle Ebene
        data: data // Zusätzliche Daten
    };
    
    // Füge zu Tracking-Daten hinzu
    userTrackingData.push(trackingEntry);
    
    // Speichere im Lokalspeicher
    localStorage.setItem(STORAGE_KEYS.tracking, JSON.stringify(userTrackingData));
    
    // Debug-Ausgabe
    console.log(`📊 Aktion getrackt: ${action}`, trackingEntry);
}

// Exportiert Tracking-Daten als JSON
function exportTrackingData() {
    console.log('📤 Exportiere Tracking-Daten...');
    
    const dataStr = JSON.stringify(userTrackingData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Erstelle Download-Link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `neurogames_tracking_${new Date().toISOString().split('T')[0]}.json`;
    
    // Triggere Download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Tracking: Daten-Export
    trackUserAction('tracking_data_exported', { entries: userTrackingData.length });
    
    console.log('✅ Tracking-Daten exportiert');
}

/* ====================================
   HILFSFUNKTIONEN
   ==================================== */

// Formatiert Datum und Uhrzeit für Anzeige
function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Generiert eine zufällige ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Validiert E-Mail-Format (für zukünftige Erweiterungen)
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/* ====================================
   FORMULAR-VALIDIERUNG UND UX
   ==================================== */

// Passwort sichtbar/unsichtbar umschalten
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggleBtn = input.parentElement.querySelector('.password-toggle');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        input.type = 'password';
        toggleBtn.textContent = '👁️';
    }
    
    // Tracking: Passwort-Toggle
    trackUserAction('password_toggle', { inputId: inputId, visible: input.type === 'text' });
}

// Zeigt Feedback-Nachrichten in Formularen
function showFormFeedback(inputId, message, type = 'error') {
    const feedbackElement = document.getElementById(inputId + '-feedback');
    if (feedbackElement) {
        feedbackElement.textContent = message;
        feedbackElement.className = `input-feedback ${type}`;
        
        // Automatisch ausblenden nach 5 Sekunden bei Erfolg
        if (type === 'success') {
            setTimeout(() => {
                feedbackElement.textContent = '';
                feedbackElement.className = 'input-feedback';
            }, 5000);
        }
    }
}

// Button-Loading Animation
function showButtonLoading(buttonId, loading) {
    const button = document.getElementById(buttonId);
    const text = button.querySelector('.button-text');
    const loader = button.querySelector('.button-loader');
    
    if (loading) {
        button.disabled = true;
        text.style.opacity = '0.7';
        loader.classList.remove('hidden');
    } else {
        button.disabled = false;
        text.style.opacity = '1';
        loader.classList.add('hidden');
    }
}

// Login-Formular Validierung
function validateLoginForm(name, password) {
    let isValid = true;
    
    // Name validieren
    if (!name || name.length < 2) {
        showFormFeedback('login-name', 'Bitte gib einen gültigen Namen ein', 'error');
        isValid = false;
    } else {
        showFormFeedback('login-name', '', 'success');
    }
    
    // Passwort validieren
    if (!password || password.length < 3) {
        showFormFeedback('login-password', 'Passwort muss mindestens 3 Zeichen haben', 'error');
        isValid = false;
    } else {
        showFormFeedback('login-password', '', 'success');
    }
    
    return isValid;
}

// Registrierungs-Formular Validierung
function validateRegistrationForm(name, password, confirmPassword, termsAccepted, privacyAccepted) {
    let isValid = true;
    
    // Name validieren
    if (!validateUsernameFormat()) {
        isValid = false;
    }
    
    // Passwort validieren
    const passwordStrength = calculatePasswordStrength(password);
    if (passwordStrength.score < 2) {
        showFormFeedback('register-password', 'Zauberwort ist zu schwach', 'error');
        isValid = false;
    }
    
    // Passwort-Bestätigung validieren
    if (password !== confirmPassword) {
        showFormFeedback('register-confirm', 'Zauberwörter stimmen nicht überein', 'error');
        isValid = false;
    }
    
    // Bedingungen validieren
    if (!termsAccepted) {
        alert('❌ Bitte stimme den Nutzungsbedingungen zu.');
        isValid = false;
    }
    
    if (!privacyAccepted) {
        alert('❌ Bitte bestätige das Lesen der Datenschutzerklärung.');
        isValid = false;
    }
    
    return isValid;
}

// Benutzername-Verfügbarkeit prüfen
function validateUsernameAvailability() {
    const nameInput = document.getElementById('register-name');
    const name = nameInput.value.trim();
    const availabilityCheck = document.getElementById('name-availability');
    
    if (name.length < 3) {
        availabilityCheck.classList.add('hidden');
        return;
    }
    
    // Lade bestehende Benutzer
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users)) || [];
    const exists = users.some(user => user.name.toLowerCase() === name.toLowerCase());
    
    if (exists) {
        showFormFeedback('register-name', 'Dieser Name ist bereits vergeben', 'error');
        availabilityCheck.classList.add('hidden');
    } else {
        showFormFeedback('register-name', 'Name ist verfügbar! ✅', 'success');
        availabilityCheck.classList.remove('hidden');
        availabilityCheck.textContent = '✅';
    }
}

// Benutzername-Format validieren
function validateUsernameFormat() {
    const nameInput = document.getElementById('register-name');
    const name = nameInput.value.trim();
    
    if (name.length < 3) {
        showFormFeedback('register-name', 'Name muss mindestens 3 Zeichen haben', 'error');
        return false;
    }
    
    if (name.length > 50) {
        showFormFeedback('register-name', 'Name darf maximal 50 Zeichen haben', 'error');
        return false;
    }
    
    if (!/^[a-zA-Z0-9äöüÄÖÜß]+$/.test(name)) {
        showFormFeedback('register-name', 'Nur Buchstaben und Zahlen erlaubt', 'error');
        return false;
    }
    
    return true;
}

// Passwort-Stärke berechnen
function calculatePasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    // Länge prüfen
    if (password.length >= 8) score += 1;
    else feedback.push('Mindestens 8 Zeichen');
    
    // Großbuchstaben
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Großbuchstaben');
    
    // Kleinbuchstaben
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Kleinbuchstaben');
    
    // Zahlen
    if (/\d/.test(password)) score += 1;
    else feedback.push('Zahlen');
    
    // Sonderzeichen
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) score += 1;
    else feedback.push('Sonderzeichen');
    
    return { score, feedback };
}

// Passwort-Stärke Anzeige aktualisieren
function updatePasswordStrength() {
    const passwordInput = document.getElementById('register-password');
    const strengthFill = document.getElementById('password-strength-fill');
    const strengthText = document.getElementById('password-strength-text');
    
    const password = passwordInput.value;
    const strength = calculatePasswordStrength(password);
    
    // Stärke-Balken und Text aktualisieren
    strengthFill.className = 'strength-fill';
    strengthText.className = 'strength-text';
    
    if (strength.score <= 1) {
        strengthFill.classList.add('weak');
        strengthText.classList.add('weak');
        strengthText.textContent = 'Sehr schwach';
    } else if (strength.score <= 2) {
        strengthFill.classList.add('fair');
        strengthText.classList.add('fair');
        strengthText.textContent = 'Schwach';
    } else if (strength.score <= 3) {
        strengthFill.classList.add('good');
        strengthText.classList.add('good');
        strengthText.textContent = 'Gut';
    } else {
        strengthFill.classList.add('strong');
        strengthText.classList.add('strong');
        strengthText.textContent = 'Sehr stark';
    }
    
    // Registrierungs-Button Status aktualisieren
    updateRegistrationButtonState();
}

// Passwort-Übereinstimmung prüfen
function validatePasswordMatch() {
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    const matchIndicator = document.getElementById('password-match');
    
    if (confirmPassword.length === 0) {
        matchIndicator.classList.add('hidden');
        showFormFeedback('register-confirm', '', 'success');
        return;
    }
    
    if (password === confirmPassword) {
        matchIndicator.classList.remove('hidden');
        matchIndicator.textContent = '✅';
        showFormFeedback('register-confirm', 'Zauberwörter stimmen überein ✅', 'success');
    } else {
        matchIndicator.classList.add('hidden');
        showFormFeedback('register-confirm', 'Zauberwörter stimmen nicht überein', 'error');
    }
    
    updateRegistrationButtonState();
}

// Registrierungs-Button Status aktualisieren
function updateRegistrationButtonState() {
    const submitBtn = document.getElementById('register-submit-btn');
    const name = document.getElementById('register-name').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    const termsAccepted = document.getElementById('terms-agreement').checked;
    const privacyAccepted = document.getElementById('privacy-agreement').checked;
    
    const passwordStrength = calculatePasswordStrength(password);
    const passwordsMatch = password === confirmPassword && password.length > 0;
    const nameValid = name.length >= 3;
    
    const canSubmit = nameValid && 
                     passwordStrength.score >= 2 && 
                     passwordsMatch && 
                     termsAccepted && 
                     privacyAccepted;
    
    submitBtn.disabled = !canSubmit;
}

// Login-Eingaben validieren
function validateLoginUsername() {
    const nameInput = document.getElementById('login-name');
    const name = nameInput.value.trim();
    
    if (name.length < 2) {
        showFormFeedback('login-name', 'Name zu kurz', 'error');
    } else {
        showFormFeedback('login-name', '', 'success');
    }
}

function validateLoginPassword() {
    const passwordInput = document.getElementById('login-password');
    const password = passwordInput.value;
    
    if (password.length < 3) {
        showFormFeedback('login-password', 'Zauberwort zu kurz', 'error');
    } else {
        showFormFeedback('login-password', '', 'success');
    }
}

// Passwort-Stärke zurücksetzen
function resetPasswordStrength() {
    const strengthFill = document.getElementById('password-strength-fill');
    const strengthText = document.getElementById('password-strength-text');
    
    if (strengthFill && strengthText) {
        strengthFill.className = 'strength-fill';
        strengthText.className = 'strength-text';
        strengthText.textContent = 'Sehr schwach';
    }
}

/* ====================================
   UI-ANIMATIONEN UND EFFEKTE
   ==================================== */

// Triggert Willkommens-Animationen für Ebene 1
function triggerWelcomeAnimations() {
    console.log('🎨 Starte Willkommens-Animationen');
    
    // Animiere Feature-Items nacheinander
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.animation = `slideInUp 0.6s ease forwards`;
        }, index * 200);
    });
    
    // Animiere Action Cards
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = `slideInFromSide 0.8s ease forwards`;
        }, 600 + index * 300);
    });
    
    // Animiere Info-Items
    const infoItems = document.querySelectorAll('.info-item');
    infoItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.animation = `fadeInScale 0.5s ease forwards`;
        }, 1200 + index * 150);
    });
}

// Hover-Effekt für Action Cards
function addActionCardEffects() {
    const actionCards = document.querySelectorAll('.action-card');
    
    actionCards.forEach(card => {
        // Maus-Enter Effekt
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            
            // Icon Animation
            const icon = this.querySelector('.action-icon');
            if (icon) {
                icon.style.animation = 'wiggle 0.6s ease';
            }
        });
        
        // Maus-Leave Effekt
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            
            // Reset Icon Animation
            const icon = this.querySelector('.action-icon');
            if (icon) {
                icon.style.animation = 'none';
            }
        });
        
        // Click-Feedback Effekt
        card.addEventListener('click', function() {
            this.style.animation = 'clickPulse 0.3s ease';
            
            setTimeout(() => {
                this.style.animation = 'none';
            }, 300);
        });
    });
}

// Initialisiert alle UI-Effekte
function initializeUIEffects() {
    console.log('🎭 Initialisiere UI-Effekte...');
    
    // Action Card Effekte hinzufügen
    addActionCardEffects();
    
    // Scroll-Animationen für mobile Geräte
    if (window.innerWidth <= 768) {
        initializeMobileScrollAnimations();
    }
    
    console.log('✨ UI-Effekte aktiviert');
}

// Mobile Scroll-Animationen
function initializeMobileScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Beobachte animierbare Elemente
    document.querySelectorAll('.feature-item, .action-card, .info-item').forEach(el => {
        observer.observe(el);
    });
}

/* ====================================
   ENTWICKLER-FUNKTIONEN (Debug)
   ==================================== */

// Debug-Funktion: Zeigt alle gespeicherten Daten
function debugShowAllData() {
    console.log('🔧 DEBUG: Alle gespeicherten Daten:');
    console.log('Benutzer:', JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]'));
    console.log('Aktueller Benutzer:', JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser) || 'null'));
    console.log('Tracking-Daten:', JSON.parse(localStorage.getItem(STORAGE_KEYS.tracking) || '[]'));
}

// Debug-Funktion: Löscht alle gespeicherten Daten
function debugClearAllData() {
    console.log('🗑️ DEBUG: Lösche alle Daten...');
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
    console.log('✅ Alle Daten gelöscht');
    location.reload(); // Seite neu laden
}

// Macht Debug-Funktionen global verfügbar (nur in Entwicklung)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugShowAllData = debugShowAllData;
    window.debugClearAllData = debugClearAllData;
    window.trackUserAction = trackUserAction;
    window.exportTrackingData = exportTrackingData;
    
    console.log('🔧 Debug-Funktionen aktiviert (localhost)');
    console.log('Verfügbare Funktionen: debugShowAllData(), debugClearAllData(), exportTrackingData()');
}

/* ====================================
   ZUSÄTZLICHE CLICK-LISTENER FÜR FALLBACK
   ==================================== */

// Initialisiert zusätzliche Event-Listener für alle interaktiven Elemente
function initializeClickListeners() {
    console.log('🖱️ Initialisiere zusätzliche Click-Listener...');
    
    // Fallback für alle onclick-Attribute im HTML
    document.querySelectorAll('[onclick]').forEach(element => {
        const onclickValue = element.getAttribute('onclick');
        console.log(`🔗 Backup-Listener für: ${onclickValue}`);
        
        element.addEventListener('click', function(e) {
            console.log(`🖱️ Click erfasst: ${onclickValue}`);
            try {
                // Führe die onclick-Funktion aus
                eval(onclickValue);
            } catch (error) {
                console.error(`❌ Fehler beim Ausführen: ${onclickValue}`, error);
            }
        });
    });
    
    console.log('✅ Click-Listener initialisiert');
}