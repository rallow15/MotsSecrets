const fs = require('fs');
const { createCanvas } = require('canvas');

// Création du canvas PNG (1080x1350 px - format portrait Instagram)
const width = 1080;
const height = 1350;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Couleurs modernes et vibrantes pour les jeunes
const colors = {
  bg: '#0a0a0f',
  purple: '#7c3aed',    // violet neon
  pink: '#ec4899',      // rose vibrant
  cyan: '#06b6d4',      // cyan electrique
  lime: '#84cc16',      // vert lime
  yellow: '#eab308',    // jaune
  text: '#ffffff',
  textDim: '#a1a1aa'
};

// Fond avec dégradé moderne
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#0a0a0f');
gradient.addColorStop(0.5, '#1a1a2e');
gradient.addColorStop(1, '#0f0a1e');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// Effet de grille en arrière-plan (style cyber/gaming)
ctx.strokeStyle = 'rgba(124, 58, 237, 0.1)';
ctx.lineWidth = 1;
for (let i = 0; i < width; i += 40) {
  ctx.beginPath();
  ctx.moveTo(i, 0);
  ctx.lineTo(i, height);
  ctx.stroke();
}
for (let i = 0; i < height; i += 40) {
  ctx.beginPath();
  ctx.moveTo(0, i);
  ctx.lineTo(width, i);
  ctx.stroke();
}

// Formes géométriques décoratives (style moderne)
ctx.globalAlpha = 0.3;
ctx.fillStyle = colors.purple;
ctx.beginPath();
ctx.moveTo(0, 0);
ctx.lineTo(250, 0);
ctx.lineTo(0, 200);
ctx.fill();

ctx.globalAlpha = 0.25;
ctx.fillStyle = colors.cyan;
ctx.beginPath();
ctx.moveTo(width, height);
ctx.lineTo(width - 200, height);
ctx.lineTo(width, height - 180);
ctx.fill();

ctx.globalAlpha = 0.2;
ctx.fillStyle = colors.pink;
ctx.beginPath();
ctx.arc(width / 2, height / 2, 300, 0, Math.PI * 2);
ctx.fill();

ctx.globalAlpha = 1;

// Titre principal avec effet glow
ctx.shadowColor = colors.purple;
ctx.shadowBlur = 30;
ctx.fillStyle = colors.text;
ctx.font = 'bold 72px Arial';
ctx.textAlign = 'center';
ctx.fillText('MOTS SECRETS', width / 2, 100);
ctx.shadowBlur = 0;

// Sous-titre
ctx.fillStyle = colors.cyan;
ctx.font = 'bold 24px Arial';
ctx.fillText("TROUVE L'INTRUS ! 🔍", width / 2, 145);

// Badge "100% GRATUIT" style gaming
const badgeWidth = 280;
const badgeHeight = 50;
const badgeX = (width - badgeWidth) / 2;
const badgeY = 185;

// Gradient du badge
const badgeGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeWidth, badgeY);
badgeGrad.addColorStop(0, colors.purple);
badgeGrad.addColorStop(1, colors.pink);

ctx.fillStyle = badgeGrad;
ctx.beginPath();
ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 25);
ctx.fill();

ctx.fillStyle = colors.text;
ctx.font = 'bold 26px Arial';
ctx.fillText('⚡ 100% GRATUIT', width / 2, badgeY + 33);

// Section "CATÉGORIES"
ctx.fillStyle = colors.yellow;
ctx.font = 'bold 32px Arial';
ctx.fillText('📚 DES CATÉGORIES DINGUES', width / 2, 270);

// Cartes de catégories
const categories = [
  { icon: '⚽', name: 'FOOT', exemples: 'Mbappé, Messi, Ronaldo...', color: colors.lime },
  { icon: '🌍', name: 'PAYS', exemples: 'France, Japon, Brésil...', color: colors.cyan },
  { icon: '🦁', name: 'ANIMAUX', exemples: 'Lion, Aigle, Requin...', color: colors.pink },
  { icon: '🎬', name: 'CINÉ', exemples: 'Marvel, Disney, Netflix...', color: colors.yellow },
  { icon: '🎵', name: 'MUSIQUE', exemples: 'Rap, Pop, Rock...', color: colors.purple },
  { icon: '🍕', name: 'BOUFFE', exemples: 'Pizza, Sushi, Burger...', color: colors.orange }
];

