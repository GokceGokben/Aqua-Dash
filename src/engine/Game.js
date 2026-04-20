import { Player } from './Player.js';
import { PipeManager } from './PipeManager.js';
import { Renderer } from './Renderer.js';

const CONFETTI_TRIGGER_SCORE = 100;

export class Game {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ui = ui;

    this.player = new Player(canvas);
    this.pipeManager = new PipeManager(canvas);
    this.renderer = new Renderer(canvas);

    this.state = 'MENU';
    this.score = 0;
    this.bubbles = [];
    this.confetti = [];
    this.didLaunchHundredConfetti = false;
    this.onGameOver = null;

    this.assets = {
      fish: null,
      pipe: null,
      bubble: null,
      backgroundVideo: null
    };

    this.lastFrame = performance.now();

    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);

    // Aggressive resize listeners for mobile devices
    window.addEventListener('resize', this.resize);
    window.addEventListener('orientationchange', this.resize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.resize);
      window.visualViewport.addEventListener('scroll', this.resize);
    }

    // Multiple resizes to catch late-arriving dimensions after orientation change or page load
    this.resize();
    setTimeout(this.resize, 100);
    setTimeout(this.resize, 500);
    setTimeout(this.resize, 1500);
  }

  setAssets(assets) {
    this.assets = { ...this.assets, ...assets };
  }

  setGameOverHandler(handler) {
    this.onGameOver = handler;
  }

  resize() {
    // Mobil cihazlarda en doğru alan için visualViewport kullan, yoksa inner boyutlara dön.
    let w = window.innerWidth;
    let h = window.innerHeight;

    if (window.visualViewport) {
      w = window.visualViewport.width;
      h = window.visualViewport.height;
    }

    // En azından documentElement boyutunu garantiye al
    w = Math.max(w, document.documentElement.clientWidth);
    h = Math.max(h, document.documentElement.clientHeight);

    this.canvas.width = w;
    this.canvas.height = h;

    // Reset difficulty overrides to base values defined in PipeManager
    this.player.reset();
    this.pipeManager.reset();
  }

  start() {
    this.state = 'PLAYING';
    this.score = 0;
    this.bubbles = [];
    this.confetti = [];
    this.didLaunchHundredConfetti = false;
    this.ui.setScore(this.score);

    this.player.reset();
    this.pipeManager.reset();
    this.ui.showGameplay();
  }

  onDiveInput() {
    if (this.state === 'MENU') {
      this.start();
      this.player.dive();
      this.emitBubbles();
      return;
    }

    if (this.state === 'PLAYING') {
      this.player.dive();
      this.emitBubbles();
      return;
    }

    if (this.state === 'GAMEOVER') {
      this.start();
      this.player.dive();
      this.emitBubbles();
    }
  }

  onFlapInput() {
    if (this.state === 'MENU') {
      this.start();
      this.player.flap();
      return;
    }

    if (this.state === 'PLAYING') {
      this.player.flap();
      return;
    }

    if (this.state === 'GAMEOVER') {
      this.start();
      this.player.flap();
    }
  }

  pause() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    // Arka plan videosu ve müziği duraklat
    if (this.assets.backgroundVideo && !this.assets.backgroundVideo.paused) {
      this.assets.backgroundVideo.pause();
    }
    if (window.backgroundMusic && !window.backgroundMusic.paused) {
      window.backgroundMusic.pause();
    }
    document.body.classList.add('is-paused');
    this.ui.showPause();
  }

  resume() {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';
    // Arka plan videosu ve müziği devam ettir
    if (this.assets.backgroundVideo && this.assets.backgroundVideo.paused) {
      this.assets.backgroundVideo.play().catch(() => {});
    }
    if (window.backgroundMusic && window.backgroundMusic.paused) {
      window.backgroundMusic.play().catch(() => {});
    }
    document.body.classList.remove('is-paused');
    this.ui.hidePause();
  }

  quitToMenu() {
    this.state = 'MENU';
    this.score = 0;
    this.bubbles = [];
    this.confetti = [];
    this.didLaunchHundredConfetti = false;
    this.ui.setScore(0);
    this.ui.showMenu();
    this.player.reset();
    this.pipeManager.reset();
  }

  emitBubbles() {
    const mouth = {
      x: this.player.x + this.player.width * 0.38,
      y: this.player.y - this.player.height * 0.08
    };

    const burstCount = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < burstCount; i++) {
      this.bubbles.push({
        x: mouth.x + Math.random() * 8 - 4,
        y: mouth.y + Math.random() * 8 - 4,
        vx: 0.4 + Math.random() * 1.2,
        vy: -1.4 - Math.random() * 1.8,
        size: 14 + Math.random() * 10,
        life: 0,
        ttl: 42 + Math.floor(Math.random() * 20)
      });
    }
  }

  updateBubbles() {
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const bubble = this.bubbles[i];
      bubble.life += 1;
      bubble.x += bubble.vx;
      bubble.y += bubble.vy;
      bubble.vx *= 0.99;
      bubble.vy -= 0.01;

      if (bubble.life >= bubble.ttl || bubble.y < -30 || bubble.x > this.canvas.width + 40) {
        this.bubbles.splice(i, 1);
      }
    }
  }

  launchHundredConfetti() {
    const colors = ['#ffe066', '#8de7d4', '#ff8fab', '#9bf6ff', '#f4fcff', '#baffc9'];
    const areaFactor = Math.max(1, Math.floor((this.canvas.width * this.canvas.height) / 180000));
    const burstCount = 700 + areaFactor * 140;

    for (let i = 0; i < burstCount; i++) {
      const drift = (Math.random() - 0.5) * 3.4;
      const verticalSpeed = (Math.random() - 0.5) * 3.2;

      this.confetti.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: drift,
        vy: verticalSpeed,
        size: 4 + Math.random() * 7,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.35,
        gravity: 0.08 + Math.random() * 0.08,
        life: 0,
        ttl: 140 + Math.floor(Math.random() * 120),
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  updateConfetti() {
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const piece = this.confetti[i];
      piece.life += 1;
      piece.vy += piece.gravity;
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.rotation += piece.rotationSpeed;
      piece.vx *= 0.995;

      if (piece.life >= piece.ttl || piece.y > this.canvas.height + 40) {
        this.confetti.splice(i, 1);
      }
    }
  }

  gameOver() {
    this.state = 'GAMEOVER';
    if (this.assets.backgroundVideo && !this.assets.backgroundVideo.paused) {
      this.assets.backgroundVideo.pause();
    }
    if (this.onGameOver) {
      this.onGameOver();
    }
    this.ui.showGameOver();
  }

  update() {
    if (this.state !== 'PAUSED') {
      this.updateConfetti();
    }

    if (this.state !== 'PLAYING') {
      return;
    }

    this.player.update();
    this.updateBubbles();
    this.pipeManager.update(() => {
      this.score += 1;
      this.ui.setScore(this.score);

      if (this.score >= CONFETTI_TRIGGER_SCORE && !this.didLaunchHundredConfetti) {
        this.didLaunchHundredConfetti = true;
        this.launchHundredConfetti();
      }
    }, this.score);

    const b = this.player.getBounds();
    const hitBoundary = b.top <= 0 || b.bottom >= this.canvas.height;
    const hitPipe = this.pipeManager.collides(b);

    if (hitBoundary || hitPipe) {
      this.gameOver();
    }
  }

  loop(now = performance.now()) {
    const dt = Math.min(32, now - this.lastFrame);
    this.lastFrame = now;

    // Fixed-step feel for stable movement between monitors.
    const steps = Math.max(1, Math.round(dt / 16.6));
    for (let i = 0; i < steps; i++) {
      this.update();
    }

    this.renderer.draw(this);
    requestAnimationFrame(this.loop);
  }
}
