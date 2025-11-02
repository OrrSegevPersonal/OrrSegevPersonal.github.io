// Water Tracker App
class WaterTracker {
    constructor() {
        this.currentAmount = 0;
        this.dailyGoal = 2000;
        this.history = [];
        this.todayKey = this.getTodayKey();

        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateDisplay();
        this.showMotivationalTip();
        this.displayCurrentDate();
        this.registerServiceWorker();
    }

    getTodayKey() {
        const today = new Date();
        return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    }

    loadData() {
        const savedData = localStorage.getItem(`waterTracker_${this.todayKey}`);
        if (savedData) {
            const data = JSON.parse(savedData);
            this.currentAmount = data.currentAmount || 0;
            this.history = data.history || [];
        }

        const savedGoal = localStorage.getItem('waterTracker_goal');
        if (savedGoal) {
            this.dailyGoal = parseInt(savedGoal);
            document.getElementById('goalInput').value = this.dailyGoal;
        }
    }

    saveData() {
        const data = {
            currentAmount: this.currentAmount,
            history: this.history
        };
        localStorage.setItem(`waterTracker_${this.todayKey}`, JSON.stringify(data));
    }

    saveGoal() {
        localStorage.setItem('waterTracker_goal', this.dailyGoal.toString());
    }

    setupEventListeners() {
        // Quick add buttons
        document.querySelectorAll('.add-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = parseInt(btn.dataset.amount);
                this.addWater(amount);
            });
        });

        // Custom add button
        document.getElementById('addCustomBtn').addEventListener('click', () => {
            const input = document.getElementById('customAmount');
            const amount = parseInt(input.value);
            if (amount && amount > 0) {
                this.addWater(amount);
                input.value = '';
            } else {
                this.showNotification('Please enter a valid amount', 'error');
            }
        });

        // Custom amount enter key
        document.getElementById('customAmount').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('addCustomBtn').click();
            }
        });

        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all water intake for today?')) {
                this.clearAll();
            }
        });

        // Goal input change
        document.getElementById('goalInput').addEventListener('change', (e) => {
            const newGoal = parseInt(e.target.value);
            if (newGoal >= 500 && newGoal <= 5000) {
                this.dailyGoal = newGoal;
                this.saveGoal();
                this.updateDisplay();
            } else {
                e.target.value = this.dailyGoal;
                this.showNotification('Goal must be between 500ml and 5000ml', 'error');
            }
        });
    }

    addWater(amount) {
        const wasGoalReached = this.currentAmount >= this.dailyGoal;

        this.currentAmount += amount;

        const entry = {
            amount: amount,
            time: new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }),
            timestamp: Date.now()
        };

        this.history.unshift(entry);
        this.saveData();
        this.updateDisplay();

        // Check if goal was just reached
        if (!wasGoalReached && this.currentAmount >= this.dailyGoal) {
            this.showNotification('🎉 Congratulations! You reached your daily goal!', 'goal-reached');
        } else {
            this.showNotification(`Added ${amount}ml 💧`, 'success');
        }
    }

    deleteEntry(timestamp) {
        const entry = this.history.find(e => e.timestamp === timestamp);
        if (entry) {
            this.currentAmount -= entry.amount;
            this.history = this.history.filter(e => e.timestamp !== timestamp);
            this.saveData();
            this.updateDisplay();
            this.showNotification('Entry removed', 'success');
        }
    }

    clearAll() {
        this.currentAmount = 0;
        this.history = [];
        this.saveData();
        this.updateDisplay();
        this.showNotification('All entries cleared', 'success');
    }

    updateDisplay() {
        // Update current amount
        document.getElementById('currentAmount').textContent = this.currentAmount;

        // Update progress percentage
        const percentage = Math.min(Math.round((this.currentAmount / this.dailyGoal) * 100), 100);
        document.getElementById('progressPercentage').textContent = `${percentage}%`;

        // Update progress ring
        const circumference = 339.292; // 2 * PI * 54
        const offset = circumference - (percentage / 100) * circumference;
        document.getElementById('progressRing').style.strokeDashoffset = offset;

        // Update history
        this.updateHistory();
    }

    updateHistory() {
        const historyList = document.getElementById('historyList');

        if (this.history.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💧</div>
                    <div>No water intake recorded yet today</div>
                </div>
            `;
            return;
        }

        historyList.innerHTML = this.history.map(entry => `
            <div class="history-item">
                <div class="history-item-info">
                    <div class="history-amount">${entry.amount}ml</div>
                    <div class="history-time">${entry.time}</div>
                </div>
                <button class="delete-btn" onclick="waterTracker.deleteEntry(${entry.timestamp})">
                    Remove
                </button>
            </div>
        `).join('');
    }

    showNotification(message, type = '') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;

        // Trigger reflow to restart animation
        void notification.offsetWidth;

        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    displayCurrentDate() {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const today = new Date();
        document.getElementById('currentDate').textContent = today.toLocaleDateString('en-US', options);
    }

    showMotivationalTip() {
        const tips = [
            'Stay hydrated! 🌊',
            'Water is essential for life 💧',
            'Drink water regularly throughout the day ⏰',
            'Your body is 60% water - keep it topped up! 💪',
            'Hydration improves focus and energy ⚡',
            'Start your day with a glass of water 🌅',
            'Listen to your body - drink when thirsty 👂',
            'Water helps maintain healthy skin ✨'
        ];

        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        document.getElementById('motivationTip').textContent = randomTip;
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }
}

// Initialize the app
let waterTracker;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        waterTracker = new WaterTracker();
    });
} else {
    waterTracker = new WaterTracker();
}

// Handle iOS standalone mode
if (window.navigator.standalone === true) {
    console.log('Running as standalone app on iOS');
}

// Prevent pull-to-refresh on iOS
document.body.addEventListener('touchmove', function(e) {
    if (e.touches.length > 1) {
        return;
    }

    const element = e.target;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const height = element.offsetHeight;
    const clientY = e.touches[0].clientY;

    if (scrollTop === 0 && clientY > 0) {
        e.preventDefault();
    } else if (scrollHeight - scrollTop <= height && clientY < 0) {
        e.preventDefault();
    }
}, { passive: false });
