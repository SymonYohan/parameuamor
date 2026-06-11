/**
 * Fase 1: grade de codigo, validacao e transformacao em coracao.
 */

import { CONFIG } from './config.js';
import { delay, buildHeartMask } from './utils.js';

export class CodePhase {
  /**
   * @param {Object} elements
   * @param {HTMLElement} elements.display
   * @param {HTMLInputElement} elements.input
   * @param {HTMLElement} elements.wrap
   * @param {HTMLElement} elements.phase
   * @param {() => void} onSuccess
   * @param {import('./messages.js').MessageLayer} messageLayer
   */
  constructor(elements, onSuccess, messageLayer = null) {
    this.display = elements.display;
    this.input = elements.input;
    this.wrap = elements.wrap;
    this.phase = elements.phase;
    this.onSuccess = onSuccess;
    this.messageLayer = messageLayer;

    this.heartMask = buildHeartMask(
      CONFIG.heartShape,
      CONFIG.grid.width,
      CONFIG.grid.height
    );

    this.cells = [];
    this.cellMap = {};
    this.transforming = false;
    this.scrambleTimer = null;
    this.active = true;

    this._bindEvents();
  }

  _bindEvents() {
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.checkCode();
    });
    this.input.addEventListener('input', () => this.checkCode());
  }

  randChar() {
    const chars = CONFIG.codeChars;
    return chars[Math.floor(Math.random() * chars.length)];
  }

  init() {
    const { width, height, cellPx } = CONFIG.grid;
    this.display.style.gridTemplateColumns = `repeat(${width}, ${cellPx}px)`;
    this.cells = [];
    this.cellMap = {};
    this.display.innerHTML = '';

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const el = document.createElement('span');
        el.className = 'code-cell';
        el.textContent = this.randChar();
        el.dataset.x = String(x);
        el.dataset.y = String(y);
        el.setAttribute('aria-hidden', 'true');
        this.display.appendChild(el);

        const cell = { el, x, y, isHeart: false };
        this.cells.push(cell);
        this.cellMap[`${x},${y}`] = cell;
      }
    }

    this.scrambleLoop();
  }

  scrambleLoop() {
    if (!this.active || this.transforming) return;

    this.cells.forEach((c) => {
      if (!c.isHeart) c.el.textContent = this.randChar();
    });

    this.scrambleTimer = setTimeout(
      () => this.scrambleLoop(),
      CONFIG.grid.scrambleIntervalMs
    );
  }

  checkCode() {
    const value = this.input.value.trim();
    if (value === CONFIG.secretCode) {
      this._onCorrect();
      return;
    }

    if (value.length >= CONFIG.secretCode.length) {
      this._shakeInput();
      this.input.value = '';
    }
  }

  _shakeInput() {
    this.wrap.classList.remove('shake');
    void this.wrap.offsetWidth;
    this.wrap.classList.add('shake');
    setTimeout(() => this.wrap.classList.remove('shake'), 500);

    if (this.messageLayer) {
      this.messageLayer.show(CONFIG.messages.errorMsg, 'error');
    }
  }

  _onCorrect() {
    this.transforming = true;
    clearTimeout(this.scrambleTimer);
    this.input.disabled = true;
    this.input.classList.add('success');
    this.phase.querySelector('.hint')?.classList.add('hint--success');
    this.transformToHeart();
  }

  async transformToHeart() {
    const { steps, stepDelayMs, chars } = CONFIG.heartTransform;
    const targets = this.heartMask;

    for (let step = 0; step < steps; step++) {
      await delay(stepDelayMs);
      this.cells.forEach((c) => {
        const isH = targets.some((t) => t.x === c.x && t.y === c.y);
        if (isH) {
          c.isHeart = true;
          c.el.classList.add('heart-char');
          c.el.textContent = chars[Math.floor(Math.random() * chars.length)];
        } else if (Math.random() > 0.65) {
          c.el.textContent = this.randChar();
          c.el.style.opacity = String(0.25 + Math.random() * 0.35);
        }
      });
    }

    targets.forEach((t) => {
      const c = this.cellMap[`${t.x},${t.y}`];
      if (c) {
        c.isHeart = true;
        c.el.classList.add('heart-char');
        c.el.textContent = '♥';
      }
    });

    this.cells.forEach((c) => {
      if (!c.isHeart) c.el.style.opacity = '0.12';
    });

    await this.pulseHeart(CONFIG.heartTransform.pulseCount);
    await delay(CONFIG.phases.beforeTreeMs);
    this.active = false;
    this.onSuccess();
  }

  async pulseHeart(times) {
    const { pulseDurationMs, pulseRestMs, pulseScale } = CONFIG.heartTransform;

    for (let i = 0; i < times; i++) {
      this.display.style.transform = `scale(${pulseScale})`;
      this.cells
        .filter((c) => c.isHeart)
        .forEach((c) => c.el.classList.add('pulse'));

      await delay(pulseDurationMs);

      this.display.style.transform = 'scale(1)';
      this.cells
        .filter((c) => c.isHeart)
        .forEach((c) => c.el.classList.remove('pulse'));

      await delay(pulseRestMs);
    }
  }

  async hide() {
    this.phase.classList.add('hidden');
    await delay(CONFIG.phases.fadeCodeMs);
  }
}
