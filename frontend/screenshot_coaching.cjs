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
    console.log('4. Logged in, on dashboard');

    // Click "Coaching" in sidebar navigation
    const navLinks = await page.$$('nav a, .sidebar a, [class*="nav"] a, a');
    let clicked = false;
    for (const link of navLinks) {
      const text = await page.evaluate(el => el.textContent.trim(), link);
      if (text.includes('Coaching') && !text.includes('AI')) {
        await link.click();
        clicked = true;
        console.log('5. Clicked Coaching nav link');
        break;
      }
    }

    if (!clicked) {
      // Try clicking by text content
      await page.evaluate(() => {
        const links = document.querySelectorAll('a, button, [role="link"]');
        for (const el of links) {
          if (el.textContent.trim() === 'Coaching') {
            el.click();
            break;
          }
        }
      });
      console.log('5. Clicked Coaching via evaluate');
    }

    await new Promise(r => setTimeout(r, 3000));
    console.log('6. Coaching page loaded');

    // Scroll to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 500));

    // Take full-page screenshot
    await page.screenshot({ 
      path: 'coaching_screenshot.png', 
      fullPage: true 
    });
    console.log('7. Full page screenshot saved');

    // Take viewport screenshot
    await page.screenshot({ 
      path: 'coaching_viewport.png', 
      fullPage: false 
    });
    console.log('8. Viewport screenshot saved');

  } catch (err) {
    console.error('Error:', err.message);
    await page.screenshot({ path: 'debug_coaching.png', fullPage: true });
    console.log('Debug screenshot saved');
  }

  await browser.close();
  console.log('Done!');
})();
