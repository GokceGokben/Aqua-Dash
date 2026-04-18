export class PipeManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.pipeWidth = 130;
    this.gap = 220;
    this.baseSpeed = 4.2;
    this.spawnDistance = 300;
    this.minTopHeight = 90;
    this.clusterModeStartScore = 20;
    this.clusterTightDistance = 128;

    this.reset();
  }

  reset() {
    this.pipes = [];
    this.speed = this.baseSpeed;
    this.distanceSinceSpawn = 0;
    this.clusterQueue = [];
    this.clusterRestSpawns = 0;
  }


  // Yeni borunun üst kenarı ile önceki borunun üst kenarı arasında ani sıçramaları ve imkansız geçişleri engeller
  randomTopHeightSafe() {
    const maxTop = this.canvas.height - this.gap - this.minTopHeight;
    const safeMax = Math.max(this.minTopHeight + 40, maxTop);
    const PLAYER_HEIGHT = 58; // Player.js'ten alınan değer
    const maxDelta = Math.floor(this.gap * 0.55); // Borular arası maksimum dikey kayma
    const minOverlap = Math.floor(PLAYER_HEIGHT * 1.2); // Gap açıklıkları arasında minimum örtüşme

    let prevPipe = this.pipes.length > 0 ? this.pipes[this.pipes.length - 1] : null;
    let tryCount = 0;
    while (true) {
      let candidate = Math.floor(Math.random() * (safeMax - this.minTopHeight + 1)) + this.minTopHeight;
      if (!prevPipe) return candidate;
      let prevTop = prevPipe.topHeight;
      // 1. Ani sıçrama engeli
      if (Math.abs(candidate - prevTop) > maxDelta) {
        candidate = prevTop + (candidate > prevTop ? maxDelta : -maxDelta);
        candidate = this.clampTopHeight(candidate);
      }
      // 2. Gap açıklıkları arasında minimum örtüşme
      let prevGapTop = prevTop;
      let prevGapBottom = prevTop + this.gap;
      let currGapTop = candidate;
      let currGapBottom = candidate + this.gap;
      let overlap = Math.min(prevGapBottom, currGapBottom) - Math.max(prevGapTop, currGapTop);
      if (overlap >= minOverlap) {
        return candidate;
      }
      tryCount++;
      if (tryCount > 10) return candidate; // sonsuz döngüye girmesin diye
    }
  }

  spawnPipe() {
    this.pipes.push({
      x: this.canvas.width + 20,
      topHeight: this.randomTopHeightSafe(),
      passed: false
    });
  }

  clampTopHeight(value) {
    const maxTop = this.canvas.height - this.gap - this.minTopHeight;
    return Math.max(this.minTopHeight, Math.min(maxTop, value));
  }

  queueClusterPattern() {
    const count = 6 + Math.floor(Math.random() * 2);
    const typeRoll = Math.random();
    const base = this.randomTopHeightSafe();
    const step = 20 + Math.floor(Math.random() * 9);
    const heights = [];

    let prev = this.pipes.length > 0 ? this.pipes[this.pipes.length - 1].topHeight : null;
    for (let i = 0; i < count; i++) {
      let candidate;
      if (typeRoll < 0.34) {
        // Flat run with tiny variation.
        const jitter = Math.floor(Math.random() * 9) - 4;
        candidate = this.clampTopHeight(base + jitter);
      } else if (typeRoll < 0.68) {
        // V or inverse-V shaped run.
        const center = (count - 1) / 2;
        const invert = Math.random() < 0.5;
        const depth = Math.round(Math.abs(i - center) * step);
        const offset = invert ? -depth : depth;
        candidate = this.clampTopHeight(base + offset);
      } else {
        // Up-down zigzag run.
        const firstUp = Math.random() < 0.5;
        const direction = (i % 2 === 0 ? 1 : -1) * (firstUp ? 1 : -1);
        candidate = this.clampTopHeight(base + direction * step);
      }
      // Güvenli geçiş kontrolü (ani sıçrama ve gap örtüşme)
      if (prev !== null) {
        const PLAYER_HEIGHT = 58;
        const maxDelta = Math.floor(this.gap * 0.55);
        const minOverlap = Math.floor(PLAYER_HEIGHT * 1.2);
        // 1. Ani sıçrama engeli
        if (Math.abs(candidate - prev) > maxDelta) {
          candidate = prev + (candidate > prev ? maxDelta : -maxDelta);
          candidate = this.clampTopHeight(candidate);
        }
        // 2. Gap açıklıkları arasında minimum örtüşme
        let prevGapTop = prev;
        let prevGapBottom = prev + this.gap;
        let currGapTop = candidate;
        let currGapBottom = candidate + this.gap;
        let overlap = Math.min(prevGapBottom, currGapBottom) - Math.max(prevGapTop, currGapTop);
        let tryCount = 0;
        while (overlap < minOverlap) {
          candidate = this.clampTopHeight(prev + (Math.random() - 0.5) * maxDelta * 2);
          currGapTop = candidate;
          currGapBottom = candidate + this.gap;
          overlap = Math.min(prevGapBottom, currGapBottom) - Math.max(prevGapTop, currGapTop);
          tryCount++;
          if (tryCount > 10) break;
        }
      }
      heights.push(candidate);
      prev = candidate;
    }
    this.clusterQueue = heights;
  }

  spawnPipeWithTop(topHeight) {
    this.pipes.push({
      x: this.canvas.width + 20,
      topHeight,
      passed: false
    });
  }

  update(onScore, score = 0) {
    // Hız artışı: 50. seviyeden sonra her 50'de bir az miktarda hızlanır
    let speed = this.baseSpeed;
    if (score >= 50) {
      speed += Math.floor((score - 50) / 50 + 1) * 0.5; // Her 50'de bir 0.5 artış
    }
    this.speed = speed;

    const advancedMode = score >= this.clusterModeStartScore;

    if (!advancedMode) {
      this.clusterQueue = [];
      this.clusterRestSpawns = 0;
    } else if (this.clusterQueue.length === 0 && this.clusterRestSpawns === 0) {
      this.queueClusterPattern();
    }

    const activeSpawnDistance = advancedMode && this.clusterQueue.length > 0 ? this.clusterTightDistance : this.spawnDistance;
    this.distanceSinceSpawn += this.speed;

    if (this.distanceSinceSpawn >= activeSpawnDistance) {
      if (advancedMode && this.clusterQueue.length > 0) {
        const nextTop = this.clusterQueue.shift();
        this.spawnPipeWithTop(nextTop);

        if (this.clusterQueue.length === 0) {
          this.clusterRestSpawns = 2 + Math.floor(Math.random() * 2);
        }
      } else {
        this.spawnPipe();

        if (advancedMode && this.clusterRestSpawns > 0) {
          this.clusterRestSpawns -= 1;
        }
      }

      this.distanceSinceSpawn = 0;
    }

    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.x -= this.speed;

      if (!pipe.passed && pipe.x + this.pipeWidth < this.canvas.width * 0.25) {
        pipe.passed = true;
        onScore();
      }

      if (pipe.x + this.pipeWidth < -20) {
        this.pipes.splice(i, 1);
      }
    }
  }

  collides(playerBounds) {
    for (const pipe of this.pipes) {
      const topRect = {
        left: pipe.x,
        right: pipe.x + this.pipeWidth,
        top: 0,
        bottom: pipe.topHeight
      };

      const bottomRect = {
        left: pipe.x,
        right: pipe.x + this.pipeWidth,
        top: pipe.topHeight + this.gap,
        bottom: this.canvas.height
      };

      if (rectOverlap(playerBounds, topRect) || rectOverlap(playerBounds, bottomRect)) {
        return true;
      }
    }

    return false;
  }

  draw(ctx, sprite) {
    for (const pipe of this.pipes) {
      const topHeight = pipe.topHeight;
      const bottomY = topHeight + this.gap;
      const bottomHeight = this.canvas.height - bottomY;

      this.drawPipeSegment(ctx, pipe.x, 0, topHeight, true);
      this.drawPipeSegment(ctx, pipe.x, bottomY, bottomHeight, false);
    }
  }

  drawPipeSegment(ctx, x, y, height, capAtBottom) {
    if (height <= 0) return;

    const capHeight = Math.min(26, Math.max(12, Math.floor(height * 0.35)));
    const capY = capAtBottom ? y + height - capHeight : y;
    const band = Math.max(4, Math.floor(this.pipeWidth / 16));
    const capShadeY = capY + 2;
    const capShadeHeight = Math.max(0, capHeight - 8);

    ctx.save();

    // Pixel-stepped body shading.
    ctx.fillStyle = '#39ad8c';
    ctx.fillRect(x, y, this.pipeWidth, height);

    ctx.fillStyle = '#b2fbe7';
    ctx.fillRect(x + band, y, band, height);

    ctx.fillStyle = '#8ae2c7';
    ctx.fillRect(x + band * 2, y, band, height);

    ctx.fillStyle = '#2f9073';
    ctx.fillRect(x + this.pipeWidth - band * 3, y, band * 2, height);

    ctx.fillStyle = '#257a60';
    ctx.fillRect(x + this.pipeWidth - band, y, band, height);

    ctx.fillStyle = '#effff9';
    ctx.fillRect(x + band * 3, y + 1, 2, Math.max(0, height - 2));

    // Pixel-style cap shading with a chunkier rim and stepped bands.
    ctx.fillStyle = '#1f5f4d';
    ctx.fillRect(x - 8, capY, this.pipeWidth + 16, capHeight);

    ctx.fillStyle = '#3eb594';
    ctx.fillRect(x - 5, capY + 2, this.pipeWidth + 10, capHeight - 4);

    ctx.fillStyle = '#a4f3de';
    ctx.fillRect(x - 2, capShadeY, 14, capShadeHeight);

    ctx.fillStyle = '#84e7ce';
    ctx.fillRect(x + 12, capShadeY, 18, capShadeHeight);

    ctx.fillStyle = '#f5fffb';
    ctx.fillRect(x + 18, capShadeY, 2, capShadeHeight);

    ctx.fillStyle = '#37a383';
    ctx.fillRect(x + this.pipeWidth - 34, capShadeY, 20, capShadeHeight);

    ctx.fillStyle = '#2c8368';
    ctx.fillRect(x + this.pipeWidth - 14, capShadeY, 9, capShadeHeight);

    ctx.fillStyle = '#1a4c3d';
    ctx.fillRect(x - 8, capY + capHeight - 4, this.pipeWidth + 16, 4);

    ctx.strokeStyle = '#184d3d';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 7, capY + 1, this.pipeWidth + 14, capHeight - 2);

    ctx.restore();
  }
}

function rectOverlap(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}
