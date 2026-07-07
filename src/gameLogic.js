import { WORD_DB, WORD_DB_EN, SPYFALL_HINTS_FR, SPYFALL_HINTS_EN } from './data/words';
import { getLang } from './i18n';

/**
 * gameMode: 0 = Normal (1 intrus), 1 = Mister White, 2 = MW + Intrus, 3 = Spyfall
 * numUndercovers: nombre d'intrus (défaut 1 si gameMode 0 ou 2)
 * numMisterWhites: nombre de Mister White (défaut 1 si gameMode 1 ou 2)
 * selectedCategory: nom de la catégorie ou null pour aléatoire
 * customWords: mots personnalisés pour la catégorie SPÉCIALE (optionnel)
 * mimerMode: si true, utilise des images à mimer au lieu des mots
 * returns array of { word, role, category, isMimer }
 * role: 'normal' | 'intrus' | 'mister' | 'spy'
 */
export function generateAssignments(numPlayers, gameMode = 0, selectedCategory = null, customWords = [], mimerMode = false, numUndercovers = 1, numMisterWhites = 0, easyMode = false, spyfallUndercover = false) {
  // Utiliser la base de mots selon la langue
  const lang = getLang();
  const wordDb = lang === 'en' ? WORD_DB_EN : WORD_DB;

  // Choisir une catégorie (aléatoire ou sélectionnée)
  // Exclure MIMER si le mode mime n'est pas activé, SPECIALE si pas de mots personnalisés
  // Exclure TRAVAIL/JOBS si on n'est pas en mode Spyfall
  const spyfallOnlyCats = ['TRAVAIL', 'JOBS'];
  const eligibleDb = mimerMode
    ? wordDb
    : wordDb.filter(d => {
        if (d.cat === 'MIMER' || d.cat === 'SPECIALE') return false;
        if (gameMode !== 3 && spyfallOnlyCats.includes(d.cat)) return false;
        return true;
      });

  let categoryData;
  if (selectedCategory) {
    categoryData = wordDb.find(d => d.cat === selectedCategory);
    if (!categoryData) {
      categoryData = eligibleDb[Math.floor(Math.random() * eligibleDb.length)];
    }
  } else {
    categoryData = eligibleDb[Math.floor(Math.random() * eligibleDb.length)];
  }
  const category = categoryData.cat;

  // Mode MIMER : utiliser la catégorie MIMER avec des images (paires)
  const isMimer = mimerMode === true;
  let mimerData = null;
  let wordA = null;
  let wordB = null;
  let words = categoryData.words;

  if (isMimer) {
    const mimerCategory = wordDb.find(d => d.cat === 'MIMER');
    // WORD_DB transforme les catégories en { cat, words }, donc on accède à .words
    if (mimerCategory && mimerCategory.words && mimerCategory.words.length > 0) {
      const pairIndex = Math.floor(Math.random() * mimerCategory.words.length);
      mimerData = mimerCategory.words[pairIndex];
      // Pour le mode MIMER, wordA et wordB sont les noms des 2 images de la paire (sans extension)
      // On inverse aléatoirement pour que les innocents puissent avoir l'image 1 ou 2
      const randomSwap = Math.random() < 0.5;
      const img1 = mimerData.images[randomSwap ? 1 : 0];
      const img2 = mimerData.images[randomSwap ? 0 : 1] || mimerData.images[randomSwap ? 1 : 0];
      // Enlever l'extension (.jpg, .png, etc.) pour l'affichage
      wordA = img1 ? img1.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '') : null;
      wordB = img2 ? img2.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '') : null;
    }
  }

  // Pour la catégorie SPÉCIALE, utiliser les mots personnalisés si disponibles
  const isSpecialeCategory = category === 'SPECIALE';
  if (isSpecialeCategory && customWords && customWords.length > 0) {
    words = customWords;
  }

  // Sécurité : SPECIALE nécessite au moins 2 mots pour fonctionner
  if (isSpecialeCategory && words.length < 2) {
    return Array.from({ length: numPlayers }, () => ({
      word: null,
      role: 'normal',
      category,
      isMimer: false,
      mimerData: null,
      easyMode,
      spyHint: null,
      error: 'SPECIALE_NEEDS_MORE_WORDS',
    }));
  }

  // Choisir 2 mots/images différents aléatoirement (si pas en mode MIMER)
  if (!isMimer && (!isSpecialeCategory || (isSpecialeCategory && words.length > 1)) && words.length > 0) {
    // Si la catégorie a des sous-catégories, tirer les 2 mots dans la même sous-catégorie
    const subcategories = categoryData.subcategories;
    if (subcategories) {
      const subKeys = Object.keys(subcategories);
      const subKey = subKeys[Math.floor(Math.random() * subKeys.length)];
      const subWords = subcategories[subKey].filter(w => w.length > 0);
      if (subWords.length >= 2) {
        const idx1 = Math.floor(Math.random() * subWords.length);
        let idx2 = Math.floor(Math.random() * subWords.length);
        while (idx2 === idx1 && subWords.length > 1) {
          idx2 = Math.floor(Math.random() * subWords.length);
        }
        wordA = subWords[idx1];
        wordB = subWords[idx2];
      } else if (subWords.length === 1) {
        // Sous-catégorie avec 1 seul mot : on prend ce mot pour wordA
        // et on tire wordB d'une autre sous-catégorie pour garantir wordA !== wordB
        wordA = subWords[0];
        const otherSubKeys = subKeys.filter(k => k !== subKey);
        const otherWords = otherSubKeys.flatMap(k => subcategories[k]).filter(w => w.length > 0);
        if (otherWords.length > 0) {
          wordB = otherWords[Math.floor(Math.random() * otherWords.length)];
        } else {
          wordB = subWords[0];
        }
      }
    } else {
      const idx1 = Math.floor(Math.random() * words.length);
      let idx2 = Math.floor(Math.random() * words.length);
      while (idx2 === idx1 && words.length > 1) {
        idx2 = Math.floor(Math.random() * words.length);
      }
      wordA = words[idx1];
      wordB = words[idx2];
    }
  }

  const roles = [];
  if (gameMode === 3) {
    if (spyfallUndercover) {
      // SPYFALL UNDERCOVER : intrus avec un mot différent, les autres ont le même mot
      for (let i = 0; i < numUndercovers && roles.length < numPlayers; i++) roles.push('intrus');
      while (roles.length < numPlayers) roles.push('normal');
    } else {
      // SPYFALL : espions sans mot, les autres ont le même mot
      for (let i = 0; i < numUndercovers && roles.length < numPlayers; i++) roles.push('spy');
      while (roles.length < numPlayers) roles.push('normal');
    }
  } else {
    // Modes Normal / Mister White / MW+Intrus : utiliser les compteurs
    for (let i = 0; i < numUndercovers && roles.length < numPlayers; i++) roles.push('intrus');
    for (let i = 0; i < numMisterWhites && roles.length < numPlayers; i++) roles.push('mister');
    while (roles.length < numPlayers) roles.push('normal');
  }

  // Shuffle roles
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  // Pour la catégorie SPÉCIALE : utiliser les mots personnalisés
  // Si pas de mots personnalisés, tout le monde n'a pas de mot (bluff pur)
  // Si mots personnalisés, alors intrus et normaux fonctionnent normalement
  // Mode MIMER : les mots sont des noms d'images à afficher + indice pour Mister White
  const misterWord = easyMode ? category : null;

  // Indice Spyfall facile : chercher l'indice du mot principal
  const spyfallHints = lang === 'en' ? SPYFALL_HINTS_EN : SPYFALL_HINTS_FR;
  const spyHint = (gameMode === 3 && easyMode && wordA) ? (spyfallHints[wordA] || null) : null;

  return roles.map((role) => ({
    word: isSpecialeCategory && words.length <= 1 ? null : (role === 'intrus' ? wordB : role === 'mister' ? misterWord : role === 'spy' ? null : wordA),
    role: isSpecialeCategory && words.length <= 1 ? 'normal' : role,
    category,
    isMimer,
    mimerData: isMimer ? mimerData : null, // Contient { nom, images, indice } pour Mister White
    easyMode,
    spyHint: role === 'spy' ? spyHint : null,
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
