export class GameUI {
  constructor() {
    this.menu = document.getElementById('menu');
    this.pauseMenu = document.getElementById('pause-menu');
    this.gameOver = document.getElementById('game-over');
    this.hud = document.getElementById('hud');

    this.scoreNode = document.getElementById('score');
    this.finalScoreNode = document.getElementById('final-score');

    this.bubbleButton = document.getElementById('bubble-btn');
    this.pauseBubbleButton = document.getElementById('pause-bubble-btn');

    this.musicButton = document.getElementById('music-btn');
    this.musicVolumeLabel = document.getElementById('music-volume-label');
    this.musicVolumeSlider = document.getElementById('music-volume');
    this.musicVolumeValue = document.getElementById('music-volume-value');

    this.pauseMusicButton = document.getElementById('pause-music-btn');
    this.pauseMusicVolumeLabel = document.getElementById('pause-music-volume-label');
    this.pauseMusicVolumeSlider = document.getElementById('pause-music-volume');
    this.pauseMusicVolumeValue = document.getElementById('pause-music-volume-value');
    this.pauseButton = document.getElementById('pause-btn');
    this.startButton = document.getElementById('start-btn');
    this.resumeButton = document.getElementById('resume-btn');
    this.quitButton = document.getElementById('quit-btn');
    this.restartButton = document.getElementById('restart-btn');
  }

  setScore(score) {
    this.scoreNode.textContent = String(score);
    this.finalScoreNode.textContent = String(score);
  }

  showMenu() {
    this.menu.classList.remove('hidden');
    this.pauseMenu.classList.add('hidden');
    this.gameOver.classList.add('hidden');
    this.hud.classList.add('hidden');
    this.pauseButton.classList.add('hidden');
  }

  showGameplay() {
    this.menu.classList.add('hidden');
    this.pauseMenu.classList.add('hidden');
    this.gameOver.classList.add('hidden');
    this.hud.classList.remove('hidden');
    this.pauseButton.classList.remove('hidden');
  }

  showPause() {
    this.pauseMenu.classList.remove('hidden');
    this.pauseButton.classList.add('hidden');
  }

  hidePause() {
    this.pauseMenu.classList.add('hidden');
    this.pauseButton.classList.remove('hidden');
  }

  showGameOver() {
    this.pauseMenu.classList.add('hidden');
    this.gameOver.classList.remove('hidden');
    this.hud.classList.add('hidden');
    this.pauseButton.classList.add('hidden');
  }

  onStart(handler) {
    this.startButton.addEventListener('click', handler);
  }

  onRestart(handler) {
    this.restartButton.addEventListener('click', handler);
  }

  onPause(handler) {
    this.pauseButton.addEventListener('click', handler);
  }

  onResume(handler) {
    this.resumeButton.addEventListener('click', handler);
  }

  onQuit(handler) {
    this.quitButton.addEventListener('click', handler);
  }

  onToggleBubble(handler) {
    this.bubbleButton.addEventListener('click', handler);
    this.pauseBubbleButton.addEventListener('click', handler);
  }

  onToggleMusicMute(handler) {
    this.musicButton.addEventListener('click', handler);
    this.pauseMusicButton.addEventListener('click', handler);
  }

  onMusicVolumeChange(handler) {
    this.musicVolumeSlider.addEventListener('input', (event) => {
      const value = Number(event.target.value);
      handler(value);
    });

    this.pauseMusicVolumeSlider.addEventListener('input', (event) => {
      const value = Number(event.target.value);
      handler(value);
    });
  }

  setBubbleLabel(isMuted) {
    const label = isMuted ? 'Bubble: Off' : 'Bubble: On';
    this.bubbleButton.textContent = label;
    this.pauseBubbleButton.textContent = label;
  }

  setMusicLabel(isMuted) {
    const label = isMuted ? 'Music: Off' : 'Music: On';
    this.musicButton.textContent = label;
    this.pauseMusicButton.textContent = label;

    const hidden = isMuted;
    this.musicVolumeLabel.classList.toggle('hidden', hidden);
    this.musicVolumeSlider.classList.toggle('hidden', hidden);
    this.pauseMusicVolumeLabel.classList.toggle('hidden', hidden);
    this.pauseMusicVolumeSlider.classList.toggle('hidden', hidden);
  }

  setMusicVolume(value) {
    const safe = Math.max(0, Math.min(100, Math.round(value)));
    this.musicVolumeSlider.value = String(safe);
    this.musicVolumeValue.textContent = `${safe}%`;
    this.pauseMusicVolumeSlider.value = String(safe);
    this.pauseMusicVolumeValue.textContent = `${safe}%`;
  }
}
