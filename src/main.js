import { Game } from './engine/Game.js';
import { GameUI } from './components/GameUI.js';
import { prepareTransparentAsset } from './utils/imageTools.js';

const canvas = document.getElementById('game-canvas');
const ui = new GameUI();
const game = new Game(canvas, ui);

const backgroundVideo = document.createElement('video');
backgroundVideo.src = './assets/bg.mp4';
backgroundVideo.loop = true;
backgroundVideo.muted = true;
backgroundVideo.playsInline = true;
backgroundVideo.autoplay = true;


window.backgroundMusic = new Audio('./assets/music.mp3');
window.backgroundMusic.loop = true;
window.backgroundMusic.volume = 0.315;
const backgroundMusic = window.backgroundMusic;

const bubbleSoundPool = Array.from({ length: 6 }, () => {
  const audio = new Audio('./assets/bubble_sound.mp3');
  audio.preload = 'auto';
  return audio;
});

let bubbleMuted = false;
let musicMuted = false;
let musicVolume = 70;
let bubblePoolIndex = 0;

async function initAssets() {
  const [fish, pipe, bubble] = await Promise.all([
    prepareTransparentAsset('./assets/fish.jpg', 220),
    prepareTransparentAsset('./assets/Pipe.JPG', 215),
    prepareTransparentAsset('./assets/bubble.gif', 230)
  ]);

  game.setAssets({ fish, pipe, bubble, backgroundVideo });
}

function startBackgroundVideo() {
  backgroundVideo.play().catch(() => {});
}

function startBackgroundMusic() {
  if (musicMuted || musicVolume <= 0) return;
  backgroundMusic.volume = (musicVolume / 100) * 0.45;
  backgroundMusic.play().catch(() => {});
}

function playBubbleSound() {
  if (bubbleMuted) return;

  const audio = bubbleSoundPool[bubblePoolIndex];
  bubblePoolIndex = (bubblePoolIndex + 1) % bubbleSoundPool.length;

  audio.currentTime = 0;
  audio.volume = 1;
  audio.play().catch(() => {});
}

function setBubbleMuted(nextMuted) {
  bubbleMuted = nextMuted;
  ui.setBubbleLabel(bubbleMuted);
}

function toggleBubbleMuted() {
  setBubbleMuted(!bubbleMuted);
}

function setMusicVolume(nextVolume) {
  musicVolume = Math.max(0, Math.min(100, Math.round(nextVolume)));
  ui.setMusicVolume(musicVolume);

  if (!musicMuted) {
    backgroundMusic.volume = (musicVolume / 100) * 0.45;
  }
}

function setMusicMuted(nextMuted) {
  musicMuted = nextMuted;
  ui.setMusicLabel(musicMuted);

  if (musicMuted) {
    backgroundMusic.pause();
  } else {
    startBackgroundMusic();
  }
}

function toggleMusicMuted() {
  setMusicMuted(!musicMuted);
}

function stopAllGameAudio() {
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;

  for (const audio of bubbleSoundPool) {
    audio.pause();
    audio.currentTime = 0;
  }
}

game.setGameOverHandler(() => {
  stopAllGameAudio();
});

window.addEventListener(
  'keydown',
  (event) => {
    if (event.code === 'Escape' || event.code === 'KeyP') {
      event.preventDefault();
      if (game.state === 'PLAYING') {
        game.pause();
      } else if (game.state === 'PAUSED') {
        game.resume();
      }
      return;
    }

    if (game.state === 'PAUSED') {
      return;
    }

    if (game.state === 'PAUSED') {
      return;
    }

    if (event.code === 'Tab' || event.code === 'Space') {
      event.preventDefault();
      startBackgroundVideo();
      startBackgroundMusic();
      playBubbleSound();
      game.onDiveInput();
    }
  },
  { passive: false }
);

window.addEventListener(
  'pointerdown',
  (event) => {
    if (event.target.closest('button')) {
      return;
    }

    if (game.state === 'PAUSED') {
      return;
    }

    startBackgroundVideo();
    startBackgroundMusic();
    playBubbleSound();
    game.onDiveInput();
  },
  { passive: true }
);

ui.onStart(() => {
  startBackgroundVideo();
  startBackgroundMusic();
  game.start();
});

ui.onRestart(() => {
  startBackgroundVideo();
  startBackgroundMusic();
  game.start();
});

ui.onPause(() => {
  game.pause();
});

ui.onResume(() => {
  game.resume();
});

ui.onQuit(() => {
  game.quitToMenu();
});

ui.onToggleBubble(() => {
  toggleBubbleMuted();
});

ui.onToggleMusicMute(() => {
  toggleMusicMuted();
});

ui.onMusicVolumeChange((value) => {
  setMusicVolume(value);
});

ui.showMenu();
ui.setBubbleLabel(bubbleMuted);
ui.setMusicLabel(musicMuted);
ui.setMusicVolume(musicVolume);
game.loop();

initAssets().catch((error) => {
  console.error('Asset load failed:', error);
});
