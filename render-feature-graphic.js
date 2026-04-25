const puppeteer = require('puppeteer');
const fs = require('fs');

const OUTPUT_DIR = 'C:/Users/salim/Desktop/Nouveau dossier';

async function main() {
  console.log('🎨 Génération de la Feature Graphic...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 500, deviceScaleFactor: 1 });

  const htmlPath = 'C:/Users/salim/Desktop/MotsSecrets/generate-feature-graphic.html';
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const outputPath = OUTPUT_DIR + '/feature_graphic.png';
  await page.screenshot({
    path: outputPath,
    type: 'png'
  });

  await page.close();
  await browser.close();

  console.log('✅ feature_graphic.png généré (1024x500)');
  console.log('📁', outputPath);
}

main().catch(console.error);
