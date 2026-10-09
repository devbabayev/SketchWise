import puppeteer from 'puppeteer-core';
import path from 'path';

(async () => {
  try {
    const res = await fetch('http://127.0.0.1:9222/json/version');
    const data = await res.json();
    const wsUrl = data.webSocketDebuggerUrl;

    console.log('Connecting to', wsUrl);
    const browser = await puppeteer.connect({ browserWSEndpoint: wsUrl });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));

    console.log('--- Step 0: Uploading file ---');
    await page.screenshot({ path: 'flow_step0.png' });

    // Find the file input and upload example_blueprint.jpg
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
      console.error('File input not found!');
    } else {
      const filePath = path.resolve('example_blueprint.jpg');
      await fileInput.uploadFile(filePath);
      console.log('Uploaded file:', filePath);
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: 'flow_step0_uploaded.png' });

      // Click calculate button
      console.log('--- Clicking Calculate Optimal Costs ---');
      const calcBtn = await page.$('button');
      // Look for button with text "Calculate Optimal Costs"
      const buttons = await page.$$('button');
      let clicked = false;
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.includes('Calculate Optimal Costs')) {
          await btn.click();
          clicked = true;
          console.log('Clicked Calculate button');
          break;
        }
      }
      if (!clicked) {
        console.log('Could not find Calculate button by text, clicking first button');
        await calcBtn.click();
      }

      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: 'flow_step1_teaser.png' });

      // Check if we are at step 1
      const pageText = await page.evaluate(() => document.body.innerText);
      console.log('Page text excerpt after calculate:', pageText.slice(0, 300));

      // Now fill email and password if on step 1
      const emailInput = await page.$('input[type="email"]');
      const passwordInput = await page.$('input[type="password"]');
      if (emailInput && passwordInput) {
        console.log('Found email and password inputs, filling them...');
        await emailInput.type('test@sketchwise.io');
        await passwordInput.type('pass123456');

        // Click Unlock Full Report
        const allButtons = await page.$$('button');
        for (const btn of allButtons) {
          const text = await page.evaluate(el => el.textContent, btn);
          if (text && text.includes('Unlock Full Report')) {
            console.log('Clicking Unlock Full Report...');
            await btn.click();
            break;
          }
        }

        await new Promise(r => setTimeout(r, 2500));
        await page.screenshot({ path: 'flow_step2_result.png' });
        const step2Text = await page.evaluate(() => document.body.innerText);
        console.log('Page text after purchase attempt:', step2Text);
      } else {
        console.log('Did not reach step 1 paywall inputs.');
      }
    }

    await page.close();
    browser.disconnect();
    console.log('Flow test completed!');
  } catch (err) {
    console.error('Test execution error:', err);
  }
})();
