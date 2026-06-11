const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // High DPI for crisp code screenshots
  await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });
  
  const filePath = `file://${path.resolve(__dirname, 'latencies.html')}`;
  
  // Wait for networkidle0 so Chart.js can fetch and render
  await page.goto(filePath, { waitUntil: 'networkidle0' });
  
  // Give it a tiny bit extra time just in case
  await new Promise(r => setTimeout(r, 500));
  
  const element = await page.$('#chart-wrapper');
  await element.screenshot({ path: 'chart_latencies_screenshot.png' });
  
  console.log('Latencies screenshot saved as chart_latencies_screenshot.png');
  await browser.close();
})();
