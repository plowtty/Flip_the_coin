# Coin Flip Game

A modern coin flip demo focused on polished UX, motion, and clean frontend architecture.

## Features

- Modern UI with dark/light theme toggle
- Premium coin animation with dynamic motion on each flip
- Dynamic shadow under the coin synchronized with animation
- Subtle generated sound effects (flip + landing) using Web Audio API
- Statistics: total, heads, tails, heads percentage
- Streak tracking: current streak + best streak
- Recent history panel (last 5 flips)
- Persistent state in `localStorage` (stats, streak, history, theme)
- Accessible interactions (`aria-live`, keyboard controls, focus-visible)
- Respects reduced-motion user preference
- Responsive layout for desktop and mobile
- Global API via `window.CoinFlipAPI`

## Project Structure

```
index.html                  # App layout + module entrypoint
style.css                   # Theme, UI system, responsive design, motion styles
js/main.js                  # Bootstrap + global API exposure
js/core/Coin.js             # Domain model and coin stats logic
js/ui/UI.js                 # DOM rendering, animation, sound, interactions
js/game/CoinFlipGame.js     # Orchestrator and state workflow
js/utils/GameUtils.js       # Feature detection + helpers
.github/workflows/deploy-pages.yml  # Auto-deploy to GitHub Pages
Readme.txt                  # Project documentation
```

## Run Locally

Option 1 (quick):
1. Open `index.html` directly in your browser.

Option 2 (recommended):
1. Start a local static server:

```bash
npx --yes serve .
```

2. Open:
- `http://localhost:3000`

## Keyboard Shortcuts

- **Space / Enter**: Flip the coin
- **R**: Reset all game statistics
- **S**: Scroll/highlight stats section
- **T**: Toggle light/dark theme

## Global API

You can control the app from browser console:

```js
window.CoinFlipAPI.flip();      // Trigger coin flip
window.CoinFlipAPI.getStats();  // Return stats + streak + history
window.CoinFlipAPI.reset();     // Reset state
window.CoinFlipAPI.isReady();   // App ready status
```

## Publish Demo (Recommended)

For portfolio/recruiters, deploy a public URL:
- GitHub Pages (already configured via workflow)
- Netlify
- Vercel

Suggested order:
1. Push latest code to GitHub
2. Deploy to one platform
3. Add public URL to repository description and CV

Expected GitHub Pages URL for this repository:
- `https://plowtty.github.io/Flip_the_coin/`

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Web Animations API
- Web Audio API

## Current Architecture Note

The app now uses a modular structure with ES Modules and folder separation.

- `Coin` handles domain logic (stats and percentage)
- `UI` handles rendering/interaction (theme, animation, audio, history view)
- `CoinFlipGame` coordinates app state and flows
- `GameUtils` isolates environment checks and helpers

For future scaling, the next optional step is splitting `UI` into dedicated managers:
- `ThemeManager`
- `AudioManager`
- `MotionManager`
- `HistoryRenderer`