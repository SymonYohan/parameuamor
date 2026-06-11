/**
 * Renderização da árvore: tronco, galhos, raízes, grama e folhas-coração.
 */

import { CONFIG } from './config.js';
import { seededRandom, easeOutCubic } from './utils.js';

export class TreeRenderer {
  constructor() {
    this.leafPositions = [];
    this.progress = 0;
    this.done = false;
    this.growStart = 0;
  }

  startGrowing() {
    this.growStart = performance.now();
    this.done = false;
    this.leafPositions = [];
  }

  tick(now) {
    const raw = Math.min(
      1,
      (now - this.growStart) / CONFIG.tree.growDurationMs
    );
    this.progress = easeOutCubic(raw);
    if (raw >= 1 && !this.done) this.done = true;
    return this.progress;
  }

  isDone() {
    return this.done;
  }

  render(ctx, w, h, progress) {
    ctx.clearRect(0, 0, w, h);

    const groundY = h * CONFIG.tree.groundRatio;
    const trunkBase = w / 2;
    const scale = Math.min(w, h) / 800;

    this._drawGround(ctx, w, h, groundY, progress);
    if (progress < 0.04) return;

    const trunkH = CONFIG.tree.trunkHeight * scale * progress;
    const trunkW = CONFIG.tree.trunkWidth * scale * Math.min(1, progress * 2.2);

    this._drawTrunk(ctx, trunkBase, groundY, trunkW, trunkH, progress, scale);

    if (progress < 0.18) return;

    const branchProg = (progress - 0.18) / 0.82;
    const trunkTop = groundY - trunkH;

    CONFIG.branches.forEach((b, i) => {
      const stagger = i * 0.055;
      const bp = Math.max(
        0,
        Math.min(1, (branchProg - stagger) / (1 - stagger + 0.001))
      );
      if (bp <= 0) return;
      this._drawBranch(
        ctx,
        trunkBase,
        trunkTop + 18 * scale,
        b.angle,
        b.len * scale * bp,
        b.thick * scale,
        bp,
        i
      );
    });

    if (branchProg > 0.32) {
      const leafProg = (branchProg - 0.32) / 0.68;
      this._drawHeartLeaves(
        ctx,
        trunkBase,
        trunkTop,
        scale,
        leafProg * progress
      );
    }
  }

