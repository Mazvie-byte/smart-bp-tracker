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
  // Bypass login by setting localStorage and reloading
  await page.evaluate(() => {
    localStorage.setItem('bp_username', 'Mazvita');
  });
  
  // Reload the page to skip the login/landing screens
  await page.reload({ waitUntil: 'networkidle0' });
  
  console.log('Waiting for dashboard...');
  // Wait for the TrendChart container to appear
  await page.waitForSelector('#trend-chart-container', { timeout: 10000 });
  
  // Give it an extra second for Recharts animation to finish
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Taking screenshot...');
  const element = await page.$('#trend-chart-container');
  await element.screenshot({ path: 'chart_trend_screenshot.png' });
  
  console.log('Trend chart screenshot saved as chart_trend_screenshot.png');
  await browser.close();
})();
