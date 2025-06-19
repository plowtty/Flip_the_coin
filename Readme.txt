# Coin Flip Game

An interactive virtual coin toss game built with **HTML**, **CSS**, and **JavaScript**.

## Features

- Realistic coin flip animation
- Tracks statistics: total flips, heads, tails, and heads percentage
- Reset statistics button
- Stats panel with smooth highlight
- Keyboard accessibility (flip, reset, show stats)
- Responsive design for desktop and mobile
- Loading overlay on startup
- Accessible for screen readers
- Exposes a global API (`window.CoinFlipAPI`) for integrations

## Project Structure

```
Index.html      # Main HTML file
style.css       # Styles and animations
script.js       # Game logic and UI
```

## Usage

1. Open `Index.html` in your browser.
2. Click "Flip Coin" or press Space/Enter to flip the coin.
3. View results and statistics below the coin.
4. Use "Reset" to clear stats, or "Stats" to highlight the stats panel.

## Keyboard Shortcuts

- **Space / Enter**: Flip the coin
- **R**: Reset statistics
- **S**: Highlight stats panel

## Global API

You can control the game from the browser console:

```js
window.CoinFlipAPI.flip();      // Flip the coin
window.CoinFlipAPI.getStats();  // Get current statistics
window.CoinFlipAPI.reset();     // Reset statistics
window.CoinFlipAPI.isReady();   // Check if the game is ready
```

## Technologies

- HTML5
- CSS3 (with animations and glassmorphism)
- JavaScript (ES6+)

## Credits

Built by [Your Name].

---

Enjoy flipping the coin and testing your luck!