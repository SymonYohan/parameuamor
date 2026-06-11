/**
 * Aplicação principal — orquestra fases, canvas e animação.
 */

import { CONFIG } from './config.js';
import { CodePhase } from './code-phase.js';
import { MessageLayer } from './messages.js';
import { FloatingHearts } from './floating-hearts.js';
import { SkyLayer } from './sky.js';

class HeartApp {
  constructor() {
    this.phase = 'code';

    this.dom = {
      phaseCode: document.getElementById('phase-code'),
      codeDisplay: document.getElementById('code-display'),
      codeInput: document.getElementById('code-input'),
      codeInputWrap: document.getElementById('code-input-wrap'),
      messageLayer: document.getElementById('message-layer'),
      bgCanvas: document.getElementById('bg-canvas'),
    };

    this.bgCtx = this.dom.bgCanvas.getContext('2d');

    this.messageLayer = new MessageLayer(this.dom.messageLayer);
    this.floatingHearts = new FloatingHearts(
      this.dom.bgCanvas,
      this.messageLayer
    );
    this.sky = new SkyLayer();

    this.rafId = null;
    this._burstDone = false;

    this._onResize = () => this.resizeCanvases();
    window.addEventListener('resize', this._onResize);

    this.codePhase = new CodePhase(
      {
        display: this.dom.codeDisplay,
        input: this.dom.codeInput,
        wrap: this.dom.codeInputWrap,
        phase: this.dom.phaseCode,
      },
      () => this._onCodeSuccess(),
      this.messageLayer
    );
  }

  start() {
    this.resizeCanvases();
    this.codePhase.init();
    this._prefersReducedMotion();

    const w = window.innerWidth;
    const h = window.innerHeight;
    this.sky.init(w, h);
    this.floatingHearts.enable();
    this._loop();
  }

  _prefersReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('reduce-motion');
    }
  }

  resizeCanvases() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;

    [this.dom.bgCanvas].forEach((canvas) => {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });

    this.sky.initialized = false;
  }

  async _onCodeSuccess() {
    await this._startHeartPhase();
  }

  async _startHeartPhase() {
    this.phase = 'heart';
    this.dom.codeInput.disabled = true;
    this.dom.codeInputWrap.style.display = 'none';
    // Esconde a camada da fase de código para que o canvas receba cliques
    this.dom.phaseCode.classList.add('hidden');

    this.resizeCanvases();
    this.floatingHearts.finalBurst();
  }

  _loop() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const now = performance.now();

    // Se a tela mudou de tamanho, recria o mapa do céu para ocupar o novo espaço.
    if (!this.sky.initialized) {
      this.sky.init(w, h);
    }

    this.sky.update(w, h, now);
    this.sky.render(this.bgCtx, w, h, now, 1);

    this.floatingHearts.update(w, h);
    this.floatingHearts.render(this.bgCtx);

    this.rafId = requestAnimationFrame(() => this._loop());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new HeartApp();
  app.start();
});
