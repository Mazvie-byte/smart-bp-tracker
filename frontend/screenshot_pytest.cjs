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
  
  const filePath = `file://${path.resolve(__dirname, 'code_pytest.html')}`;
  await page.goto(filePath, { waitUntil: 'networkidle0' });
  
  const element = await page.$('#terminal-output');
  await element.screenshot({ path: 'code_pytest_screenshot.png' });
  
  console.log('Pytest screenshot saved as code_pytest_screenshot.png');
  await browser.close();
})();
