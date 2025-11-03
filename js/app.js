/**
 * Maccabi Tel Aviv Euroleague Tracker
 * Main application logic
 */

// Constants
const MACCABI_TEAM_CODE = 'TEL';
const DATA_BASE_PATH = './data/';

// State
let appData = {
    standings: null,
    probabilities: null,
    recentGames: null,
    teamStats: null
};

/**
 * Initialize the application
 */
async function init() {
    console.log('Initializing Maccabi Euroleague Tracker...');

    // Set up event listeners
    setupEventListeners();

    // Load all data
    await loadAllData();

    // Render the UI
    renderUI();
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Probability info button
    const infoBtn = document.getElementById('probabilityInfoBtn');
    const modal = document.getElementById('probabilityModal');
    const closeBtn = document.getElementById('modalClose');

    if (infoBtn && modal) {
        infoBtn.addEventListener('click', () => {
            modal.classList.add('active');
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal) {
            modal.classList.remove('active');
        }
    });
}

/**
 * Load all data files
 */
async function loadAllData() {
    try {
        // Load data in parallel
        const [standings, probabilities, recentGames, teamStats] = await Promise.all([
            fetchJSON('standings.json'),
            fetchJSON('probabilities.json'),
            fetchJSON('recent_games.json'),
            fetchJSON('team_stats.json')
        ]);

        appData.standings = standings;
        appData.probabilities = probabilities;
        appData.recentGames = recentGames;
        appData.teamStats = teamStats;

        console.log('All data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data. Please try again later.');
    }
}

/**
 * Fetch JSON file
 */
async function fetchJSON(filename) {
    try {
        const response = await fetch(DATA_BASE_PATH + filename);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.warn(`Could not load ${filename}:`, error);
        return null;
    }
}

/**
 * Render the entire UI
 */
function renderUI() {
    updateLastUpdated();
    renderCurrentStanding();
    renderProbabilities();
    renderRecentGames();
    renderFullStandings();
}

/**
 * Update last updated timestamp
 */
function updateLastUpdated() {
    const element = document.getElementById('lastUpdated');
    if (!element) return;

    const timestamp = appData.probabilities?.last_updated ||
                     appData.standings?.last_updated ||
                     new Date().toISOString();

    const date = new Date(timestamp);
    element.textContent = `Last updated: ${formatDateTime(date)}`;
}

/**
 * Render current standing section
 */
function renderCurrentStanding() {
    const standings = appData.standings;
    const probabilities = appData.probabilities;

    if (!standings || !standings.maccabi_standing) {
        return;
    }

    const maccabi = standings.maccabi_standing;
    const stats = probabilities?.current_stats;

    // Position
    const positionEl = document.getElementById('currentPosition');
    if (positionEl) {
        positionEl.textContent = maccabi.position || stats?.position || '-';
    }

    // Record
    const recordEl = document.getElementById('currentRecord');
    if (recordEl) {
        const wins = maccabi.W || maccabi.Wins || maccabi.wins || 0;
        const losses = maccabi.L || maccabi.Losses || maccabi.losses || 0;
        recordEl.textContent = `${wins} - ${losses}`;
    }

    // Win percentage
    const winPctEl = document.getElementById('winPercentage');
    if (winPctEl) {
        const winPct = stats?.win_percentage || calculateWinPercentage(maccabi);
        winPctEl.textContent = `${winPct.toFixed(1)}%`;
    }

    // Games remaining
    const remainingEl = document.getElementById('gamesRemaining');
    if (remainingEl) {
        const remaining = stats?.games_remaining || '-';
        remainingEl.textContent = remaining;
    }
}

/**
 * Render probabilities section
 */
function renderProbabilities() {
    const probabilities = appData.probabilities;

    if (!probabilities || !probabilities.probabilities) {
        return;
    }

    const { playoff, final_four } = probabilities.probabilities;

    // Playoff probability
    const playoffProbEl = document.getElementById('playoffProb');
    const playoffBarEl = document.getElementById('playoffBar');

    if (playoffProbEl) {
        playoffProbEl.textContent = `${playoff}%`;
    }

    if (playoffBarEl) {
        setTimeout(() => {
            playoffBarEl.style.width = `${playoff}%`;
        }, 100);
    }

    // Final Four probability
    const finalFourProbEl = document.getElementById('finalFourProb');
    const finalFourBarEl = document.getElementById('finalFourBar');

    if (finalFourProbEl) {
        finalFourProbEl.textContent = `${final_four}%`;
    }

    if (finalFourBarEl) {
        setTimeout(() => {
            finalFourBarEl.style.width = `${final_four}%`;
        }, 100);
    }
}

