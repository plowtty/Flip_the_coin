import { CoinFlipGame } from './game/CoinFlipGame.js';
import { GameUtils } from './utils/GameUtils.js';

let game;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (!GameUtils.checkBrowserSupport()) {
            console.warn('Browser may not support all features');
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
                resultText.textContent = 'Error loading game';
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
        return Promise.reject(new Error('Game not ready'));
    },

    getStats() {
        return game ? game.getGameStats() : null;
    },

    reset() {
        if (game && game.isInitialized) {
            return game.handleReset();
        }
        return Promise.reject(new Error('Game not ready'));
    },

    isReady() {
        return game ? game.isGameActive() : false;
    }
};
