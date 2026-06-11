/**
 * Céu cinematográfico desenhado no canvas.
 *
 * Esta camada fica atrás dos corações e cria:
 * - fundo escuro em estilo cinema;
 * - estrelas piscando em velocidades diferentes;
 * - brilhos suaves no horizonte;
 * - vinheta para deixar o centro mais romântico e destacado.
 */

import { CONFIG } from './config.js';
import { seededRandom } from './utils.js';

export class SkyLayer {
  constructor() {
    this.stars = [];
    this.fireflies = [];
    this.initialized = false;
  }

  /**
   * Cria posições determinísticas para as estrelas.
   * Assim o céu não "salta" de forma estranha a cada frame.
   */
  init(w, h) {
    if (this.initialized) return;
    this.initialized = true;
    this.stars = [];
    this.fireflies = [];

    for (let i = 0; i < CONFIG.sky.starCount; i++) {
      const bigStar = seededRandom(i + 50) > 0.86;

      this.stars.push({
        x: seededRandom(i) * w,
        y: seededRandom(i + 100) * h * 0.82,
        size: bigStar
          ? 1.4 + seededRandom(i + 200) * 1.8
          : 0.45 + seededRandom(i + 210) * 1.1,
        twinkle: seededRandom(i + 300) * Math.PI * 2,
        speed: 0.008 + seededRandom(i + 400) * 0.035,
        alpha: 0.28 + seededRandom(i + 500) * 0.72,
        hasCross: bigStar,
      });
    }

    for (let i = 0; i < CONFIG.sky.fireflyCount; i++) {
      this.fireflies.push({
        x: seededRandom(i + 600) * w,
        y: h * 0.55 + seededRandom(i + 700) * h * 0.35,
        vx: (seededRandom(i + 800) - 0.5) * 0.16,
        vy: (seededRandom(i + 900) - 0.5) * 0.12,
        phase: seededRandom(i + 1000) * Math.PI * 2,
      });
    }
  }

  /**
   * Atualiza apenas os valores de animação: piscada e deslocamento leve.
   */
  update(w, h, time) {
    this.stars.forEach((star) => {
      star.twinkle += star.speed;
    });

    this.fireflies.forEach((firefly) => {
      firefly.x += firefly.vx + Math.sin(time * 0.0007 + firefly.phase) * 0.08;
      firefly.y += firefly.vy + Math.cos(time * 0.0009 + firefly.phase) * 0.06;
      firefly.phase += 0.012;

      if (firefly.x < 0) firefly.x = w;
      if (firefly.x > w) firefly.x = 0;
      if (firefly.y < h * 0.4) firefly.y = h * 0.88;
      if (firefly.y > h * 0.92) firefly.y = h * 0.45;
    });
  }

  /**
   * Renderiza o cenário completo a cada frame.
   */
  render(ctx, w, h, time, progress) {
    if (progress < 0.05) return;

    const skyAlpha = Math.min(1, progress * 2);

    this._drawCinemaSky(ctx, w, h, skyAlpha);
    this._drawSoftLightBands(ctx, w, h, time, skyAlpha);
    this._drawStars(ctx, skyAlpha);
    this._drawFireflies(ctx, skyAlpha);
    this._drawVignette(ctx, w, h, skyAlpha);
    this._drawLetterboxGlow(ctx, w, h, skyAlpha);
  }

  /**
   * Gradiente base: alto mais profundo, centro levemente roxo e chão escuro.
   */
  _drawCinemaSky(ctx, w, h, alpha) {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, `rgba(3, 4, 14, ${alpha})`);
    sky.addColorStop(0.42, `rgba(18, 11, 35, ${alpha})`);
    sky.addColorStop(0.75, `rgba(8, 18, 28, ${alpha})`);
    sky.addColorStop(1, `rgba(2, 3, 8, ${alpha})`);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
  }

  /**
   * Luzes amplas e discretas para lembrar projetor de cinema no céu.
   */
  _drawSoftLightBands(ctx, w, h, time, alpha) {
    const drift = Math.sin(time * 0.00025) * w * 0.04;
    const glow = ctx.createRadialGradient(
      w * 0.5 + drift,
      h * 0.38,
      0,
      w * 0.5 + drift,
      h * 0.38,
      w * 0.62
    );

    glow.addColorStop(0, `rgba(255, 125, 190, ${0.09 * alpha})`);
    glow.addColorStop(0.35, `rgba(115, 145, 255, ${0.055 * alpha})`);
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
  }

  /**
   * Estrelas com piscadas independentes.
   */
  _drawStars(ctx, alpha) {
    this.stars.forEach((star) => {
      const pulse = 0.45 + Math.sin(star.twinkle) * 0.45;
      const starAlpha = Math.max(0.08, star.alpha * alpha * pulse);

      ctx.fillStyle = `rgba(255, 248, 225, ${starAlpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();

      if (star.hasCross) {
        this._drawStarCross(ctx, star, starAlpha);
      }
    });
  }

  _drawStarCross(ctx, star, alpha) {
    const ray = star.size * 3.4;
    ctx.save();
    ctx.globalAlpha = alpha * 0.75;
    ctx.strokeStyle = 'rgba(255, 245, 210, 0.85)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(star.x - ray, star.y);
    ctx.lineTo(star.x + ray, star.y);
    ctx.moveTo(star.x, star.y - ray);
    ctx.lineTo(star.x, star.y + ray);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Poucos pontos de luz baixos, bem lentos, para não disputar com os corações.
   */
  _drawFireflies(ctx, alpha) {
    this.fireflies.forEach((firefly) => {
      const glow = 0.25 + Math.sin(firefly.phase * 2) * 0.18;
      const g = ctx.createRadialGradient(
        firefly.x,
        firefly.y,
        0,
        firefly.x,
        firefly.y,
        14
      );
      g.addColorStop(0, `rgba(255, 230, 150, ${glow * alpha})`);
      g.addColorStop(1, 'rgba(255, 230, 150, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(firefly.x, firefly.y, 14, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Escurece bordas, criando foco visual no centro da cena.
   */
  _drawVignette(ctx, w, h, alpha) {
    const vignette = ctx.createRadialGradient(
      w * 0.5,
      h * 0.5,
      Math.min(w, h) * 0.15,
      w * 0.5,
      h * 0.5,
      Math.max(w, h) * 0.72
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, `rgba(0, 0, 0, ${0.48 * alpha})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }

  /**
   * Barras muito sutis no topo e no rodapé, como uma tela widescreen.
   */
  _drawLetterboxGlow(ctx, w, h, alpha) {
    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${0.22 * alpha})`;
    ctx.fillRect(0, 0, w, Math.max(18, h * 0.045));
    ctx.fillRect(0, h - Math.max(18, h * 0.045), w, Math.max(18, h * 0.045));
    ctx.restore();
  }
}
