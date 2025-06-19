class Coin {
    constructor() {
        this.stats = {
            total: 0,
            heads: 0,
            tails: 0
        };
    }

    flip() {
        const result = Math.random() < 0.5 ? 'Cara' : 'Cruz';
        this.updateStats(result);
        return result;
    }

    updateStats(result) {
        this.stats.total++;
        if (result === 'Cara') {
            this.stats.heads++;
        } else {
            this.stats.tails++;
        }
    }

    getStats() {
        return {
            ...this.stats,
            headsPercentage: this.stats.total > 0 
                ? Math.round((this.stats.heads / this.stats.total) * 100) 
                : 0
        };
    }

    resetStats() {
        this.stats = {
            total: 0,
            heads: 0,
            tails: 0
        };
    }
}

class UI {
    constructor() {
        this.flipBtn = document.getElementById('flipBtn');
        this.coin = document.getElementById('coin');
        this.resultElement = document.getElementById('result');
        this.totalFlips = document.getElementById('totalFlips');
        this.headsCount = document.getElementById('headsCount');
        this.tailsCount = document.getElementById('tailsCount');
        this.headsPercentage = document.getElementById('headsPercentage');
        this.resetBtn = document.getElementById('resetBtn');
        this.statsBtn = document.getElementById('statsBtn');
        this.liveRegion = document.getElementById('live-region');
        this.isFlipping = false;
        this.initializeUI();
    }

    initializeUI() {
        this.showResult('¡Press the botton for start', false);
        this.updateStats({
            total: 0,
            heads: 0,
            tails: 0,
            headsPercentage: 0
        });
    }

    showResult(message, isWinner = false) {
        const resultText = this.resultElement.querySelector('.result-text');
        if (resultText) {
            resultText.textContent = message;
            if (isWinner) {
                resultText.classList.add('winner');
                setTimeout(() => {
                    resultText.classList.remove('winner');
                }, 600);
            }
        }
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
        }
    }

    animateCoin(result) {
        if (!this.coin) return;
        this.setFlipping(true);
        this.coin.classList.remove('heads', 'tails', 'flipping');
        this.coin.classList.add('flipping');
        this.showResult('¡Lanzando moneda...!');
        setTimeout(() => {
            this.coin.classList.remove('flipping');
            const resultClass = result === 'Cara' ? 'heads' : 'tails';
            this.coin.classList.add(resultClass);
            const resultMessage = result === 'Cara' ? "🎉 It's HEADS!" : "⚔️ It's TAILS!";
            this.showResult(resultMessage, true);
            this.setFlipping(false);
        }, 1500);
    }

    setFlipping(isFlipping) {
        this.isFlipping = isFlipping;
        if (this.flipBtn) {
            this.flipBtn.disabled = isFlipping;
            const btnText = this.flipBtn.querySelector('.btn-text');
            const btnIcon = this.flipBtn.querySelector('.btn-icon');
            if (isFlipping) {
                if (btnText) btnText.textContent = 'Flipping...';
                if (btnIcon) btnIcon.textContent = '🌀';
            } else {
                if (btnText) btnText.textContent = 'Flip the coin';
                if (btnIcon) btnIcon.textContent = '🎯';
            }
        }
    }

    updateStats(stats) {
        if (this.totalFlips) this.totalFlips.textContent = stats.total;
        if (this.headsCount) this.headsCount.textContent = stats.heads;
        if (this.tailsCount) this.tailsCount.textContent = stats.tails;
        if (this.headsPercentage) this.headsPercentage.textContent = `${stats.headsPercentage}%`;
    }

    showResetConfirmation() {
        return confirm('Are you sure you want to reset the statistics?');
    }

    showStatsMessage() {
        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            statsSection.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            statsSection.style.animation = 'pulse 0.6s ease-out';
            setTimeout(() => {
                statsSection.style.animation = '';
            }, 600);
        }
    }

    handleError(error) {
        console.error('UI Error:', error);
        this.showResult('❌ Application error', false);
        this.setFlipping(false);
    }
}

class CoinFlipGame {
    constructor() {
        this.coin = null;
        this.ui = null;
        this.isInitialized = false;
    }

    async init() {
        try {
            this.showLoading(true);
            await this.delay(1000);
            this.coin = new Coin();
            this.ui = new UI();
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
            this.ui.animateCoin(result);
            const stats = this.coin.getStats();
            this.ui.updateStats(stats);
        } catch (error) {
            this.ui.handleError(error);
        }
    }

    handleReset() {
        try {
            if (!this.ui.showResetConfirmation()) return;
            this.coin.resetStats();
            const stats = this.coin.getStats();
            this.ui.updateStats(stats);
            if (this.ui.coin) {
                this.ui.coin.classList.remove('heads', 'tails', 'flipping');
            }
            this.ui.showResult('🔄 Statistics reset');
        } catch (error) {
            this.ui.handleError(error);
        }
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
            this.ui.showResult(`❌ ${message}`, false);
        }
        this.showLoading(false);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getGameStats() {
        if (!this.isInitialized || !this.coin) return null;
        return this.coin.getStats();
    }

    isGameActive() {
        return this.isInitialized && !this.ui.isFlipping;
    }
}

const GameUtils = {
    formatNumber(num) {
        return new Intl.NumberFormat('es-ES').format(num);
    },
    calculatePercentage(part, total) {
        if (total === 0) return 0;
        return Math.round((part / total) * 100);
    },
    checkBrowserSupport() {
        const features = {
            css3d: 'transform-style' in document.body.style,
            css3: 'borderRadius' in document.body.style,
            es6: typeof Symbol !== 'undefined'
        };
        const unsupported = Object.keys(features).filter(feature => !features[feature]);
        if (unsupported.length > 0) {
            console.warn('⚠️ Algunas características no son soportadas:', unsupported);
        }
        return unsupported.length === 0;
    },
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
};

// ===== INICIALIZACIÓN =====
let game;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (!GameUtils.checkBrowserSupport()) {
            console.warn('⚠️ Browser may not support all features');
        }
        if (GameUtils.isMobile()) {
            document.body.classList.add('mobile-device');
        }
        game = new CoinFlipGame();
        await game.init();
        window.coinFlipGame = game;
    } catch (error) {
        const resultElement = document.getElementById('result');
        if (resultElement) {
            const resultText = resultElement.querySelector('.result-text');
            if (resultText) {
                resultText.textContent = '❌ Error al cargar el juego';
            }
        }
    }
});

window.addEventListener('error', (event) => {
    if (game && game.ui) {
        game.ui.handleError(event.error);
    }
});
window.addEventListener('unhandledrejection', (event) => {
    if (game && game.ui) {
        game.ui.handleError(event.reason);
    }
});

window.CoinFlipAPI = {
    flip() {
        if (game && game.isGameActive()) {
            return game.handleFlip();
        }
        return Promise.reject('Game not ready');
    },
    getStats() {
        return game ? game.getGameStats() : null;
    },
    reset() {
        if (game && game.isInitialized) {
            return game.handleReset();
        }
        return Promise.reject('Game not ready');
    },
    isReady() {
        return game ? game.isGameActive() : false;
    }
}