let catY = 330;
categories.forEach((cat, i) => {
  const cardWidth = 480;
  const cardHeight = 55;
  const cardX = i % 2 === 0 ? 60 : width - 540;
  const yPos = catY + Math.floor(i / 2) * 70;

  // Fond de carte
  const cardGrad = ctx.createLinearGradient(cardX, yPos, cardX + cardWidth, yPos);
  cardGrad.addColorStop(0, 'rgba(255,255,255,0.05)');
  cardGrad.addColorStop(1, 'rgba(255,255,255,0.02)');

  ctx.fillStyle = cardGrad;
  ctx.beginPath();
  ctx.roundRect(cardX, yPos, cardWidth, cardHeight, 12);
  ctx.fill();

  // Bordure colorée
  ctx.strokeStyle = cat.color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(cardX, yPos, cardWidth, cardHeight, 12);
  ctx.stroke();

  // Icone
  ctx.font = '28px Arial';
  ctx.fillText(cat.icon, cardX + 40, yPos + 38);

  // Nom catégorie
  ctx.fillStyle = colors.text;
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(cat.name, cardX + 85, yPos + 35);

  // Exemples
  ctx.fillStyle = colors.textDim;
  ctx.font = '16px Arial';
  ctx.fillText(cat.exemples, cardX + 85, yPos + 58);

  ctx.textAlign = 'center';
});

// Section "POURQUOI JOUER ?"
ctx.fillStyle = colors.pink;
ctx.font = 'bold 28px Arial';
ctx.fillText('🔥 POURQUOI JOUER ?', width / 2, 800);

const features = [
  { icon: '👥', text: '2 à 7 joueurs - Plus c\'est nombreux, plus c\'est drôle !' },
  { icon: '🎯', text: 'Trouve l\'intrus avec des indices subtils' },
  { icon: '⚡', text: 'Parties de 5-10 min - Parfait pour l\'apéro !' },
  { icon: '🧠', text: 'Psychologie & Bluff - Devine qui ment !' },
  { icon: '🌍', text: 'Français & Anglais - Joue avec tous !' }
];

let featY = 850;
ctx.font = '18px Arial';
features.forEach((f) => {
  ctx.fillStyle = colors.text;
  ctx.fillText(f.icon, width / 2 - 180, featY);
  ctx.fillText(f.text, width / 2 + 20, featY);
  featY += 35;
});

// Call to action
const ctaWidth = 450;
const ctaHeight = 90;
const ctaX = (width - ctaWidth) / 2;
const ctaY = 1070;

// Glow autour du bouton
ctx.shadowColor = colors.lime;
ctx.shadowBlur = 20;

const ctaGrad = ctx.createLinearGradient(ctaX, ctaY, ctaX, ctaY + ctaHeight);
ctaGrad.addColorStop(0, colors.lime);
ctaGrad.addColorStop(1, '#65a30d');

ctx.fillStyle = ctaGrad;
ctx.beginPath();
ctx.roundRect(ctaX, ctaY, ctaWidth, ctaHeight, 20);
ctx.fill();
ctx.shadowBlur = 0;

ctx.fillStyle = '#000000';
ctx.font = 'bold 32px Arial';
ctx.fillText('📱 TÉLÉCHARGE MAINTENANT', width / 2, ctaY + 55);

// Footer
ctx.fillStyle = colors.textDim;
ctx.font = '16px Arial';
ctx.fillText('Disponible sur Android', width / 2, 1200);

ctx.fillStyle = colors.text;
ctx.font = 'bold 20px Arial';
ctx.fillText('🎮 Le jeu parfait pour les soirées entre potes !', width / 2, 1250);

ctx.fillStyle = colors.textDim;
ctx.font = '14px Arial';
ctx.fillText('Sans pub intrusive • Sans achat in-app • Juste du fun', width / 2, 1285);

// Écriture du PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('flyer-mots-secrets.png', buffer);

console.log('✅ Flyer PNG généré : flyer-mots-secrets.png');
console.log(`   Dimensions: ${width}x${height} px`);
console.log('   Style: Moderne/Gaming pour les jeunes');
