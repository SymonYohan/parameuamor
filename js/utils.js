/**
 * Utilitários gerais de animação e aleatoriedade.
 */

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Aleatório determinístico 0–1 (para posições estáveis da árvore). */
export function seededRandom(seed) {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function buildHeartMask(shape, gridW, gridH) {
  const mask = [];
  const offsetX = Math.floor((gridW - shape[0].length) / 2);
  const offsetY = Math.floor((gridH - shape.length) / 2);

  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      const sy = y - offsetY;
      const sx = x - offsetX;
      if (
        sy >= 0 &&
        sy < shape.length &&
        sx >= 0 &&
        sx < shape[sy].length &&
        shape[sy][sx] === '#'
      ) {
        mask.push({ x, y });
      }
    }
  }
  return mask;
}
