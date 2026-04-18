export async function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Image could not load: ${src}`));
    img.src = src;
  });
}

export function removeNearWhiteBackground(imageLike, threshold = 228) {
  const canvas = document.createElement('canvas');
  canvas.width = imageLike.width;
  canvas.height = imageLike.height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageLike, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = imageData.data;
  const { width, height } = canvas;
  const total = width * height;
  const candidate = new Uint8Array(total);
  const visited = new Uint8Array(total);
  const queue = [];

  const lowSatTolerance = 20;

  const pushIfCandidate = (x, y) => {
    const idx = y * width + x;
    if (!candidate[idx] || visited[idx]) return;
    visited[idx] = 1;
    queue.push(idx);
  };

  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    const alpha = px[i + 3];

    if (alpha <= 8) continue;

    const bright = r >= threshold && g >= threshold && b >= threshold;
    const lowSaturation = Math.abs(r - g) <= lowSatTolerance && Math.abs(r - b) <= lowSatTolerance;

    if (bright && lowSaturation) {
      candidate[i / 4] = 1;
    }
  }

  for (let x = 0; x < width; x++) {
    pushIfCandidate(x, 0);
    pushIfCandidate(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    pushIfCandidate(0, y);
    pushIfCandidate(width - 1, y);
  }

  while (queue.length > 0) {
    const idx = queue.shift();
    const p = idx * 4;
    px[p + 3] = 0;

    const x = idx % width;
    const y = Math.floor(idx / width);

    if (x > 0) pushIfCandidate(x - 1, y);
    if (x + 1 < width) pushIfCandidate(x + 1, y);
    if (y > 0) pushIfCandidate(x, y - 1);
    if (y + 1 < height) pushIfCandidate(x, y + 1);
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export function trimTransparentBorders(sourceCanvas) {
  const sourceCtx = sourceCanvas.getContext('2d');
  const { width, height } = sourceCanvas;
  const data = sourceCtx.getImageData(0, 0, width, height).data;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 8) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return sourceCanvas;
  }

  const out = document.createElement('canvas');
  out.width = maxX - minX + 1;
  out.height = maxY - minY + 1;

  out
    .getContext('2d')
    .drawImage(sourceCanvas, minX, minY, out.width, out.height, 0, 0, out.width, out.height);

  return out;
}

export async function prepareTransparentAsset(src, threshold = 228) {
  const image = await loadImage(src);
  const noBg = removeNearWhiteBackground(image, threshold);
  return trimTransparentBorders(noBg);
}
