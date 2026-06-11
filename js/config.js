/**
 * Configuracao central: edite aqui codigo, mensagens, musicas e tempos.
 */
export const CONFIG = {
  secretCode: '28022026',

  grid: {
    width: 28,
    height: 22,
    cellPx: 14,
    scrambleIntervalMs: 120,
  },

  codeChars:
    '01{}[]<>/\\|#@$%&*+=~:;abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',

  heartShape: [
    '    ##    ##    ',
    '  ##############  ',
    ' ################ ',
    '##################',
    '##################',
    ' ################ ',
    '  ##############  ',
    '   ############   ',
    '    ##########    ',
    '     ########     ',
    '      ######      ',
    '       ####       ',
    '        ##        ',
  ],

  heartTransform: {
    steps: 30,
    stepDelayMs: 38,
    pulseCount: 3,
    pulseDurationMs: 550,
    pulseRestMs: 350,
    pulseScale: 1.08,
    chars: ['♥', '<', '3', '#', '*', '♡', '❤'],
  },

  phases: {
    fadeCodeMs: 800,
    fadeTreeMs: 1500,
    beforeTreeMs: 600,
  },

  tree: {
    growDurationMs: 5500,
    leafCount: 120,
    trunkHeight: 200,
    trunkWidth: 24,
    groundRatio: 0.92,
  },

  branches: [
    { angle: -0.55, len: 150, thick: 11 },
    { angle: 0.52, len: 140, thick: 10 },
    { angle: -0.25, len: 110, thick: 8 },
    { angle: 0.38, len: 105, thick: 8 },
    { angle: -0.78, len: 92, thick: 7 },
    { angle: 0.72, len: 88, thick: 7 },
    { angle: -0.05, len: 125, thick: 9 },
    { angle: -0.42, len: 75, thick: 5 },
    { angle: 0.48, len: 70, thick: 5 },
  ],

  floatingHearts: {
    initialPink: 34,
    initialBlue: 18,
    maxOnScreen: 82,
    spawnDuringGrowMs: 230,
    finalBurstCount: 24,
    finalBurstDelayMs: 95,
    speed: {
      minY: 0.08,
      maxY: 0.38,
      maxX: 0.22,
      wobbleMin: 0.006,
      wobbleRange: 0.015,
    },
    specialHeart: {
      clicksNeeded: 7,
      pulseCount: 15,
      pulseDurationMs: 820,
      sameColorWindowMs: 520,
      size: 58,
      growthMessage:
        'Nosso amor cresce a cada dia, assim como esse coração.',
      bibleVerses: [
        'Provérbios 31:10: "Mulher virtuosa, quem a achará? O seu valor muito excede ao de rubis."',
        'Colossenses 3:14: "Acima de tudo, porém, revistam-se do amor, que é o elo perfeito."',
        'Filipenses 1:3: "Agradeço ao meu Deus todas as vezes que me lembro de vocês."',
      ],
    },
  },

  messages: {
    displayMs: 4200,
    fadeInMs: 600,
    fadeOutMs: 800,
    texts: [
      'Meu coração escolhe você todos os dias.',
      'Você é o meu carinho preferido em forma de pessoa.',
      'Com você, até o silêncio fica bonito.',
      'Te amar é a parte mais doce da minha vida.',
      'Nosso amor é o meu lugar favorito.',
      'Você transforma qualquer instante em lembrança linda.',
      'Cada batida desse coração guarda um pouco de nós.',
      'Meu mundo fica mais leve quando penso em você.',
      'Você é meu abraço, minha paz e meu sorriso mais sincero.',
      'Que o nosso amor continue florescendo em cada detalhe.',
      '28.02.2026: nosso dia especial e importante, guardado no coração.',
      'Algumas datas viram eternidade quando têm amor de verdade.',
      'O tempo com você é o presente que eu sempre quero abrir.',
      'Eu te escolheria de novo, em todos os dias e em todas as vidas.',
    ],
    errorMsg:
      'NOSSO DIA ESPECIAL E IMPORTANTE mora no meu coração.',
    errorDisplayMs: 3200,
  },

  music: {
    volume: 0.55,
    tracks: {
      blue: 'assets/music/jaymes-young-infinity.mp3',
      pink: 'assets/music/sia-snowman.mp3',
    },
  },

  sky: {
    starCount: 150,
    fireflyCount: 10,
  },
};
