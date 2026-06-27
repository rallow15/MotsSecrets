// ═════════════════════════════════════════════════════════════
// RÈGLES DU JEU (FR/EN)
// ═════════════════════════════════════════════════════════════

export const RULES = {
  fr: [
    {
      mode: 'NORMAL',
      desc: '1 intrus parmi tous les joueurs.',
      steps: [
        "Chaque joueur voit un mot secret. Un seul joueur voit un mot différent : c'est l'intrus.",
        "Tout le monde discute sans révéler son mot.",
        "À la fin, les joueurs votent pour désigner l'intrus.",
        "Si l'intrus est trouvé, les autres gagnent. Sinon, l'intrus gagne.",
      ],
    },
    {
      mode: 'MISTER WHITE',
      desc: "1 joueur n'a aucun mot.",
      steps: [
        "Un joueur (Mister White) ne voit rien. Les autres voient le même mot.",
        'Mister White doit bluffer pour ne pas être découvert.',
        "Si Mister White est voté, il peut tenter de deviner le mot secret.",
        "S'il devine, il gagne quand même !",
      ],
    },
    {
      mode: 'MISTER WHITE + INTRUS',
      desc: '1 sans mot + 1 intrus + les autres.',
      steps: [
        "Mister White n'a pas de mot. L'intrus a un mot différent. Les autres ont le même mot.",
        'Trois camps : les innocents, l\'intrus, Mister White.',
        'Les innocents doivent trouver les deux imposteurs.',
        "L'intrus et Mister White peuvent s'allier ou se trahir.",
      ],
    },
    {
      mode: 'SPÉCIALE',
      desc: 'Chaque joueur ajoute 3 mots personnalisés avant de jouer.',
      steps: [
        'Avant la partie, chaque joueur ajoute 3 mots dans la catégorie SPÉCIALE via le bouton "GÉRER LES MOTS SPÉCIAUX".',
        'Pendant la partie, un mot est choisi aléatoirement parmi tous les mots personnalisés.',
        "Fonctionne comme le mode NORMAL : 1 intrus avec un mot différent, les autres ont le même mot.",
        "Si aucun mot personnalisé n'a été ajouté, tous les joueurs n'ont pas de mot (bluff pur).",
      ],
    },
    {
      mode: 'MIME',
      desc: "Une image s'affiche, il faut mimer l'événement.",
      steps: [
        "Une image montrant un événement s'affiche pour chaque joueur.",
        "Un joueur a une image différente : c'est l'intrus.",
        "Mister White n'a pas d'image, mais reçoit un indice texte sur l'événement.",
        'Chacun donne des indices en mimant sans parler.',
        "Les innocents doivent trouver l'intrus. Mister White peut gagner s'il n'est pas découvert.",
      ],
    },
    {
      mode: 'SPYFALL',
      desc: "1 espion sans mot ou 1 intrus avec un mot différent, devinez ou démasquez.",
      steps: [
        "2 variantes : Espion (ne connaît pas le mot) ou Intrus (a un mot différent).",
        "Les joueurs se posent des questions pour identifier l'espion ou l'intrus.",
        "À tout moment, on peut voter pour accuser quelqu'un. L'espion peut aussi deviner le mot.",
        "Si l'espion/l'intrus est trouvé au vote, il peut tenter de deviner le mot pour gagner.",
        "Si le temps est écoulé, l'espion/l'intrus gagne !",
      ],
    },
  ],
  en: [
    {
      mode: 'NORMAL',
      desc: '1 impostor among all players.',
      steps: [
        'Each player sees a secret word. One player sees a different word: the impostor.',
        'Everyone discusses without revealing their word.',
        'Players vote to identify the impostor.',
        'If the impostor is found, the others win. Otherwise the impostor wins.',
      ],
    },
    {
      mode: 'MISTER WHITE',
      desc: '1 player has no word.',
      steps: [
        'One player (Mister White) sees nothing. The others see the same word.',
        'Mister White must bluff to avoid being caught.',
        'If Mister White is voted out, they can try to guess the secret word.',
        'If they guess correctly, they still win!',
      ],
    },
    {
      mode: 'MISTER WHITE + IMPOSTOR',
      desc: '1 no word + 1 impostor + others.',
      steps: [
        'Mister White has no word. The impostor has a different word. Others share the same word.',
        'Three sides: innocents, impostor, Mister White.',
        'Innocents must find both impostors.',
        'The impostor and Mister White can ally or betray each other.',
      ],
    },
    {
      mode: 'SPECIAL',
      desc: 'Each player adds 3 custom words before playing.',
      steps: [
        'Before the game, each player adds 3 words to the SPECIAL category via the "MANAGE SPECIAL WORDS" button.',
        'During the game, a word is randomly chosen from all custom words.',
        'Works like NORMAL mode: 1 impostor with a different word, others share the same word.',
        'If no custom words were added, all players have no word (pure bluff).',
      ],
    },
    {
      mode: 'MIME',
      desc: 'An image appears, you must mime the event.',
      steps: [
        'An image showing an event appears for each player.',
        'One player has a different image: the impostor.',
        'Mister White has no image, but receives a text clue about the event.',
        'Everyone gives clues by miming without talking.',
        'Innocents must find the impostor. Mister White can win if not discovered.',
      ],
    },
    {
      mode: 'SPYFALL',
      desc: '1 spy with no word or 1 undercover with a different word, guess or expose.',
      steps: [
        "2 variants: Spy (doesn't know the word) or Undercover (has a different word).",
        'Players ask each other questions to identify the spy or undercover.',
        'At any time, players can vote to accuse someone. The spy can also guess the word.',
        'If the spy/undercover is caught in a vote, they can try to guess the word to still win.',
        'If time runs out, the spy/undercover wins!',
      ],
    },
  ],
};