/**
 * Render recent games section
 */
function renderRecentGames() {
    const gamesListEl = document.getElementById('gamesList');
    if (!gamesListEl) return;

    const gamesData = appData.recentGames;

    if (!gamesData || !gamesData.games || gamesData.games.length === 0) {
        gamesListEl.innerHTML = '<div class="loading">No recent games available</div>';
        return;
    }

    gamesListEl.innerHTML = '';

    gamesData.games.forEach(game => {
        const gameEl = createGameElement(game);
        gamesListEl.appendChild(gameEl);
    });
}

/**
 * Create a game element
 */
function createGameElement(game) {
    const div = document.createElement('div');

    // Get game details
    const homeTeam = game.Home || game.home || '';
    const awayTeam = game.Away || game.away || '';
    const homeScore = game.HomePoints || game.home_points || game.PointsHome || 0;
    const awayScore = game.AwayPoints || game.away_points || game.PointsAway || 0;
    const round = game.Round || game.round || '';

    // Determine if Maccabi is home or away
    const isMaccabiHome = homeTeam.includes('Maccabi') || homeTeam.includes('TEL');
    const isMaccabiAway = awayTeam.includes('Maccabi') || awayTeam.includes('TEL');

    // Determine win/loss
    let isWin = false;
    if (isMaccabiHome) {
        isWin = homeScore > awayScore;
    } else if (isMaccabiAway) {
        isWin = awayScore > homeScore;
    }

    const resultClass = isWin ? 'win' : 'loss';
    const resultText = isWin ? 'W' : 'L';

    div.className = `game-item ${resultClass}`;
    div.innerHTML = `
        <div class="game-info">
            <div class="game-round">Round ${round}</div>
            <div class="game-teams">${homeTeam} vs ${awayTeam}</div>
        </div>
        <div class="game-score">${homeScore} - ${awayScore}</div>
        <div class="game-result ${resultClass}">${resultText}</div>
    `;

    return div;
}

/**
 * Render full standings table
 */
function renderFullStandings() {
    const tableBody = document.querySelector('#standingsTable tbody');
    if (!tableBody) return;

    const standings = appData.standings;

    if (!standings || !standings.all_teams || standings.all_teams.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="loading">No standings available</td></tr>';
        return;
    }

    tableBody.innerHTML = '';

    standings.all_teams.forEach((team, index) => {
        const row = createStandingsRow(team, index + 1);
        tableBody.appendChild(row);
    });
}

/**
 * Create a standings table row
 */
function createStandingsRow(team, position) {
    const tr = document.createElement('tr');

    const teamCode = team.TeamCode || team.team_code || '';
    const teamName = team.Team || team.team || team.TeamName || team.team_name || '';
    const wins = team.W || team.Wins || team.wins || 0;
    const losses = team.L || team.Losses || team.losses || 0;
    const totalGames = wins + losses;
    const winPct = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0.0';

    // Add classes
    if (teamCode === MACCABI_TEAM_CODE || teamName.includes('Maccabi')) {
        tr.classList.add('maccabi');
    }

    if (position <= 8) {
        tr.classList.add('playoff-zone');
    }

    tr.innerHTML = `
        <td class="position">${position}</td>
        <td class="team-name">${teamName}</td>
        <td>${wins}</td>
        <td>${losses}</td>
        <td>${winPct}%</td>
    `;

    return tr;
}

/**
 * Calculate win percentage from team data
 */
function calculateWinPercentage(team) {
    const wins = team.W || team.Wins || team.wins || 0;
    const losses = team.L || team.Losses || team.losses || 0;
    const total = wins + losses;

    if (total === 0) return 0;

    return (wins / total) * 100;
}

