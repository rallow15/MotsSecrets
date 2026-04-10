import { WORD_DB, WORD_DB_EN, generateBotClue, generateBotClues, botVote as botVoteLogic } from './data/words';
import { getLang } from './i18n';

/**
 * gameMode: 0 = Normal (1 intrus), 1 = Mister White, 2 = MW + Intrus
 * selectedCategory: nom de la catégorie ou null pour aléatoire
 * returns array of { word, role, category }
 * role: 'normal' | 'intrus' | 'mister'
 */
export function generateAssignments(numPlayers, gameMode = 0, selectedCategory = null) {
  // Utiliser la base de mots selon la langue
  const lang = getLang();
  const wordDb = lang === 'en' ? WORD_DB_EN : WORD_DB;

  // Choisir une catégorie (aléatoire ou sélectionnée)
  let categoryData;
  if (selectedCategory) {
    categoryData = wordDb.find(d => d.cat === selectedCategory);
    if (!categoryData) {
      categoryData = wordDb[Math.floor(Math.random() * wordDb.length)];
    }
  } else {
    categoryData = wordDb[Math.floor(Math.random() * wordDb.length)];
  }
  const category = categoryData.cat;
  const words = categoryData.words;

  // Choisir 2 mots différents aléatoirement dans la catégorie
  const idx1 = Math.floor(Math.random() * words.length);
  let idx2 = Math.floor(Math.random() * words.length);
  while (idx2 === idx1 && words.length > 1) {
    idx2 = Math.floor(Math.random() * words.length);
  }
  const wordA = words[idx1];
  const wordB = words[idx2];

  const roles = [];
  if (gameMode === 0) {
    roles.push('intrus');
    while (roles.length < numPlayers) roles.push('normal');
  } else if (gameMode === 1) {
    roles.push('mister');
    while (roles.length < numPlayers) roles.push('normal');
  } else if (gameMode === 2) {
    roles.push('mister');
    roles.push('intrus');
    while (roles.length < numPlayers) roles.push('normal');
  } else if (gameMode === 3) {
    // Mode CONTRE L'ORDI : même distribution que mode 2 (1 mister + 1 intrus + normaux)
    // La différence est gérée dans VsAIGameScreen avec les bots
    roles.push('mister');
    roles.push('intrus');
    while (roles.length < numPlayers) roles.push('normal');
  }

  // Shuffle roles
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  return roles.map((role) => ({
    word: role === 'intrus' ? wordB : role === 'mister' ? null : wordA,
    role,
    category,
  }));
}

/**
 * Génère les assignments pour le mode CONTRE L'ORDI
 * @param {number} numBots - Nombre de bots (1 humain fixe + nb bots)
 * @param {string} humanName - Nom de l'humain
 * @param {string[]} botNames - Noms des bots (optionnel, généré par défaut)
 * @returns {{assignments: Object[], playerNames: string[], playerTypes: string[]}}
 */
export function generateVsAIAssignments(numBots, humanName = '', botNames = []) {
  const totalPlayers = 1 + numBots; // 1 humain + nb bots

  // Générer les rôles (1 seul intrus, tous les autres normaux)
  const roles = ['intrus'];
  while (roles.length < totalPlayers) roles.push('normal');

  // Mélanger les rôles
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  // Choisir une catégorie aléatoire (utiliser la bonne DB selon la langue)
  const lang = getLang();
  const wordDb = lang === 'en' ? WORD_DB_EN : WORD_DB;
  const categoryData = wordDb[Math.floor(Math.random() * wordDb.length)];
  const category = categoryData.cat;
  const words = categoryData.words;

  // Choisir 2 mots différents aléatoirement dans la catégorie
  const idx1 = Math.floor(Math.random() * words.length);
  let idx2 = Math.floor(Math.random() * words.length);
  while (idx2 === idx1 && words.length > 1) {
    idx2 = Math.floor(Math.random() * words.length);
  }
  const wordA = words[idx1];
  const wordB = words[idx2];

  // Construire les assignments avec les mots
  const assignments = roles.map((role) => ({
    word: role === 'intrus' ? wordB : wordA, // Intrus a wordB, tous les autres ont wordA
    role,
    category,
  }));

  // Noms des joueurs : humain toujours en premier, puis les bots
  const defaultBotNames = ['Bot Alpha', 'Bot Beta', 'Bot Gamma', 'Bot Delta', 'Bot Epsilon', 'Bot Zeta'];
  const finalBotNames = botNames.length >= numBots
    ? botNames.slice(0, numBots)
    : [...botNames, ...defaultBotNames.slice(0, numBots - botNames.length)];

  const playerNames = [humanName || 'Joueur 1', ...finalBotNames];

  // Types : humain en premier, puis bots
  const playerTypes = ['human', ...Array(numBots).fill('bot')];

  return {
    assignments,
    playerNames,
    playerTypes,
  };
}

