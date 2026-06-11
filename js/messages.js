/**
 * Camada responsavel por mostrar frases romanticas e versiculos na tela.
 */

import { CONFIG } from './config.js';
import { pickRandom } from './utils.js';

export class MessageLayer {
  /**
   * @param {HTMLElement} container Elemento que recebe as mensagens flutuantes.
   */
  constructor(container) {
    this.container = container;
    this.queue = [];
    this.lastBibleVerseIndex = -1;
  }

  /**
   * Cria uma mensagem visual, espera o tempo configurado e remove com fade.
   */
  show(text, type = 'normal') {
    const el = document.createElement('div');
    el.className = `floating-message floating-message--${type}`;
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.textContent = text;
    this.container.appendChild(el);

    const displayTime =
      type === 'error' ? CONFIG.messages.errorDisplayMs : CONFIG.messages.displayMs;

    setTimeout(() => {
      el.classList.add('floating-message--out');
      setTimeout(() => el.remove(), CONFIG.messages.fadeOutMs);
    }, displayTime - CONFIG.messages.fadeOutMs);
  }

  /**
   * Mostra uma frase romantica aleatoria ao clicar em coracoes azuis.
   */
  showRandom() {
    this.show(pickRandom(CONFIG.messages.texts));
  }

  /**
   * Mostra o versiculo quando dois cliques da mesma cor acontecem quase juntos.
   */
  showBibleVerse() {
    const verses = CONFIG.floatingHearts.specialHeart.bibleVerses;
    if (!verses || verses.length === 0) return;

    let nextIndex = Math.floor(Math.random() * verses.length);
    if (verses.length > 1 && nextIndex === this.lastBibleVerseIndex) {
      nextIndex = (nextIndex + 1) % verses.length;
    }

    this.lastBibleVerseIndex = nextIndex;
    this.show(verses[nextIndex], 'verse');
  }

  /**
   * Mostra a mensagem quando um coracao completa a quantidade de cliques.
   */
  showGrowthMessage() {
    this.show(CONFIG.floatingHearts.specialHeart.growthMessage, 'growth');
  }
}