/**
 * Format date and time
 */
function formatDateTime(date) {
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    return date.toLocaleDateString('en-US', options);
}

/**
 * Show error message
 */
function showError(message) {
    console.error(message);

    // You could add a toast notification or error banner here
    const container = document.querySelector('.container');
    if (container) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-banner';
        errorDiv.style.cssText = `
            background: #f44336;
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        `;
        errorDiv.textContent = message;
        container.insertBefore(errorDiv, container.firstChild);
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

/**
 * PWA: Service Worker Registration
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('ServiceWorker registered successfully:', registration.scope);

                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000); // Check every hour
            })
            .catch((error) => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

/**
 * PWA: Install Prompt Handler
 */
let deferredPrompt;
const installBanner = document.getElementById('installBanner');
const installButton = document.getElementById('installButton');
const dismissButton = document.getElementById('dismissInstall');

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default mini-infobar from appearing
    e.preventDefault();

    // Store the event so it can be triggered later
    deferredPrompt = e;

    // Check if user has previously dismissed the prompt
    const dismissed = localStorage.getItem('installPromptDismissed');
    const dismissedTime = localStorage.getItem('installPromptDismissedTime');

    // Show banner if not dismissed, or if 7 days have passed since dismissal
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const shouldShow = !dismissed ||
                      (dismissedTime && (Date.now() - parseInt(dismissedTime)) > sevenDaysInMs);

    if (shouldShow && installBanner) {
        setTimeout(() => {
            installBanner.classList.add('show');
        }, 3000); // Show after 3 seconds
    }
});

// Handle install button click
if (installButton) {
    installButton.addEventListener('click', async () => {
        if (!deferredPrompt) {
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        console.log(`User response to install prompt: ${outcome}`);

        // Clear the deferred prompt
        deferredPrompt = null;

        // Hide the banner
        if (installBanner) {
            installBanner.classList.remove('show');
        }
    });
}

// Handle dismiss button click
if (dismissButton) {
    dismissButton.addEventListener('click', () => {
        if (installBanner) {
            installBanner.classList.remove('show');
        }

        // Remember that user dismissed the prompt
        localStorage.setItem('installPromptDismissed', 'true');
        localStorage.setItem('installPromptDismissedTime', Date.now().toString());
    });
}

// Listen for successful installation
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed successfully');

    // Hide the banner if it's still showing
    if (installBanner) {
        installBanner.classList.remove('show');
    }

    // Clear the deferred prompt
    deferredPrompt = null;

    // Optional: Track installation analytics
    // trackEvent('pwa_install', { method: 'browser_prompt' });
});

/**
 * PWA: Handle iOS "Add to Home Screen" detection
 */
function isIOSDevice() {
    return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

function isInStandaloneMode() {
    return ('standalone' in window.navigator) && (window.navigator.standalone);
}

// Show custom iOS install instructions if needed
if (isIOSDevice() && !isInStandaloneMode()) {
    const dismissed = localStorage.getItem('iosInstallPromptDismissed');

    if (!dismissed && installBanner) {
        // Update the banner text for iOS users
        const bannerTitle = installBanner.querySelector('.install-banner-title');
        const bannerSubtitle = installBanner.querySelector('.install-banner-subtitle');

        if (bannerTitle && bannerSubtitle) {
            bannerTitle.textContent = 'Add to Home Screen';
            bannerSubtitle.textContent = 'Tap Share → Add to Home Screen';
        }

        // Hide the install button, show only dismiss
        if (installButton) {
            installButton.style.display = 'none';
        }

        // Show the banner after a delay
        setTimeout(() => {
            installBanner.classList.add('show');
        }, 5000);

        // Handle dismiss for iOS
        if (dismissButton) {
            dismissButton.addEventListener('click', () => {
                localStorage.setItem('iosInstallPromptDismissed', 'true');
            });
        }
    }
}

/**
 * PWA: Log if running in standalone mode
 */
if (isInStandaloneMode() || window.matchMedia('(display-mode: standalone)').matches) {
    console.log('Running as installed PWA');
    // Optional: Track PWA usage analytics
    // trackEvent('pwa_usage', { mode: 'standalone' });
}
