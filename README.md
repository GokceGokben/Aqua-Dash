# Aqua Dash

**Aqua Dash** is a high-performance, mobile-optimized infinite arcade survival game. Dive into the mysterious depths of the ocean, master the buoyancy of your clownfish, and survive the treacherous pipes as you descent into the abyss.

https://gokcegokben.github.io/Aqua-Dash/

## Gameplay Features

- **Unique Buoyancy Mechanics**: The ocean's pressure pushes you **UP**. You must tap or click to **DIVE** deeper and maintain control.
- **Dynamic Underwater Environment**: Procedural ocean background with drifting light rays and bubble particle effects.
- **Hidden Rewards**: Reach a score of **?** to trigger a vibrant **Confetti Celebration**!
- **Progressive Difficulty**: The currents get faster and the gaps tighter the deeper you dive.

## Mobile & PWA Ready

Aqua Dash is a **Progressive Web App**. You can install it directly on your device:
- **iOS**: Tap 'Share' -> 'Add to Home Screen'.
- **Android**: Tap the menu dots -> 'Install App'.
Once installed, the game works **offline** and provides a full-screen, native-like experience.

## Technical Stack

- **Engine**: Vanilla JavaScript (ES6+)
- **Rendering**: HTML5 Canvas API with custom pixel-art styling.
- **Styling**: Modern CSS3 using Dynamic Viewport units (`dvh`) and HSL color spaces.
- **Offline Support**: Service Worker API for asset caching.
- **Fonts**: 'Press Start 2P' & 'VT323' from Google Fonts.

## Project Architecture

The game is built using a modular Vanilla JavaScript architecture:

- **Game Engine (`src/engine/`)**: Core physics, state management, and rendering.
- **Components (`src/components/`)**: UI and DOM interaction layer.
- **Utilities (`src/utils/`)**: Asset processing and helpers.

## Project Structure

```text
.
├── assets/             # Game assets (images, music, SFX)
├── src/                # Source code
│   ├── components/     # UI components
│   ├── engine/         # Game logic and engine
│   ├── utils/          # Helpers and image tools
│   └── main.js         # Entry point
├── index.html          # Main HTML container
├── style.css           # Global styles and animations
├── sw.js               # Service Worker (Offline/PWA)
├── manifest.webmanifest # PWA metadata
├── package.json        # Build scripts
└── LICENSE             # MIT License
```

## Getting Started

### Prerequisites
- **Node.js**: Recommended version **v20.19.6** (Standard LTS).

### Installation
1. Clone the repository:

   # Aqua Dash

   Infinite underwater dash arcade game. Survive the pipes, collect your high score, and dive deep!

   ---

   ## Requirements

   - **Node.js:** >= 20.11.0
   - **npm:** >= 10
   - Modern browser (Chrome, Edge, Safari, Firefox recommended)

   ## Quick Start

   1. **Install dependencies:**
       ```bash
       npm install
       ```
   2. **Start development server:**
       ```bash
       npm run dev
       ```
   3. Open [http://localhost:5173](http://localhost:5173) in your browser.

   ## Gameplay

   - **Goal:** Dash through endless pipes underwater. The longer you survive, the higher your score!
   - **Controls:**
      - **Space / Tap / Click:** Dive/Dash to swim.
      - **Escape / P:** Pause the game.
   - **Tips:** Timing is key! Avoid pipes and keep an eye on your score.

   ## Easter Egg

   - **Secret:** If you reach a score above **?**, a hidden surprise (easter egg) will appear! Can you find it?

   ## Installation (PWA)
   You can install Aqua Dash as an application on your mobile device or desktop:
   1. Open the game in Chrome, Safari, or Edge.
   2. Select **"Install"** or **"Add to Home Screen"** from the browser menu.
   3. Launch Aqua Dash directly from your app drawer.

   ## Build & Deploy

   - **Build for production:**
      ```bash
      npm run build
      ```
   - **Preview production build:**
      ```bash
      npm run preview
      ```

   ## Credits
   Special thanks to the creators whose assets made this game possible:

   - **Music:** [bursanchank](https://pixabay.com/users/bursanchank-53686561/) from Pixabay.
   - **Sound Effects:** [DRAGON-STUDIO](https://pixabay.com/users/dragon-studio-38165424/) from Pixabay.
   - **Game Design & Dev:** Antigravity (Powered by Gemini).

   ---
   *Dive into the mysterious depths of the ocean. Discover what lies beneath...*
*Stay deep, stay alive.*
