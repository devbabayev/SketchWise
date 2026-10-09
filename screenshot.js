import puppeteer from 'puppeteer-core';

(async () => {
  try {
    const res = await fetch('http://127.0.0.1:9222/json/version');
    const data = await res.json();
    const wsUrl = data.webSocketDebuggerUrl;

    console.log('Connecting to', wsUrl);
    const browser = await puppeteer.connect({ browserWSEndpoint: wsUrl });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'screenshot_main.png' });
    
    await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'screenshot_admin.png' });
    
    await page.close();
    browser.disconnect();
    console.log('Screenshots saved as screenshot_main.png and screenshot_admin.png');
  } catch (error) {
    console.error('Error:', error);
  }
})();
