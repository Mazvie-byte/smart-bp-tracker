const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // High DPI for crisp screenshots
  await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 2 });
  
  console.log('Navigating to app...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  console.log('Injecting session...');
  await page.evaluate(() => {
    localStorage.setItem('bp_username', 'Mazvita');
  });
  
  await page.reload({ waitUntil: 'networkidle0' });
  
  console.log('Waiting for dashboard...');
  await page.waitForSelector('#recommendations-container', { timeout: 10000 });
  
  // Give it an extra second
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Taking screenshot...');
  const element = await page.$('#recommendations-container');
  await element.screenshot({ path: 'recommendations_screenshot.png' });
  
  console.log('Recommendations screenshot saved as recommendations_screenshot.png');
  await browser.close();
})();
