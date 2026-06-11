const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: true,
    defaultViewport: { width: 1440, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    // Go to the app
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 15000 });
    console.log('1. Loaded landing page');

    // Click "Get Started" button
    await page.waitForSelector('.btn', { timeout: 5000 });
    await page.click('.btn');
    await new Promise(r => setTimeout(r, 1500));
    console.log('2. Clicked Get Started');

    // Fill login form
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await page.type('input[type="text"]', 'Mazvita');
    await page.type('input[type="password"]', 'demo123');
    console.log('3. Filled login form');

    // Submit form
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 3000));
    console.log('4. Submitted login');

    // Wait for dashboard content
    await new Promise(r => setTimeout(r, 2000));
    console.log('5. Dashboard loaded');

    // Take full-page screenshot
    await page.screenshot({ 
      path: 'dashboard_screenshot.png', 
      fullPage: true 
    });
    console.log('6. Full page screenshot saved');

    // Also take a viewport-only screenshot
    await page.screenshot({ 
      path: 'dashboard_viewport.png', 
      fullPage: false 
    });
    console.log('7. Viewport screenshot saved');

  } catch (err) {
    console.error('Error:', err.message);
    // Take a debug screenshot of whatever is showing
    await page.screenshot({ path: 'debug_screenshot.png', fullPage: true });
    console.log('Debug screenshot saved');
  }

  await browser.close();
  console.log('Done!');
})();
