export class UI {
    constructor(initialState) {
        this.flipBtn = document.getElementById('flipBtn');
        this.coin = document.getElementById('coin');
        this.coinShadow = document.getElementById('coinShadow');
        this.resultElement = document.getElementById('result');
        this.totalFlips = document.getElementById('totalFlips');
        this.headsCount = document.getElementById('headsCount');
        this.tailsCount = document.getElementById('tailsCount');
        this.headsPercentage = document.getElementById('headsPercentage');
        this.currentStreak = document.getElementById('currentStreak');
        this.bestStreak = document.getElementById('bestStreak');
        this.recentHistory = document.getElementById('recentHistory');
        this.resetBtn = document.getElementById('resetBtn');
        this.statsBtn = document.getElementById('statsBtn');
        this.themeBtn = document.getElementById('themeBtn');
        this.liveRegion = document.getElementById('live-region');
        this.themeStorageKey = 'coinFlipTheme';
        this.audioContext = null;
        this.audioEnabled = true;
        this.isFlipping = false;
        this.initializeUI(initialState);
    }

    initializeUI(initialState) {
        const initialStats = initialState?.stats || {
            total: 0,
            heads: 0,
            tails: 0,
            headsPercentage: 0
        };

        this.showResult('Press the button to start!', false);
        this.updateStats(initialStats);
        this.updateHistory(initialState?.history || []);
        this.updateStreak(initialState?.streak || { current: 0, best: 0 });
        this.applyTheme(initialState?.theme || this.getSavedTheme());
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
        if (this.coinShadow) {
            this.coinShadow.classList.remove('active');
        }
        this.showResult('Flipping coin...');
        this.playFlipSound();

        const resultClass = result === 'heads' ? 'heads' : 'tails';
        const resultMessage = result === 'heads' ? "It's HEADS." : "It's TAILS.";
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            this.coin.classList.add(resultClass);
            this.playLandingSound();
            this.showResult(resultMessage, true);
            this.setFlipping(false);
            return;
        }

        if (typeof this.coin.animate === 'function') {
            const fullSpins = Math.floor(Math.random() * 4) + 6;
            const finalY = (fullSpins * 360) + (result === 'heads' ? 0 : 180);
            const tilt = Math.floor(Math.random() * 14) + 10;
            const lift = 18;

            const flipAnimation = this.coin.animate(
                [
                    { transform: 'translateY(0px) rotateY(0deg) rotateX(0deg) scale(1)', offset: 0 },
                    { transform: `translateY(-${lift}px) rotateY(${Math.round(finalY * 0.42)}deg) rotateX(${tilt}deg) scale(1.07)`, offset: 0.32 },
                    { transform: `translateY(-${Math.round(lift * 0.55)}px) rotateY(${Math.round(finalY * 0.78)}deg) rotateX(${Math.round(tilt * 0.45)}deg) scale(1.02)`, offset: 0.72 },
                    { transform: `translateY(0px) rotateY(${finalY}deg) rotateX(0deg) scale(1)`, offset: 1 }
                ],
                {
                    duration: 1550,
                    easing: 'cubic-bezier(0.15, 0.7, 0.2, 1)'
                }
            );

            let shadowAnimation = null;
            if (this.coinShadow && typeof this.coinShadow.animate === 'function') {
                shadowAnimation = this.coinShadow.animate(
                    [
                        { transform: 'translateX(-50%) scale(1)', opacity: 0.55, offset: 0 },
                        { transform: 'translateX(-50%) scale(0.72)', opacity: 0.3, offset: 0.3 },
                        { transform: 'translateX(-50%) scale(0.86)', opacity: 0.4, offset: 0.72 },
                        { transform: 'translateX(-50%) scale(1)', opacity: 0.55, offset: 1 }
                    ],
                    {
                        duration: 1550,
                        easing: 'cubic-bezier(0.15, 0.7, 0.2, 1)'
                    }
                );
            }

            flipAnimation.onfinish = () => {
                this.playLandingSound();
                this.coin.classList.add(resultClass);
                this.showResult(resultMessage, true);
                this.setFlipping(false);
                if (shadowAnimation) shadowAnimation.cancel();
            };

            flipAnimation.oncancel = () => {
                this.playLandingSound();
                this.coin.classList.add(resultClass);
                this.showResult(resultMessage, true);
                this.setFlipping(false);
                if (shadowAnimation) shadowAnimation.cancel();
            };

            return;
        }

