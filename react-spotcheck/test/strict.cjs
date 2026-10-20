const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined }); const p = await b.newPage({ viewport: { width: 1200, height: 800 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, 'pages/strict.html')); await p.waitForTimeout(1500);
  const st = () => p.evaluate(() => ({ hosts: document.querySelectorAll('#react-spotcheck-root').length, hook: typeof window.__spotcheck, frames: document.querySelectorAll('iframe').length }));
  console.log('mounted under StrictMode:', JSON.stringify(await st()));
  console.log('issues:', JSON.stringify(await p.evaluate(() => window.__spotcheck.issues().map(i => i.comp + ': ' + i.text))));
  // preview a fix, then unmount: page style must be restored
  const R = 'document.getElementById("react-spotcheck-root").shadowRoot';
  await p.evaluate(`${R}.getElementById('sysbtn').click()`); await p.waitForTimeout(300);
  const row = await p.evaluate(`[...${R}.querySelectorAll('.irow')].findIndex(r=>/padding 23/.test(r.textContent))`);
  await p.evaluate(`${R}.querySelectorAll('.irow')[${row}].click()`); await p.waitForTimeout(300);
  await p.evaluate(`${R}.querySelector('[data-pv="1"]').click()`); await p.waitForTimeout(300);
  const card = 'document.querySelector(".card").getAttribute("style")';
  console.log('during preview:', await p.evaluate(card));
  await p.evaluate(() => window.__toggle()); await p.waitForTimeout(400);
  console.log('after unmount:', JSON.stringify(await st()), '| card style:', await p.evaluate(card));
  await p.keyboard.press('Alt+Shift+KeyG'); await p.waitForTimeout(300);
  console.log('hotkey after unmount does nothing:', JSON.stringify(await st()));
  await p.evaluate(() => window.__toggle()); await p.waitForTimeout(1200);
  console.log('remounted:', JSON.stringify(await st()));
  console.log('errors:', errs); await b.close();
})();
