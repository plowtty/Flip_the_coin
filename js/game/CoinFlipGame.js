import { Coin } from '../core/Coin.js';
import { UI } from '../ui/UI.js';

export class CoinFlipGame {
    constructor() {
        this.storageKey = 'coinFlipState';
        this.maxHistory = 5;
        this.coin = null;
        this.ui = null;
        this.isInitialized = false;
        this.state = {
            history: [],
            streak: {
                current: 0,
                best: 0,
                side: null
            },
            theme: 'dark'
        };
    }

    async init() {
        try {
            this.showLoading(true);
            await this.delay(1000);
            const savedState = this.loadState();
            const persistedState = savedState || {};
            const fallbackTheme = localStorage.getItem('coinFlipTheme') === 'light' ? 'light' : 'dark';
            this.state = {
                ...this.state,
                ...persistedState,
                theme: persistedState.theme || fallbackTheme,
                streak: {
                    ...this.state.streak,
                    ...(persistedState.streak || {})
                }
            };

            this.coin = new Coin(persistedState.stats || null);
            this.ui = new UI({
                stats: this.coin.getStats(),
                history: this.state.history,
                streak: this.state.streak,
                theme: this.state.theme
            });
            this.setupEventListeners();
            this.isInitialized = true;
            this.showLoading(false);
        } catch (error) {
            this.showError('Error initializing the game');
        }
    }

    setupEventListeners() {
        if (this.ui.flipBtn) {
            this.ui.flipBtn.addEventListener('click', (event) => {
                this.handleFlip(event);
            });
        }
        if (this.ui.resetBtn) {
            this.ui.resetBtn.addEventListener('click', () => {
                this.handleReset();
            });
        }
        if (this.ui.statsBtn) {
            this.ui.statsBtn.addEventListener('click', () => {
                this.ui.showStatsMessage();
            });
        }
        if (this.ui.themeBtn) {
            this.ui.themeBtn.addEventListener('click', () => {
                this.ui.toggleTheme();
                this.state.theme = document.body.getAttribute('data-theme') || 'dark';
                this.saveState();
            });
        }
        if (this.ui.coin) {
            this.ui.coin.addEventListener('click', (event) => {
                if (!this.ui.isFlipping) {
                    this.handleFlip(event);
                }
            });
        }
        document.addEventListener('keydown', (event) => {
            this.handleKeyboard(event);
        });
    }

    async handleFlip(event) {
        try {
            if (this.ui.isFlipping) return;
            const result = this.coin.flip();
            this.updateStreak(result);
            this.updateHistory(result);
            this.ui.animateCoin(result);
            this.syncUIState();
            this.saveState();
        } catch (error) {
            this.ui.handleError(error);
        }
    }

    handleReset() {
        try {
            if (!this.ui.showResetConfirmation()) return;
            this.coin.resetStats();
            this.resetDerivedState();
            if (this.ui.coin) {
                this.ui.coin.classList.remove('heads', 'tails', 'flipping');
            }
            this.ui.showResult('Statistics reset');
            this.syncUIState();
            this.saveState();
        } catch (error) {
            this.ui.handleError(error);
        }
    }

    loadState() {
        try {
            const rawState = localStorage.getItem(this.storageKey);
            if (!rawState) return null;

            const parsedState = JSON.parse(rawState);

            if (parsedState && Number.isFinite(parsedState.total)) {
                return {
                    stats: {
                        total: Number.isFinite(parsedState.total) ? parsedState.total : 0,
                        heads: Number.isFinite(parsedState.heads) ? parsedState.heads : 0,
                        tails: Number.isFinite(parsedState.tails) ? parsedState.tails : 0
                    },
                    history: [],
                    streak: {
                        current: 0,
                        best: 0,
                        side: null
                    },
                    theme: localStorage.getItem('coinFlipTheme') === 'light' ? 'light' : 'dark'
                };
            }

            return {
                stats: {
                    total: Number.isFinite(parsedState?.stats?.total) ? parsedState.stats.total : 0,
                    heads: Number.isFinite(parsedState?.stats?.heads) ? parsedState.stats.heads : 0,
                    tails: Number.isFinite(parsedState?.stats?.tails) ? parsedState.stats.tails : 0
                },
                history: Array.isArray(parsedState?.history)
                    ? parsedState.history.filter((entry) => entry === 'heads' || entry === 'tails').slice(0, this.maxHistory)
                    : [],
                streak: {
                    current: Number.isFinite(parsedState?.streak?.current) ? Math.max(0, parsedState.streak.current) : 0,
                    best: Number.isFinite(parsedState?.streak?.best) ? Math.max(0, parsedState.streak.best) : 0,
                    side: parsedState?.streak?.side === 'heads' || parsedState?.streak?.side === 'tails'
                        ? parsedState.streak.side
                        : null
                },
                theme: parsedState?.theme === 'light' ? 'light' : 'dark'
            };
        } catch (error) {
            console.warn('Could not load saved state:', error);
            return null;
        }
    }

    saveState() {
        try {
            const stats = this.coin.getStats();
            localStorage.setItem(this.storageKey, JSON.stringify({
                stats: {
                    total: stats.total,
                    heads: stats.heads,
                    tails: stats.tails
                },
                history: this.state.history,
                streak: this.state.streak,
                theme: this.state.theme
            }));
            localStorage.setItem('coinFlipTheme', this.state.theme);
        } catch (error) {
            console.warn('Could not save state:', error);
        }
    }

    updateHistory(result) {
        this.state.history.unshift(result);
        this.state.history = this.state.history.slice(0, this.maxHistory);
    }

    updateStreak(result) {
        if (this.state.streak.side === result) {
            this.state.streak.current += 1;
        } else {
            this.state.streak.current = 1;
            this.state.streak.side = result;
        }

        if (this.state.streak.current > this.state.streak.best) {
            this.state.streak.best = this.state.streak.current;
        }
    }

    resetDerivedState() {
        this.state.history = [];
        this.state.streak = {
            current: 0,
            best: 0,
            side: null
        };
    }

    syncUIState() {
        const stats = this.coin.getStats();
        this.ui.updateStats(stats);
        this.ui.updateHistory(this.state.history);
        this.ui.updateStreak(this.state.streak);
    }

    handleKeyboard(event) {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
        switch (event.key.toLowerCase()) {
            case ' ':
            case 'enter':
                event.preventDefault();
                if (!this.ui.isFlipping) this.handleFlip(event);
                break;
            case 'r':
                event.preventDefault();
                this.handleReset();
                break;
            case 's':
                event.preventDefault();
                this.ui.showStatsMessage();
                break;
            case 't':
                event.preventDefault();
                this.ui.toggleTheme();
                this.state.theme = document.body.getAttribute('data-theme') || 'dark';
                this.saveState();
                break;
        }
    }

    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            if (show) {
                loadingOverlay.classList.add('active');
                loadingOverlay.setAttribute('aria-hidden', 'false');
            } else {
                loadingOverlay.classList.remove('active');
                loadingOverlay.setAttribute('aria-hidden', 'true');
            }
        }
    }

    showError(message) {
        if (this.ui) {
            this.ui.showResult(message, false);
        }
        this.showLoading(false);
    }

    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    getGameStats() {
        if (!this.isInitialized || !this.coin) return null;
        return {
            ...this.coin.getStats(),
            streak: {
                current: this.state.streak.current,
                best: this.state.streak.best,
                side: this.state.streak.side
            },
            history: [...this.state.history]
        };
    }

    isGameActive() {
        return this.isInitialized && !this.ui.isFlipping;
    }
}
