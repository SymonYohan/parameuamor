/**
 * Controla a trilha sonora da pagina.
 *
 * Agora cada cor tem uma musica fixa:
 * - azul: Jaymes Young - Infinity
 * - rosa: Sia - Snowman
 *
 * Se o usuario clicar de novo na mesma cor enquanto a musica dela ja toca,
 * a musica nao reinicia. O clique pode mudar apenas as frases/animações.
 */

import { CONFIG } from './config.js';

export class MusicPlayer {
  constructor() {
    // Audio atualmente ativo na pagina.
    this.audio = null;

    // Cor da musica atual: "blue", "pink" ou null.
    this.currentTrack = null;
  }

  /**
   * Diz se existe uma musica ativa tocando neste momento.
   */
  isPlaying() {
    return Boolean(this.audio && !this.audio.paused && !this.audio.ended);
  }

  /**
   * Diz se a musica da cor informada ja esta tocando.
   */
  isPlayingTrack(trackKey) {
    return this.currentTrack === trackKey && this.isPlaying();
  }

  /**
   * Toca a musica fixa de uma cor.
   *
   * @param {'blue' | 'pink'} trackKey Cor do coracao clicado.
   * @returns {boolean} true quando a musica mudou/iniciou; false quando ja estava tocando.
   */
  playTrack(trackKey) {
    const url = CONFIG.music.tracks?.[trackKey];
    if (!url) return false;

    if (this.isPlayingTrack(trackKey)) {
      return false;
    }

    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }

    this.currentTrack = trackKey;
    this.audio = new Audio(url);
    this.audio.volume = CONFIG.music.volume ?? 0.5;
    this.audio.play().catch(() => {
      // Alguns navegadores bloqueiam audio ate existir um clique valido.
    });

    return true;
  }

  /**
   * Para a musica e volta para o inicio.
   */
  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }

    this.currentTrack = null;
  }
}
