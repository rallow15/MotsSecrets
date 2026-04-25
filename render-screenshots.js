/**
 * Rendu des screenshots Google Play avec Puppeteer
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = 'C:/Users/salim/Desktop/Nouveau dossier';
const HTML_DIR = OUTPUT_DIR;

async function renderScreenshot(browser, filePath, outputPath) {
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const htmlContent = fs.readFileSync(filePath, 'utf8');
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    await page.screenshot({
      path: outputPath,
      fullPage: true,
      type: 'png'
    });

    await page.close();
    console.log(`✅ ${path.basename(outputPath)} généré`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur pour ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Lancement de Puppeteer...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const screenshots = [];
  for (let i = 1; i <= 8; i++) {
    const htmlPath = path.join(HTML_DIR, `screenshot_${String(i).padStart(2, '0')}.html`);
    const pngPath = path.join(OUTPUT_DIR, `screenshot_${String(i).padStart(2, '0')}.png`);
    if (fs.existsSync(htmlPath)) {
      screenshots.push({ html: htmlPath, png: pngPath });
    }
  }

  console.log(`📸 Rendu de ${screenshots.length} screenshots...`);

  for (const shot of screenshots) {
    await renderScreenshot(browser, shot.html, shot.png);
  }

  await browser.close();
  console.log('\n✅ Tous les screenshots ont été générés !');
  console.log('📁 Dossier:', OUTPUT_DIR);
}

main().catch(console.error);
