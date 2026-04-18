const PLAYER_SIZE = {
  width: 86,
  height: 58
};

export class Player {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = PLAYER_SIZE.width;
    this.height = PLAYER_SIZE.height;

    this.gravity = -0.34;
    this.minVelocity = -10;
    this.maxVelocity = 9;
    this.diveStrength = 7.6;
    this.flapStrength = -7.3;

    this.reset();
  }

  reset() {
    this.x = this.canvas.width * 0.25;
    this.y = this.canvas.height * 0.45;
    this.velocity = 0;
    this.rotation = 0;
  }

  dive() {
    // Tab only pushes fish downward.
    this.velocity = Math.max(this.velocity + 1.8, this.diveStrength);
  }

  flap() {
    this.velocity = this.flapStrength;
  }

  update() {
    this.velocity += this.gravity;
    if (this.velocity < this.minVelocity) this.velocity = this.minVelocity;
    if (this.velocity > this.maxVelocity) this.velocity = this.maxVelocity;
    this.y += this.velocity;

    const normalized = Math.min(1, this.velocity / this.maxVelocity);
    this.rotation = normalized * (Math.PI / 5);
  }

  getBounds() {
    const paddingX = this.width * 0.21;
    const paddingY = this.height * 0.22;

    return {
      left: this.x - this.width / 2 + paddingX,
      right: this.x + this.width / 2 - paddingX,
      top: this.y - this.height / 2 + paddingY,
      bottom: this.y + this.height / 2 - paddingY
    };
  }

  draw(ctx, sprite) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (sprite) {
      ctx.globalAlpha = 1;
      ctx.drawImage(sprite, -this.width / 2, -this.height / 2, this.width, this.height);
    } else {
      ctx.fillStyle = '#76f7ff';
      ctx.beginPath();
      ctx.ellipse(0, 0, this.width * 0.45, this.height * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
