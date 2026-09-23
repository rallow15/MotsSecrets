// Mode ENCHÈRES (Mercato) — cartes exclusives à ce mode, absentes des autres.
// Chaque carte : { nom, valeur } — valeur indicative en millions, sert de repère
// au moment de l'enchère (le prix final est décidé par les joueurs).

export const AUCTION_BUDGET = 500;      // budget de départ de chaque joueur, en millions
export const AUCTION_CARDS_PER_PLAYER = 5; // fin de partie : 5 cartes par joueur (10 au total)
export const AUCTION_BID_STEP = 10;     // palier d'enchère, en millions
export const AUCTION_MIN_BID = 10;      // première enchère minimum

export const AUCTION_CATEGORIES = {
  MERCATO_FOOT: {
    emoji: '⚽',
    cards: [
      { nom: 'Mbappé', valeur: 180 },
      { nom: 'Bellingham', valeur: 150 },
      { nom: 'Haaland', valeur: 180 },
      { nom: 'Vinicius Jr', valeur: 170 },
      { nom: 'Rodri', valeur: 130 },
      { nom: 'Yamal', valeur: 180 },
      { nom: 'Salah', valeur: 55 },
      { nom: 'Kane', valeur: 90 },
      { nom: 'De Bruyne', valeur: 50 },
      { nom: 'Courtois', valeur: 40 },
      { nom: 'Alisson', valeur: 35 },
      { nom: 'Van Dijk', valeur: 45 },
      { nom: 'Rüdiger', valeur: 40 },
      { nom: 'Hakimi', valeur: 60 },
      { nom: 'Wirtz', valeur: 140 },
      { nom: 'Musiala', valeur: 130 },
      { nom: 'Saka', valeur: 120 },
      { nom: 'Foden', valeur: 110 },
      { nom: 'Kvaratskhelia', valeur: 80 },
      { nom: 'Lautaro', valeur: 90 },
      { nom: 'Osimhen', valeur: 75 },
      { nom: 'Doku', valeur: 70 },
      { nom: 'Tchouaméni', valeur: 60 },
      { nom: 'Pedri', valeur: 100 },
    ],
  },
  MERCATO_DBZ: {
    emoji: '🐉',
    cards: [
      { nom: 'Goku Ultra Instinct', valeur: 200 },
      { nom: 'Vegeta Ultra Ego', valeur: 180 },
      { nom: 'Broly', valeur: 160 },
      { nom: 'Jiren', valeur: 170 },
      { nom: 'Beerus', valeur: 190 },
      { nom: 'Whis', valeur: 200 },
      { nom: 'Gogeta', valeur: 200 },
      { nom: 'Vegetto', valeur: 190 },
      { nom: 'Black Goku', valeur: 150 },
      { nom: 'Zamasu Fusion', valeur: 155 },
      { nom: 'Gohan Beast', valeur: 160 },
      { nom: 'Piccolo Orange', valeur: 140 },
      { nom: 'Trunks du Futur', valeur: 120 },
      { nom: 'Gotenks', valeur: 110 },
      { nom: 'Bardock', valeur: 80 },
      { nom: 'Raditz', valeur: 40 },
      { nom: 'Nappa', valeur: 35 },
      { nom: 'Freezer', valeur: 130 },
      { nom: 'Cell', valeur: 110 },
      { nom: 'Buu', valeur: 115 },
      { nom: 'C-17', valeur: 90 },
      { nom: 'C-18', valeur: 85 },
      { nom: 'Krillin', valeur: 30 },
      { nom: 'Roi Vegeta', valeur: 60 },
    ],
  },
  MERCATO_SUPERHEROS: {
    emoji: '🦸',
    cards: [
      { nom: 'Superman', valeur: 200 },
      { nom: 'Batman', valeur: 180 },
      { nom: 'Wonder Woman', valeur: 160 },
      { nom: 'Flash', valeur: 140 },
      { nom: 'Aquaman', valeur: 100 },
      { nom: 'Green Lantern', valeur: 110 },
      { nom: 'Cyborg', valeur: 80 },
      { nom: 'Iron Man', valeur: 190 },
      { nom: 'Captain America', valeur: 150 },
      { nom: 'Thor', valeur: 170 },
      { nom: 'Hulk', valeur: 160 },
      { nom: 'Black Panther', valeur: 140 },
      { nom: 'Spider-Man', valeur: 150 },
      { nom: 'Doctor Strange', valeur: 130 },
      { nom: 'Scarlet Witch', valeur: 160 },
      { nom: 'Captain Marvel', valeur: 130 },
      { nom: 'Deadpool', valeur: 120 },
      { nom: 'Wolverine', valeur: 125 },
      { nom: 'Dr. Fate', valeur: 135 },
      { nom: 'Daredevil', valeur: 70 },
      { nom: 'Silver Surfer', valeur: 140 },
      { nom: 'Thanos', valeur: 200 },
      { nom: 'Darkseid', valeur: 190 },
      { nom: 'Venom', valeur: 115 },
    ],
  },
  MERCATO_ONEPIECE: {
    emoji: '🏴‍☠️',
    cards: [
      { nom: 'Luffy Gear 5', valeur: 200 },
      { nom: 'Zoro', valeur: 180 },
      { nom: 'Sanji', valeur: 150 },
      { nom: 'Jinbei', valeur: 110 },
      { nom: 'Franky', valeur: 60 },
      { nom: 'Brook', valeur: 55 },
      { nom: 'Robin', valeur: 90 },
      { nom: 'Nami', valeur: 66 },
      { nom: 'Usopp', valeur: 50 },
      { nom: 'Chopper', valeur: 30 },
      { nom: 'Barbe Blanche', valeur: 200 },
      { nom: 'Barbe Noire', valeur: 180 },
      { nom: 'Shanks', valeur: 200 },
      { nom: 'Kaido', valeur: 190 },
      { nom: 'Big Mom', valeur: 170 },
      { nom: 'Akainu', valeur: 160 },
      { nom: 'Aokiji', valeur: 140 },
      { nom: 'Kizaru', valeur: 140 },
      { nom: 'Mihawk', valeur: 175 },
      { nom: 'Doflamingo', valeur: 120 },
      { nom: 'Law', valeur: 130 },
      { nom: 'Kid', valeur: 125 },
      { nom: 'Sabo', valeur: 105 },
      { nom: 'Ace', valeur: 130 },
    ],
  },
  MERCATO_NARUTO: {
    emoji: '🍥',
    cards: [
      { nom: 'Naruto Baryon', valeur: 200 },
      { nom: 'Sasuke Rinnegan', valeur: 190 },
      { nom: 'Kakashi', valeur: 130 },
      { nom: 'Jiraya', valeur: 140 },
      { nom: 'Tsunade', valeur: 110 },
      { nom: 'Orochimaru', valeur: 105 },
      { nom: 'Itachi', valeur: 160 },
      { nom: 'Obito', valeur: 170 },
      { nom: 'Madara', valeur: 195 },
      { nom: 'Hashirama', valeur: 180 },
      { nom: 'Minato', valeur: 155 },
      { nom: 'Nagato', valeur: 145 },
      { nom: 'Pain', valeur: 140 },
      { nom: 'Kisame', valeur: 100 },
      { nom: 'Kakuzu', valeur: 85 },
      { nom: 'Hidan', valeur: 70 },
      { nom: 'Deidara', valeur: 90 },
      { nom: 'Sasori', valeur: 95 },
      { nom: 'Guy (8 portes)', valeur: 165 },
      { nom: 'Gaara', valeur: 115 },
      { nom: 'Rock Lee', valeur: 80 },
      { nom: 'Neji', valeur: 65 },
      { nom: 'Sakura', valeur: 60 },
      { nom: 'Shikamaru', valeur: 75 },
    ],
  },
};

export const AUCTION_CATEGORY_KEYS = Object.keys(AUCTION_CATEGORIES);

// Mélange (Fisher-Yates) et tire cardsPerPlayer*2 cartes sans doublon
export function getAuctionDeck(catKey, cardsPerPlayer = AUCTION_CARDS_PER_PLAYER) {
  const cat = AUCTION_CATEGORIES[catKey];
  if (!cat) return [];
  const pool = [...cat.cards];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, cardsPerPlayer * 2);
}