/**
 * Détermine le gagnant du mode Vs AI
 * @param {Object[]} assignments - Assignments de tous les joueurs
 * @param {Object} votes - Map { voterIndex: targetIndex }
 * @param {string[]} playerTypes - Types de joueurs ('human' ou 'bot')
 * @returns {{intruderFound: boolean, intruderIndex: number|null, voteCounts: Object, winner: 'intruder'|'innocents'|'tie', mostVoted: number|null, tiePlayers: number[]}}
 */
export function calculateVsAIResult(assignments, votes, playerTypes) {
  // Trouver l'index de l'intrus
  const intruderIndex = assignments.findIndex(a => a.role === 'intrus');

  // Compter les votes
  const voteCounts = {};
  Object.values(votes).forEach(target => {
    voteCounts[target] = (voteCounts[target] || 0) + 1;
  });

  // Trouver le(s) joueur(s) avec le plus de votes
  const voteEntries = Object.entries(voteCounts);
  const maxVotes = Math.max(...voteEntries.map(([, count]) => count), 0);
  const mostVotedPlayers = voteEntries
    .filter(([, count]) => count === maxVotes)
    .map(([idx]) => parseInt(idx));

  // Vérifier si l'intrus a été trouvé (a le plus de votes)
  const intruderHasMostVotes = mostVotedPlayers.includes(intruderIndex);

  // Déterminer le gagnant
  let winner = 'intruder';
  if (mostVotedPlayers.length === 1 && intruderHasMostVotes) {
    // Intrus trouvé UNIQUEMENT
    winner = 'innocents';
  } else if (mostVotedPlayers.length > 1) {
    // Égalité - on refera un tour
    winner = 'tie';
  }
  // Sinon intruder gagne par défaut

  return {
    intruderFound: intruderHasMostVotes && mostVotedPlayers.length === 1,
    intruderIndex,
    voteCounts,
    winner,
    mostVoted: mostVotedPlayers.length === 1 ? mostVotedPlayers[0] : null,
    tiePlayers: mostVotedPlayers.length > 1 ? mostVotedPlayers : [],
  };
}

export function findWinner(playerNumbers, mystery) {
  let best = 0;
  let bestDiff = Math.abs(playerNumbers[0] - mystery);
  for (let i = 1; i < playerNumbers.length; i++) {
    const diff = Math.abs(playerNumbers[i] - mystery);
    if (diff < bestDiff) { bestDiff = diff; best = i; }
  }
  return best;
}

// Ré-export des fonctions bot depuis words.js
export { generateBotClue, botVoteLogic as botVote };

/**
 * Génère un indice unique pour un bot (utilisé en temps réel)
 * @param {string} word - Le mot secret
 * @param {string} role - 'normal', 'intrus', ou 'mister'
 * @param {string} category - La catégorie du mot
 * @param {number} tour - 1, 2, ou 3
 * @param {number} botIndex - Index du bot pour varier les réponses
 * @returns {string} Un indice généré
 */
export function generateUniqueBotClue(word, role, category, tour, botIndex = 0) {
  // Utiliser generateBotClue mais avec une variation basée sur botIndex et tour
  const baseClue = generateBotClue(word, role, category, tour);

  // Ajouter une variation pour que chaque bot ait un indice légèrement différent
  const variations = [
    baseClue,
    baseClue,
    baseClue,
    // Quelques variations possibles
    tour === 1 ? "Indice général" : tour === 2 ? "Plus spécifique" : "Très précis",
  ];

  return variations[botIndex % variations.length] || baseClue;
}
