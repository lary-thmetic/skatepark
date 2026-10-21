/* The chrome must invert against what the page shows, whatever the OS preference or theming method. */
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SCRIPT = 'file://' + path.resolve(__dirname, '../dist/react-spotcheck.global.js');
const page = (htmlAttrs, bodyStyle, inner) => `<!doctype html><html ${htmlAttrs}><head><meta charset="utf-8"></head><body style="margin:0;${bodyStyle}"><div id="root">${inner}</div><script src="${SCRIPT}" data-root="#root"></script></body></html>`;
const cases = [
  { name: 'light page, OS dark', os: 'dark', html: page('', 'background:#fff', '<p>hi</p>'), want: 'light-page' },
  { name: 'dark page, OS light', os: 'light', html: page('', 'background:#0b0b0f;color:#eee', '<p>hi</p>'), want: 'dark-page' },
  { name: 'Tailwind class="dark" on html, OS light', os: 'light', html: page('class="dark"', '', '<div style="min-height:100vh;background:oklch(0.15 0.01 260)"><p>hi</p></div>'), want: 'dark-page' },
  { name: 'background only on the app root, OS light', os: 'light', html: page('', '', '<div style="min-height:100vh;background:#111827"><p>hi</p></div>'), want: 'dark-page' },
  { name: 'transparent page, no markers, OS dark', os: 'dark', html: page('', '', '<p>hi</p>'), want: 'light-page' }
];
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined }); let failed = 0;
  fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
  for (const c of cases) {
    const f = path.join(__dirname, 'shots', 'theme.html'); fs.writeFileSync(f, c.html);
    const p = await b.newPage({ colorScheme: c.os }); await p.goto('file://' + f); await p.waitForTimeout(600);
    const darkChrome = await p.evaluate(() => document.getElementById('react-spotcheck-root').classList.contains('dark'));
    const got = darkChrome ? 'dark-page' : 'light-page'; const ok = got === c.want; failed += !ok;
    console.log(`${c.name}: ${got} ${ok ? 'ok' : 'FAILED'}`); await p.close();
  }
  // live toggle, the way theme switchers do it: a class on <html> flips the page background
  const f = path.join(__dirname, 'shots', 'theme.html');
  fs.writeFileSync(f, page('', '', '<style>html.dark body{background:#0b0b0f}</style><p>hi</p>'));
  const p = await b.newPage({ colorScheme: 'light' }); await p.goto('file://' + f); await p.waitForTimeout(600);
  const st = () => p.evaluate(() => document.getElementById('react-spotcheck-root').classList.contains('dark'));
  const before = await st(); await p.evaluate(() => document.documentElement.classList.add('dark')); await p.waitForTimeout(300); const after = await st();
  await p.evaluate(() => document.documentElement.classList.remove('dark')); await p.waitForTimeout(300); const back = await st();
  const ok = !before && after && !back; failed += !ok; console.log(`live toggle via class on html: ${ok ? 'ok' : 'FAILED'} (${before} → ${after} → ${back})`);
  // starts off: tab only, no grid, until clicked
  const s0 = await p.evaluate(() => { const R = document.getElementById('react-spotcheck-root').shadowRoot; return { collapsed: !!R.querySelector('#bar.collapsed, .bar.collapsed, [data-collapsed="true"]'), grid: R.querySelectorAll('.gcol, .col, [data-grid] *').length }; });
  console.log('starts off:', JSON.stringify(s0));
  await b.close(); process.exit(failed ? 1 : 0);
})();