        this.coin.classList.add('flipping');
        if (this.coinShadow) {
            this.coinShadow.classList.add('active');
        }
        setTimeout(() => {
            this.coin.classList.remove('flipping');
            this.coin.classList.add(resultClass);
            if (this.coinShadow) {
                this.coinShadow.classList.remove('active');
            }
            this.playLandingSound();
            this.showResult(resultMessage, true);
            this.setFlipping(false);
        }, 1500);
    }

    ensureAudioContext() {
        if (!this.audioEnabled) return null;

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) {
            this.audioEnabled = false;
            return null;
        }

        if (!this.audioContext) {
            try {
                this.audioContext = new AudioCtx();
            } catch {
                this.audioEnabled = false;
                return null;
            }
        }

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(() => {
                this.audioEnabled = false;
            });
        }

        return this.audioContext;
    }

    playTone({ frequencyStart, frequencyEnd, duration, gainValue, type = 'sine', whenOffset = 0 }) {
        const context = this.ensureAudioContext();
        if (!context) return;

        const now = context.currentTime + whenOffset;
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequencyStart, now);
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, frequencyEnd), now + duration);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start(now);
        oscillator.stop(now + duration + 0.02);
    }

    playFlipSound() {
        this.playTone({
            frequencyStart: 700,
            frequencyEnd: 260,
            duration: 0.13,
            gainValue: 0.018,
            type: 'triangle'
        });

        this.playTone({
            frequencyStart: 380,
            frequencyEnd: 240,
            duration: 0.1,
            gainValue: 0.012,
            type: 'sine',
            whenOffset: 0.085
        });
    }

    playLandingSound() {
        this.playTone({
            frequencyStart: 210,
            frequencyEnd: 140,
            duration: 0.085,
            gainValue: 0.02,
            type: 'triangle'
        });

        this.playTone({
            frequencyStart: 420,
            frequencyEnd: 280,
            duration: 0.07,
            gainValue: 0.012,
            type: 'sine',
            whenOffset: 0.015
        });
    }

    setFlipping(isFlipping) {
        this.isFlipping = isFlipping;
        if (this.flipBtn) {
            this.flipBtn.disabled = isFlipping;
            const btnText = this.flipBtn.querySelector('.btn-text');
            const btnIcon = this.flipBtn.querySelector('.btn-icon');
            if (isFlipping) {
                if (btnText) btnText.textContent = 'Flipping...';
                if (btnIcon) btnIcon.textContent = '...';
            } else {
                if (btnText) btnText.textContent = 'Flip Coin';
                if (btnIcon) btnIcon.textContent = 'GO';
            }
        }
    }

    updateStats(stats) {
        if (this.totalFlips) this.totalFlips.textContent = stats.total;
        if (this.headsCount) this.headsCount.textContent = stats.heads;
        if (this.tailsCount) this.tailsCount.textContent = stats.tails;
        if (this.headsPercentage) this.headsPercentage.textContent = `${stats.headsPercentage}%`;
    }

    updateHistory(history) {
        if (!this.recentHistory) return;

        if (!Array.isArray(history) || history.length === 0) {
            this.recentHistory.innerHTML = '<li class="history-empty">No flips yet.</li>';
            return;
        }

        this.recentHistory.innerHTML = history
            .map((result, index) => {
                const label = result === 'heads' ? 'Heads' : 'Tails';
                return `<li class="history-item ${result}">#${index + 1} ${label}</li>`;
            })
            .join('');
    }

    updateStreak(streak) {
        if (this.currentStreak) this.currentStreak.textContent = streak.current;
        if (this.bestStreak) this.bestStreak.textContent = streak.best;
    }

    getSavedTheme() {
        const savedTheme = localStorage.getItem(this.themeStorageKey);
        return savedTheme === 'light' ? 'light' : 'dark';
    }

    saveTheme(theme) {
        localStorage.setItem(this.themeStorageKey, theme);
    }

    applyTheme(theme) {
        const activeTheme = theme === 'light' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', activeTheme);

        if (this.themeBtn) {
            const icon = this.themeBtn.querySelector('.icon-pill');
            const labelEl = this.themeBtn.querySelector('.theme-label');
            const label = activeTheme === 'light' ? 'Dark' : 'Light';
            if (icon) icon.textContent = activeTheme === 'light' ? 'DK' : 'LT';
            if (labelEl) labelEl.textContent = label;
            this.themeBtn.setAttribute('aria-label', `Switch to ${label.toLowerCase()} theme`);
        }
    }

    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(nextTheme);
        this.saveTheme(nextTheme);
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
        this.showResult('Application error', false);
        this.setFlipping(false);
    }
}
