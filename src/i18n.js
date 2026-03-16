let currentLang = 'fr';

export function getLang() { return currentLang; }
export function setLang(lang) { currentLang = lang; }

const T = {
  fr: {
    subtitle:       "TROUVEZ L'INTRUS PARMI VOUS",
    players:        'JOUEURS',
    gameMode:       'MODE DE JEU',
    mode0title:     'NORMAL',
    mode0desc:      '1 intrus parmi tous les joueurs',
    mode1title:     'MISTER WHITE',
    mode1desc:      '1 joueur sans mot, les autres identiques',
    mode2title:     'MISTER WHITE + INTRUS',
    mode2desc:      '1 sans mot + 1 intrus + les autres',
    start:          'DÉMARRER',
    playerLabel:    (n) => `JOUEUR ${n}`,
    namePlaceholder:'Ton prénom...',
    nameHint:       'OPTIONNEL — APPUIE SUR ENTRÉE',
    touchScreen:    "Touche\nl'écran",
    memorize:       'MÉMORISE TON MOT',
    startsFirst:    'COMMENCE EN PREMIER !',
    revealPlayers:  'RÉVÉLER LES JOUEURS',
    whoHadWhat:     'QUI AVAIT QUOI ?',
    tapToReveal:    'APPUIE POUR RÉVÉLER',
    replay:         '🔄  REJOUER',
    newGame:        'NOUVELLE PARTIE',
    roleIntrus:     "L'INTRUS",
    roleMister:     'MR WHITE',
    roleInnocent:   'INNOCENT',
    roleStarts:     'COMMENCE',
    playerFallback: (n) => `JOUEUR ${n}`,
  },
  en: {
    subtitle:       'FIND THE IMPOSTOR AMONG YOU',
    players:        'PLAYERS',
    gameMode:       'GAME MODE',
    mode0title:     'NORMAL',
    mode0desc:      '1 impostor among all players',
    mode1title:     'MISTER WHITE',
    mode1desc:      '1 player with no word, others identical',
    mode2title:     'MISTER WHITE + IMPOSTOR',
    mode2desc:      '1 no word + 1 impostor + others',
    start:          'START',
    playerLabel:    (n) => `PLAYER ${n}`,
    namePlaceholder:'Your name...',
    nameHint:       'OPTIONAL — PRESS ENTER',
    touchScreen:    'Touch\nthe screen',
    memorize:       'MEMORIZE YOUR WORD',
    startsFirst:    'STARTS FIRST!',
    revealPlayers:  'REVEAL PLAYERS',
    whoHadWhat:     'WHO HAD WHAT?',
    tapToReveal:    'TAP TO REVEAL',
    replay:         '🔄  REPLAY',
    newGame:        'NEW GAME',
    roleIntrus:     'IMPOSTOR',
    roleMister:     'MR WHITE',
    roleInnocent:   'INNOCENT',
    roleStarts:     'STARTS',
    playerFallback: (n) => `PLAYER ${n}`,
  },
};

export function t(key, arg) {
  const val = T[currentLang][key];
  if (typeof val === 'function') return val(arg);
  return val ?? key;
}
