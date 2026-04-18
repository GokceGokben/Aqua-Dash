export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawBackground(video) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Even more aggressive 60px bleed to guarantee no gaps on any device
    const bleed = 60;

    const grad = ctx.createLinearGradient(0, -bleed, 0, height + bleed);
    grad.addColorStop(0, '#0d7aa6');
    grad.addColorStop(0.65, '#0b4d73');
    grad.addColorStop(1, '#03243e');
    ctx.fillStyle = grad;
    ctx.fillRect(-bleed, -bleed, width + bleed * 2, height + bleed * 2);

    if (video && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
      const sourceAspect = video.videoWidth / video.videoHeight;
      const targetAspect = width / height;

      let sx = 0;
      let sy = 0;
      let sw = video.videoWidth;
      let sh = video.videoHeight;

      if (sourceAspect > targetAspect) {
        sw = sh * targetAspect;
        sx = (video.videoWidth - sw) / 2;
      } else {
        sh = sw / targetAspect;
        sy = (video.videoHeight - sh) / 2;
      }

      let edgeBlend = 1;
      if (video.duration && Number.isFinite(video.duration) && video.duration > 0) {
        const edgeWindow = 0.9;
        const distToEdge = Math.min(video.currentTime, Math.max(0, video.duration - video.currentTime));
        const t = Math.max(0, Math.min(1, distToEdge / edgeWindow));
        edgeBlend = t * t * (3 - 2 * t);
      }

      const videoAlpha = 0.58 + edgeBlend * 0.42;
      ctx.save();
      ctx.globalAlpha = videoAlpha;
      // Draw zoomed in by using the bleed even more aggressively
      ctx.drawImage(video, sx, sy, sw, sh, -bleed, -bleed, width + bleed * 2, height + bleed * 2);
      ctx.restore();
    }

    // Light rays bleed
    const ray = ctx.createLinearGradient(0, -bleed, width, height + bleed);
    ray.addColorStop(0, 'rgba(182,242,255,0.08)');
    ray.addColorStop(1, 'rgba(182,242,255,0.01)');
    ctx.fillStyle = ray;
    ctx.fillRect(-bleed, -bleed, width + bleed * 2, height + bleed * 2);
  }

  drawBubbles(game) {
    const ctx = this.ctx;
    const bubbleSprite = game.assets.bubble;

    for (const bubble of game.bubbles) {
      const lifeRatio = 1 - bubble.life / bubble.ttl;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(0.9, lifeRatio));

      if (bubbleSprite) {
        ctx.drawImage(bubbleSprite, bubble.x - bubble.size / 2, bubble.y - bubble.size / 2, bubble.size, bubble.size);
      } else {
        ctx.strokeStyle = '#c7f5ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size / 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  drawConfetti(game) {
    const ctx = this.ctx;

    for (const piece of game.confetti) {
      const fade = 1 - piece.life / piece.ttl;
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation);
      ctx.globalAlpha = Math.max(0, Math.min(1, fade));
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.62);
      ctx.restore();
    }
  }

  draw(game) {
    this.clear();
    this.drawBackground(game.assets.backgroundVideo);
    game.pipeManager.draw(this.ctx, game.assets.pipe);
    this.drawBubbles(game);
    this.drawConfetti(game);
    game.player.draw(this.ctx, game.assets.fish);
  }
}
