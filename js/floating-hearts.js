/**
 * Coracoes flutuantes clicaveis.
 *
 * Regras principais:
 * - Rosa: toca Sia - Snowman.
 * - Azul: toca Jaymes Young - Infinity e mostra mensagem.
 * - Repetir a mesma cor nao reinicia a musica; apenas muda as frases.
 * - A cada 7 cliques na mesma cor, o proprio coracao clicado cresce e pulsa.
 * - Dois cliques quase ao mesmo tempo em coracoes da mesma cor mostram um versiculo.
 */

import { CONFIG } from './config.js';
import { MusicPlayer } from './music.js';

export class FloatingHearts {
  /**
   * @param {HTMLCanvasElement} canvas Camada onde os coracoes sao desenhados.
   * @param {import('./messages.js').MessageLayer} messageLayer Camada de textos romanticos.
   */
  constructor(canvas, messageLayer) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.messageLayer = messageLayer;
    this.hearts = [];
    this.lastSpawn = 0;
    this.enabled = false;
    this.musicPlayer = new MusicPlayer();

    this.nextHeartId = 1;
    this.clickCounters = { pink: 0, blue: 0 };
    this.lastColorClick = { color: null, heartId: null, time: 0 };
    this.lastVerseAt = 0;

    canvas.addEventListener('click', (e) => this._onClick(e));
    canvas.addEventListener(
      'touchstart',
      (e) => this._onTouchStart(e),
      { passive: true }
    );
  }

  /**
   * Ativa os cliques e cria a primeira chuva de coracoes.
   */
  enable() {
    this.enabled = true;
    this.canvas.classList.add('clickable');
    this._initPopulation();
  }

  _viewport() {
    return { w: window.innerWidth, h: window.innerHeight };
  }

  /**
   * Espalha coracoes pela tela logo quando a fase romantica comeca.
   */
  _initPopulation() {
    const { w, h } = this._viewport();
    const cfg = CONFIG.floatingHearts;

    for (let i = 0; i < cfg.initialPink; i++) {
      this.hearts.push(this._create('pink', w, h, true));
    }
    for (let i = 0; i < cfg.initialBlue; i++) {
      this.hearts.push(this._create('blue', w, h, true));
    }
  }

  /**
   * Cria um coracao com movimento lento e uma piscada propria.
   */
  _create(type, w, h, clickable) {
    const speed = CONFIG.floatingHearts.speed;

    return {
      id: this.nextHeartId++,
      x: Math.random() * w,
      y: Math.random() * h,
      size: 6 + Math.random() * (type === 'blue' ? 10 : 14),
      speedY: -(speed.minY + Math.random() * (speed.maxY - speed.minY)),
      speedX: (Math.random() - 0.5) * speed.maxX,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: speed.wobbleMin + Math.random() * speed.wobbleRange,
      type,
      clickable,
      special: null,
      alpha: 0.32 + Math.random() * 0.5,
      rotation: Math.random() * Math.PI * 2,
      glow: Math.random() * Math.PI * 2,
      blinkSpeed: 0.012 + Math.random() * 0.035,
      blinkDepth: type === 'blue' ? 0.38 : 0.28,
    };
  }

  /**
   * Mantem compatibilidade com fases antigas que chamavam spawn durante crescimento.
   */
  spawnDuringGrowth(now, treeProgress) {
    const cfg = CONFIG.floatingHearts;
    if (
      now - this.lastSpawn < cfg.spawnDuringGrowMs ||
      treeProgress <= 0.12 ||
      treeProgress >= 0.98
    ) {
      return;
    }

    this.lastSpawn = now;
    const type = Math.random() > 0.42 ? 'pink' : 'blue';
    const { w, h } = this._viewport();
    this._pushHeart(this._create(type, w, h, true));
  }

  /**
   * Pequena explosao inicial de coracoes quando o codigo e acertado.
   */
  finalBurst() {
    const cfg = CONFIG.floatingHearts;
    for (let i = 0; i < cfg.finalBurstCount; i++) {
      setTimeout(() => {
        const type = Math.random() > 0.46 ? 'pink' : 'blue';
        const { w, h } = this._viewport();
        this._pushHeart(this._create(type, w, h, true));
      }, i * cfg.finalBurstDelayMs);
    }
  }

  _pushHeart(heart) {
    const max = CONFIG.floatingHearts.maxOnScreen;
    if (this.hearts.length >= max) this.hearts.shift();
    this.hearts.push(heart);
  }

  /**
   * Move os coracoes pequenos e remove os que terminaram a pulsacao especial.
   */
  update(w, h) {
    if (!this.enabled) return;

    this.hearts.forEach((heart) => {
      if (!heart.special) {
        heart.y += heart.speedY;
        heart.x += heart.speedX + Math.sin(heart.wobble) * 0.16;
      }

      heart.wobble += heart.wobbleSpeed;
      heart.rotation += 0.0035;
      heart.glow += heart.blinkSpeed;

      if (heart.y < -40) {
        heart.y = h + 25;
        heart.x = Math.random() * w;
      }
      if (heart.x < -25) heart.x = w + 15;
      if (heart.x > w + 25) heart.x = -15;
    });

    this._removeFinishedSpecialHearts();
  }

  /**
   * Desenha coracoes comuns e tambem o coracao que estiver crescendo/pulsando.
   */
  render(ctx) {
    if (!this.enabled) return;

    this.hearts.forEach((heart, index) => {
      const blink = 1 - heart.blinkDepth + Math.sin(heart.glow) * heart.blinkDepth;
      const specialSize = this._getSpecialHeartSize(heart);
      const drawSize = specialSize ?? heart.size;
      const alpha = Math.max(0.12, heart.alpha * blink);
      const color =
        heart.type === 'pink'
          ? `rgba(255, ${105 + (Math.sin(heart.wobble) * 25) | 0}, 185, ${alpha})`
          : `rgba(105, ${185 + (Math.sin(heart.wobble) * 35) | 0}, 255, ${alpha})`;

      this._drawGlow(ctx, heart, alpha, drawSize);
      this._drawHeartShape(ctx, heart.x, heart.y, drawSize, color, heart.rotation);

      if (index % 4 === 0) {
        this._drawTwinkle(ctx, heart.x, heart.y, drawSize, alpha);
      }

      if (heart.type === 'blue') {
        this._drawClickableHalo(ctx, heart, drawSize);
      }
    });
  }

  /**
   * Brilho suave ao redor do coracao.
   */
  _drawGlow(ctx, heart, alpha, size = heart.size) {
    const radius = size * 3.2;
    const glow = ctx.createRadialGradient(
      heart.x,
      heart.y,
      0,
      heart.x,
      heart.y,
      radius
    );
    const tint =
      heart.type === 'pink'
        ? `rgba(255, 105, 185, ${0.18 * alpha})`
        : `rgba(120, 195, 255, ${0.16 * alpha})`;

    glow.addColorStop(0, tint);
    glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.save();
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(heart.x, heart.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Desenha a forma base de coracao usada nos pequenos e nos especiais.
   */
  _drawHeartShape(ctx, x, y, size, color, rot = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = color;
    ctx.beginPath();
    const s = size;
    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo(-s, -s * 0.3, -s * 0.5, -s, 0, -s * 0.55);
    ctx.bezierCurveTo(s * 0.5, -s, s, -s * 0.3, 0, s * 0.3);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Pequeno brilho em cruz para simular estrelas piscando.
   */
  _drawTwinkle(ctx, x, y, size, alpha) {
    const ray = size * 1.25;
    ctx.save();
    ctx.globalAlpha = alpha * 0.8;
    ctx.strokeStyle = 'rgba(255, 245, 210, 0.75)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x - ray, y);
    ctx.lineTo(x + ray, y);
    ctx.moveTo(x, y - ray);
    ctx.lineTo(x, y + ray);
    ctx.stroke();
    ctx.restore();
  }

  _drawClickableHalo(ctx, heart, size = heart.size) {
    ctx.save();
    ctx.globalAlpha = 0.08 + Math.sin(heart.glow) * 0.04;
    ctx.fillStyle = 'rgba(150, 215, 255, 0.65)';
    ctx.beginPath();
    ctx.arc(heart.x, heart.y, size * 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Calcula o tamanho do coracao que esta crescendo e pulsando.
   */
  _getSpecialHeartSize(heart) {
    if (!heart.special) return null;

    const cfg = CONFIG.floatingHearts.specialHeart;
    const elapsed = performance.now() - heart.special.startedAt;
    const pulsePhase = (elapsed % cfg.pulseDurationMs) / cfg.pulseDurationMs;
    const pulse = 0.88 + Math.sin(pulsePhase * Math.PI) * 0.24;
    const growProgress = Math.min(1, elapsed / (cfg.pulseDurationMs * 2.2));
    const baseSize = heart.special.baseSize;
    const targetSize = cfg.size;

    return (baseSize + (targetSize - baseSize) * growProgress) * pulse;
  }

  _onClick(e) {
    if (!this.enabled) return;
    const rect = this.canvas.getBoundingClientRect();
    this._handleHit(e.clientX - rect.left, e.clientY - rect.top);
  }

  /**
   * Permite que dois dedos em coracoes da mesma cor tambem acionem o versiculo.
   */
  _onTouchStart(e) {
    if (!this.enabled) return;

    const rect = this.canvas.getBoundingClientRect();
    for (const touch of e.changedTouches) {
      this._handleHit(touch.clientX - rect.left, touch.clientY - rect.top);
    }
  }

  /**
   * Detecta qual coracao foi clicado e aplica a regra de cada cor.
   */
  _handleHit(mx, my) {
    const heart = this._findHeartAt(mx, my);
    if (!heart) return;

    if (heart.type === 'blue') {
      this.musicPlayer.playTrack('blue');
      this.messageLayer.showRandom();
    }

    if (heart.type === 'pink') {
      const musicChanged = this.musicPlayer.playTrack('pink');
      if (!musicChanged) {
        this.messageLayer.showRandom();
      }
    }

    this._celebrateHit(heart);
    this._registerColorClick(heart);
  }

  _findHeartAt(mx, my) {
    for (let i = this.hearts.length - 1; i >= 0; i--) {
      const heart = this.hearts[i];
      if (!heart.clickable) continue;

      const dist = Math.hypot(heart.x - mx, heart.y - my);
      if (dist < heart.size * 2.8) {
        return heart;
      }
    }

    return null;
  }

  /**
   * Conta cliques por cor e detecta cliques quase simultaneos da mesma cor.
   */
  _registerColorClick(heart) {
    const cfg = CONFIG.floatingHearts.specialHeart;
    const now = performance.now();
    const previous = this.lastColorClick;

    this.clickCounters[heart.type] += 1;

    if (this.clickCounters[heart.type] >= cfg.clicksNeeded) {
      this.clickCounters[heart.type] = 0;
      this._startSpecialHeart(heart);
    }

    const sameColor = previous.color === heart.type;
    const differentHeart = previous.heartId !== heart.id;
    const closeTogether = now - previous.time <= cfg.sameColorWindowMs;
    const canShowVerse = now - this.lastVerseAt > 1200;

    if (sameColor && differentHeart && closeTogether && canShowVerse) {
      this.messageLayer.showBibleVerse();
      this.lastVerseAt = now;
    }

    this.lastColorClick = {
      color: heart.type,
      heartId: heart.id,
      time: now,
    };
  }

  /**
   * Faz o proprio coracao clicado crescer, pulsar e depois sumir.
   */
  _startSpecialHeart(heart) {
    if (heart.special) return;

    heart.special = {
      startedAt: performance.now(),
      baseSize: heart.size,
    };
    heart.clickable = false;
    heart.speedX = 0;
    heart.speedY = 0;
    heart.alpha = 1;

    this.messageLayer.showGrowthMessage();
  }

  _removeFinishedSpecialHearts() {
    const cfg = CONFIG.floatingHearts.specialHeart;
    const totalDuration = cfg.pulseCount * cfg.pulseDurationMs;
    const now = performance.now();

    this.hearts = this.hearts.filter(
      (heart) => !heart.special || now - heart.special.startedAt < totalDuration
    );
  }

  /**
   * Da uma resposta visual ao clique sem acelerar demais o movimento geral.
   */
  _celebrateHit(heart) {
    if (heart.special) return;

    heart.speedY = -1.25;
    heart.alpha = 1;
    heart.size *= 1.12;

    setTimeout(() => {
      if (!heart.special) {
        heart.speedY = -CONFIG.floatingHearts.speed.minY;
      }
    }, 420);
  }
}