  _drawGround(ctx, w, h, groundY, progress) {
    const soilGrad = ctx.createLinearGradient(0, groundY - 50, 0, h);
    soilGrad.addColorStop(0, 'rgba(35, 22, 18, 0)');
    soilGrad.addColorStop(0.25, 'rgba(48, 30, 24, 0.9)');
    soilGrad.addColorStop(1, 'rgba(22, 14, 11, 1)');
    ctx.fillStyle = soilGrad;
    ctx.fillRect(0, groundY - 25 * progress, w, h);

    if (progress > 0.25) {
      const grassA = (progress - 0.25) / 0.75;
      ctx.save();
      for (let i = 0; i < 45; i++) {
        const gx = (i / 45) * w + (seededRandom(i + 50) - 0.5) * 30;
        const gh = 8 + seededRandom(i + 60) * 18;
        const lean = (seededRandom(i + 70) - 0.5) * 0.4;
        ctx.strokeStyle = `rgba(${40 + (i % 3) * 15}, ${90 + (i % 4) * 10}, ${35 + (i % 2) * 8}, ${0.5 * grassA})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(gx, groundY);
        ctx.quadraticCurveTo(
          gx + lean * 15,
          groundY - gh * 0.5,
          gx + lean * 25,
          groundY - gh * grassA
        );
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  _drawTrunk(ctx, x, baseY, w, h, progress, scale) {
    const segments = 14;
    ctx.save();

    for (let i = 0; i < segments; i++) {
      const t0 = i / segments;
      const t1 = (i + 1) / segments;
      const y0 = baseY - h * t0;
      const y1 = baseY - h * t1;
      const wobble = Math.sin(i * 1.15 + 0.5) * w * 0.09;
      const grad = ctx.createLinearGradient(x - w, y0, x + w, y1);
      grad.addColorStop(0, '#3d2817');
      grad.addColorStop(0.35, '#5c3d28');
      grad.addColorStop(0.65, '#4a3020');
      grad.addColorStop(1, '#2a1810');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x - w / 2 + wobble, y0);
      ctx.lineTo(x + w / 2 + wobble, y0);
      ctx.lineTo(x + (w / 2) * 0.82 - wobble * 0.45, y1);
      ctx.lineTo(x - (w / 2) * 0.82 - wobble * 0.45, y1);
      ctx.closePath();
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(18, 8, 4, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      const ty = baseY - h * (0.15 + i * 0.12);
      const side = i % 2 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(x + side * w * 0.22, ty);
      ctx.lineTo(x + side * w * 0.14, ty - h * 0.07);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(60, 45, 30, 0.25)';
    for (let i = 0; i < 3; i++) {
      const ty = baseY - h * (0.35 + i * 0.2);
      ctx.beginPath();
      ctx.ellipse(x, ty, w * 0.35, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (progress > 0.3) {
      const rootA = (progress - 0.3) / 0.7;
      const sc = w / 12;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(32, 20, 12, 0.9)';
      ctx.lineWidth = 4 * sc * rootA;
      [-1, 1, -0.5, 0.58, -0.85, 0.9].forEach((dir, i) => {
        ctx.beginPath();
        ctx.moveTo(x, baseY);
        ctx.quadraticCurveTo(
          x + dir * (26 + i * 2) * sc,
          baseY + 5,
          x + dir * (44 + i * 14) * sc,
          baseY + 14 + (i % 3) * 4
        );
        ctx.stroke();
      });
    }

    ctx.restore();
  }

  _drawBranch(ctx, x, y, angle, len, thick, progress, seed) {
    const endX = x + Math.cos(angle) * len;
    const endY = y + Math.sin(angle) * len;
    const grad = ctx.createLinearGradient(x, y, endX, endY);
    grad.addColorStop(0, '#4f3524');
    grad.addColorStop(1, '#352218');
    ctx.strokeStyle = grad;
    ctx.lineWidth = thick;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const cpX =
      x + Math.cos(angle) * len * 0.48 + Math.sin(seed * 1.7) * 10;
    const cpY = y + Math.sin(angle) * len * 0.48;
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.stroke();

    if (progress > 0.55 && len > 35) {
      const sub = (progress - 0.55) / 0.45;
      const subLen = len * 0.48;
      this._drawBranch(
        ctx,
        endX,
        endY,
        angle - 0.38,
        subLen,
        thick * 0.52,
        sub,
        seed + 1
      );
      this._drawBranch(
        ctx,
        endX,
        endY,
        angle + 0.32,
        subLen * 0.88,
        thick * 0.48,
        sub,
        seed + 2
      );
      if (progress > 0.75 && len > 60) {
        const sub2 = (progress - 0.75) / 0.25;
        this._drawBranch(
          ctx,
          endX,
          endY,
          angle - 0.15,
          subLen * 0.35,
          thick * 0.3,
          sub2,
          seed + 3
        );
      }
    }
  }

  _initLeaves(cx, trunkTop, scale) {
    if (this.leafPositions.length) return;

    const count = CONFIG.tree.leafCount;
    for (let i = 0; i < count; i++) {
      const angle = seededRandom(i) * Math.PI * 2;
      const dist = (70 + seededRandom(i + 50) * 220) * scale;
      const px = cx + Math.cos(angle) * dist * (0.45 + seededRandom(i + 100) * 0.85);
      const py = trunkTop - (35 + seededRandom(i + 200) * 250) * scale;
      this.leafPositions.push({
        x: px,
        y: py,
        size: (12 + seededRandom(i + 300) * 20) * scale,
        rot: seededRandom(i + 400) * Math.PI,
        hue: 88 + seededRandom(i + 500) * 52,
        sat: 0.42 + seededRandom(i + 600) * 0.28,
        light: seededRandom(i + 650) * 0.15,
        delay: seededRandom(i + 700) * 0.55,
        veinDetail: seededRandom(i + 750) > 0.3 ? 5 : 4,
      });
    }
  }

  _drawHeartLeaves(ctx, cx, trunkTop, scale, leafProgress) {
    this._initLeaves(cx, trunkTop, scale);

    this.leafPositions.forEach((leaf) => {
      const lp = Math.max(
        0,
        Math.min(1, (leafProgress - leaf.delay) / (1 - leaf.delay + 0.01))
      );
      if (lp <= 0) return;

      const grow = lp < 0.28 ? lp / 0.28 : 1;
      const alpha = lp * 0.96;
      const L = leaf.light;
      const color = {
        light: `hsla(${leaf.hue}, ${leaf.sat * 100}%, ${48 + L * 100}%, 1)`,
        mid: `hsla(${leaf.hue}, ${leaf.sat * 100}%, ${36 + L * 80}%, 1)`,
        dark: `hsla(${leaf.hue - 12}, ${leaf.sat * 100}%, ${26 + L * 60}%, 1)`,
        edge: `hsla(${leaf.hue - 18}, 48%, 24%, 0.65)`,
        vein: `hsla(${leaf.hue - 22}, 38%, 20%, 0.75)`,
      };

      this._drawHeartLeaf(
        ctx,
        leaf.x,
        leaf.y,
        leaf.size * grow,
        leaf.rot,
        color,
        alpha,
        leaf.veinDetail
      );
    });
  }

  _drawHeartLeaf(ctx, x, y, size, rotation, color, alpha, veinCount) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;

    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    this._heartLeafPath(ctx, size * 1.03, 2.5, 3.5);
    ctx.fill();

    const grad = ctx.createLinearGradient(-size, -size, size, size * 0.5);
    grad.addColorStop(0, color.light);
    grad.addColorStop(0.45, color.mid);
    grad.addColorStop(1, color.dark);
    ctx.fillStyle = grad;
    ctx.beginPath();
    this._heartLeafPath(ctx, size, 0, 0);
    ctx.fill();

    ctx.strokeStyle = color.edge;
    ctx.lineWidth = 0.9;
    ctx.stroke();

    ctx.strokeStyle = color.vein;
    ctx.lineWidth = 0.55;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(0, size * 0.58);
    ctx.quadraticCurveTo(0, size * 0.1, 0, -size * 0.38);
    ctx.stroke();

    for (let i = 0; i < veinCount; i++) {
      const t = 0.12 + i * (0.72 / veinCount);
      const sy = size * 0.42 - t * size * 0.95;
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.quadraticCurveTo(
          side * size * 0.14,
          sy - size * 0.1,
          side * (size * 0.32 - i * 0.03),
          sy - size * 0.22
        );
        ctx.stroke();
      });
    }

    ctx.fillStyle = color.vein;
    ctx.globalAlpha = alpha * 0.22;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(
        (i - 1.5) * size * 0.1,
        -size * 0.08 + (i % 2) * 0.04,
        1.1,
        2.2,
        0.25 + i * 0.1,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.restore();
  }

  _heartLeafPath(ctx, s, ox, oy) {
    const w = s * 0.95;
    const h = s * 1.12;
    ctx.moveTo(ox, oy + h * 0.35);
    ctx.bezierCurveTo(
      ox - w * 0.9,
      oy + h * 0.1,
      ox - w * 0.85,
      oy - h * 0.45,
      ox - w * 0.35,
      oy - h * 0.5
    );
    ctx.bezierCurveTo(
      ox - w * 0.05,
      oy - h * 0.75,
      ox,
      oy - h * 0.55,
      ox,
      oy - h * 0.35
    );
    ctx.bezierCurveTo(
      ox,
      oy - h * 0.55,
      ox + w * 0.05,
      oy - h * 0.75,
      ox + w * 0.35,
      oy - h * 0.5
    );
    ctx.bezierCurveTo(
      ox + w * 0.85,
      oy - h * 0.45,
      ox + w * 0.9,
      oy + h * 0.1,
      ox,
      oy + h * 0.35
    );
    ctx.closePath();
  }
}
