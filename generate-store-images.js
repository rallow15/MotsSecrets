/**
 * Génération des images pour Google Play Store
 * Thème: Fond #080808, Accent #e8ff47, Texte #ffffff
 */

const fs = require('fs');
const path = require('path');

// Couleurs du thème
const COLORS = {
  bg: '#080808',
  surface: '#0f0f0f',
  accent: '#e8ff47',
  danger: '#ff4444',
  text: '#ffffff',
  dim: '#2a2a2a',
};

const OUTPUT_DIR = 'C:/Users/salim/Desktop/Nouveau dossier';

console.log('🎨 Génération des images Google Play Store...');
console.log('Thème:', COLORS);

// Fonction pour créer un screenshot
function createScreenshot(index, title, subtitle, players, category) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Screenshot ${index}</title></head>
<body style="margin:0;padding:0;background:${COLORS.bg};">
  <div style="width:1080px;height:1920px;position:relative;background:linear-gradient(180deg,${COLORS.bg} 0%,${COLORS.surface} 100%);font-family:'Bebas Neue',sans-serif;">
    <!-- Header -->
    <div style="position:absolute;top:80px;left:60px;right:60px;">
      <div style="display:flex;align-items:center;gap:20px;margin-bottom:40px;">
        <div style="width:60px;height:60px;border-radius:30px;background:${COLORS.accent};display:flex;align-items:center;justify-content:center;">
          <span style="color:${COLORS.bg};font-size:32px;">🎮</span>
        </div>
        <span style="color:${COLORS.text};font-size:48px;letter-spacing:4px;">MOTS SECRETS</span>
      </div>
    </div>

    <!-- Main content -->
    <div style="position:absolute;top:300px;left:60px;right:60px;text-align:center;">
      <h1 style="color:${COLORS.accent};font-size:120px;margin:0 0 40px 0;letter-spacing:8px;">${title}</h1>
      <p style="color:${COLORS.text};font-size:42px;opacity:0.8;margin:0 0 80px 0;">${subtitle}</p>

      <!-- Players preview -->
      <div style="display:flex;justify-content:center;gap:30px;flex-wrap:wrap;margin:60px 0;">
        ${players.map((p, i) => `
          <div style="width:200px;height:260px;background:${COLORS.dim};border-radius:20px;border:3px solid ${COLORS.accent};display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <span style="color:${COLORS.accent};font-size:36px;margin-bottom:20px;">Joueur ${i + 1}</span>
            <span style="color:${COLORS.text};font-size:32px;opacity:0.9;">${p}</span>
          </div>
        `).join('')}
      </div>

      <!-- Category badge -->
      <div style="display:inline-block;background:${COLORS.accent};padding:20px 60px;border-radius:100px;margin-top:60px;">
        <span style="color:${COLORS.bg};font-size:42px;letter-spacing:4px;">📁 ${category}</span>
      </div>
    </div>

    <!-- Footer -->
    <div style="position:absolute;bottom:80px;left:60px;right:60px;text-align:center;">
      <div style="display:flex;justify-content:center;gap:20px;margin-bottom:30px;">
        <span style="color:${COLORS.text};opacity:0.6;font-size:28px;">3-20 joueurs</span>
        <span style="color:${COLORS.accent};font-size:28px;">•</span>
        <span style="color:${COLORS.text};opacity:0.6;font-size:28px;">10+ ans</span>
      </div>
      <div style="display:flex;justify-content:center;gap:40px;">
        <span style="color:${COLORS.text};font-size:32px;letter-spacing:3px;">🎭 INTRUS</span>
        <span style="color:${COLORS.text};font-size:32px;letter-spacing:3px;">🤵 MISTER WHITE</span>
      </div>
    </div>
  </div>
</body>
</html>`;
  return html;
}

// Screenshots configurations
const screenshots = [
  { title: 'DÉCOUVREZ L\'INTRUS', subtitle: 'Un joueur a un mot différent parmi vous', players: ['FOOTBALL', 'FOOTBALL', 'BASKETBALL', 'FOOTBALL'], category: 'SPORT' },
  { title: 'MISTER WHITE', subtitle: 'Un joueur n\'a aucun mot, il doit bluffer', players: ['MUSIQUE', '???', 'MUSIQUE', 'MUSIQUE'], category: 'MUSIQUE' },
  { title: 'DOUBLE ENJEU', subtitle: 'Intrus + Mister White dans la même partie', players: ['PAYS', 'INTRUS', '???', 'PAYS'], category: 'GÉOGRAPHIE' },
  { title: 'CATÉGORIES VARIÉES', subtitle: 'Plus de 10 catégories disponibles', players: ['MANGA', 'MANGA', 'MANGA', 'MANGA'], category: 'ANIME' },
  { title: 'PERSONNALISEZ', subtitle: 'Ajoutez vos propres mots et catégories', players: ['PERSO', 'PERSO', 'PERSO', 'PERSO'], category: 'CUSTOM' },
  { title: 'MODES DE JEU', subtitle: 'Normal, Mister White, ou les deux combinés', players: ['ACTEURS', 'ACTEURS', 'ACTRICES', 'ACTEURS'], category: 'CINÉMA' },
  { title: 'JUSQU\'À 20 JOUEURS', subtitle: 'Idéal pour les grandes soirées', players: ['JOUEUR 1', 'JOUEUR 2', 'JOUEUR 3', 'JOUEUR 4'], category: 'FESTIF' },
  { title: 'INTERFACE SOMPTUEUSE', subtitle: 'Design moderne et expérience fluide', players: ['VIDÉO', 'VIDÉO', 'JEUX', 'VIDÉO'], category: 'JEUX VIDÉO' },
];

console.log(`📸 Génération de ${screenshots.length} screenshots...`);

// Note: Ceci est un template HTML/CSS
// Pour générer les PNG, il faudrait utiliser puppeteer ou node-canvas
console.log('\n⚠️ Pour générer les PNG, installez puppeteer:');
console.log('   npm install -g puppeteer');
console.log('   puis exécutez: node generate-store-images.js --render\n');

// Écrire les fichiers HTML pour prévisualisation
screenshots.forEach((shot, i) => {
  const html = createScreenshot(i + 1, shot.title, shot.subtitle, shot.players, shot.category);
  const filePath = path.join(OUTPUT_DIR, `screenshot_${String(i + 1).padStart(2, '0')}.html`);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✅ screenshot_${String(i + 1).padStart(2, '0')}.html créé`);
});

console.log('\n📁 Les fichiers HTML ont été créés dans:', OUTPUT_DIR);
console.log('   Ouvrez-les dans un navigateur et faites une capture d\'écran');
