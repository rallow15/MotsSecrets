const puppeteer = require('puppeteer');
const fs = require('fs');

const OUTPUT_DIR = 'C:/Users/salim/Desktop/Nouveau dossier';

async function main() {
  console.log('🎨 Génération du Developer Header...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 400, deviceScaleFactor: 1 });

  const htmlPath = 'C:/Users/salim/Desktop/MotsSecrets/generate-header.html';
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const outputPath = OUTPUT_DIR + '/header_developer.jpg';
  await page.screenshot({
    path: outputPath,
    type: 'jpeg',
    quality: 90
  });

  await page.close();
  await browser.close();

  console.log('✅ header_developer.jpg généré (1200x400)');
  console.log('📁', outputPath);
}

main().catch(console.error);
