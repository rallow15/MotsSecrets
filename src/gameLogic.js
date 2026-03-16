import { WORD_DB } from './data/words';

/**
 * gameMode: 0 = Normal (1 intrus), 1 = Mister White, 2 = MW + Intrus
 * returns array of { word, role, category }
 * role: 'normal' | 'intrus' | 'mister'
 */
export function generateAssignments(numPlayers, gameMode = 0) {
  const pair = WORD_DB[Math.floor(Math.random() * WORD_DB.length)];
  const [wordA, wordB] = Math.random() < 0.5 ? [pair.a, pair.b] : [pair.b, pair.a];
  const category = pair.cat;

  const roles = [];
  if (gameMode === 0) {
    roles.push('intrus');
    while (roles.length < numPlayers) roles.push('normal');
  } else if (gameMode === 1) {
    roles.push('mister');
    while (roles.length < numPlayers) roles.push('normal');
  } else {
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

export function findWinner(playerNumbers, mystery) {
  let best = 0;
  let bestDiff = Math.abs(playerNumbers[0] - mystery);
  for (let i = 1; i < playerNumbers.length; i++) {
    const diff = Math.abs(playerNumbers[i] - mystery);
    if (diff < bestDiff) { bestDiff = diff; best = i; }
  }
  return best;
}
