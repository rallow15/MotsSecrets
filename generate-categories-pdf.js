const fs = require('fs');
const PDFDocument = require('pdfkit');

// Lecture du fichier words.js
const wordsContent = fs.readFileSync('src/data/words.js', 'utf8');

// Extraction manuelle des catégories principales
const categoryPatterns = [
  { emoji: '⚽', name: 'FOOTBALL', pattern: /\/\/\s*⚽\s*FOOTBALL([\s\S]*?)(?=\/\/\s*🏀|\/\/\s*🌍|\/\/\s*🦁|\/\/\s*🎬\s*ACTEURS\s*$)/ },
  { emoji: '🏀', name: 'BASKETBALL', pattern: /\/\/\s*🏀\s*BASKETBALL([\s\S]*?)(?=\/\/\s*🎬|\/\/\s*🌍|\/\/\s*🦁)/ },
  { emoji: '🎬', name: 'ACTEURS', pattern: /\/\/\s*🎬\s*ACTEURS\s*\n([\s\S]*?)(?=\/\/\s*🎬\s*ACTRICES|\/\/\s*🌍|\/\/\s*🦁)/ },
  { emoji: '🎬', name: 'ACTRICES', pattern: /\/\/\s*🎬\s*ACTRICES([\s\S]*?)(?=\/\/\s*🎬\s*ACTEURS|\/\/\s*🌍|\/\/\s*🦁)/ },
  { emoji: '🌍', name: 'PAYS', pattern: /\/\/\s*🌍\s*PAYS([\s\S]*?)(?=\/\/\s*🦁|\/\/\s*🎮|\/\/\s*🎵)/ },
  { emoji: '🦁', name: 'ANIMAUX', pattern: /\/\/\s*🦁\s*ANIMAUX([\s\S]*?)(?=\/\/\s*🎮|\/\/\s*🎬|\/\/\s*🎵|$)/ },
  { emoji: '🎮', name: 'JEUX VIDÉO', pattern: /\/\/\s*🎮\s*JEUX\s*VID[ÉE]O([\s\S]*?)(?=\/\/\s*🦁|\/\/\s*🎬|\/\/\s*🎵|\/\/\s*🎮\s*POK)/ },
  { emoji: '🎮', name: 'POKÉMON', pattern: /\/\/\s*🎮\s*POK[ÉE]MON([\s\S]*?)(?=\/\/\s*🎬|\/\/\s*🎵|$)/ },
  { emoji: '🎵', name: 'MUSIQUE / CHANTEURS', pattern: /\/\/\s*🎵\s*CHANTEURS([\s\S]*?)(?=\/\/\s*🎬|\/\/\s*$)/ },
  { emoji: '🎬', name: 'FILMS / ANIMATION', pattern: /\/\/\s*🎬\s*FILMS\s*\/\s*ANIMATION([\s\S]*?)(?=\/\/\s*$)/ },
];

function extractWords(content) {
  const words = [];
  const wordRegex = /"([^"]+)"\s*:\s*\[/g;
  let match;
  while ((match = wordRegex.exec(content)) !== null) {
    words.push(match[1]);
  }
  return words;
}

const categories = [];
categoryPatterns.forEach(pattern => {
  const match = pattern.pattern.exec(wordsContent);
  if (match) {
    const words = extractWords(match[1]);
    if (words.length > 0) {
      categories.push({ emoji: pattern.emoji, name: pattern.name, words });
    }
  }
});

// Fusion des catégories en double (Acteurs multiples)
const mergedCategories = {};
categories.forEach(cat => {
  const key = `${cat.emoji}-${cat.name}`;
  if (mergedCategories[key]) {
    mergedCategories[key].words = [...mergedCategories[key].words, ...cat.words];
  } else {
    mergedCategories[key] = { ...cat };
  }
});

const finalCategories = Object.values(mergedCategories);

// Création du PDF
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 40, right: 40 }
});

doc.pipe(fs.createWriteStream('categories-mots-secrets.pdf'));

// Couleurs
const colors = {
  primary: '#7c3aed',
  secondary: '#080808',
  accent: '#e8ff47',
  light: '#f3f3f3'
};

// En-tête
doc.fillColor(colors.primary)
   .fontSize(36)
   .font('Helvetica-Bold')
   .text('MOTS SECRETS', 0, 60, { align: 'center' });

doc.fillColor(colors.secondary)
   .fontSize(16)
   .font('Helvetica')
   .text('📚 Liste complète des catégories et mots', 0, 105, { align: 'center' });

// Statistiques
const totalWords = finalCategories.reduce((sum, cat) => sum + cat.words.length, 0);
doc.fontSize(12)
   .font('Helvetica-Bold')
   .text(`📊 ${finalCategories.length} catégories | ${totalWords} mots au total`, 0, 135, { align: 'center' });

doc.moveTo(40, 155).lineTo(555, 155).strokeColor(colors.primary).stroke();

let yPos = 175;

// Affichage des catégories
finalCategories.forEach((cat, index) => {
  // Nouvelle page si besoin
  if (yPos > 700) {
    doc.addPage();
    yPos = 50;
  }

  // En-tête de catégorie
  doc.fillColor(colors.primary)
     .fontSize(16)
     .font('Helvetica-Bold')
     .text(`${cat.emoji} ${cat.name}`, 40, yPos);

  doc.fillColor('#666')
     .fontSize(10)
     .font('Helvetica')
     .text(`(${cat.words.length} mots)`, 200, yPos + 2);

  // Liste des mots
  const wordsPerCol = 18;
  const numCols = 3;
  const words = cat.words;
  const colWidth = 165;
  const startX = 40;

  let maxLines = 0;

  for (let col = 0; col < numCols; col++) {
    const colStart = col * wordsPerCol;
    const colWords = words.slice(colStart, colStart + wordsPerCol);
    const lines = colWords.length;
    if (lines > maxLines) maxLines = lines;

    colWords.forEach((word, i) => {
      doc.fillColor('#333')
         .fontSize(9)
         .font('Helvetica')
         .text(`• ${word}`, startX + col * colWidth, yPos + 25 + i * 12, { width: colWidth - 10 });
    });
  }

  yPos += 25 + maxLines * 12 + 25;

  // Ligne de séparation
  if (index < finalCategories.length - 1) {
    doc.moveTo(40, yPos - 10).lineTo(555, yPos - 10).strokeColor('#e0e0e0').stroke();
    yPos += 15;
  }
});

// Footer
const pageCount = doc.bufferedPageRange().count;
doc.fontSize(9)
   .fillColor('#999')
   .text(`Page ${doc.page} sur ${pageCount}`, 40, 780, { align: 'center' });

doc.end();

console.log('✅ PDF généré : categories-mots-secrets.pdf');
console.log(`📊 ${finalCategories.length} catégories`);
console.log(`📝 ${totalWords} mots au total\n`);

console.log('📚 Détail des catégories :');
finalCategories.forEach(cat => {
  console.log(`   ${cat.emoji} ${cat.name}: ${cat.words.length} mots`);
  // Afficher les 5 premiers mots en exemple
  console.log(`      Ex: ${cat.words.slice(0, 5).join(', ')}...`);
});
