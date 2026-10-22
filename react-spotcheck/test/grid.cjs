/* The grid must appear on full-width layouts (no max-width container) as well as centred ones. */
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SCRIPT = 'file://' + path.resolve(__dirname, '../dist/react-spotcheck.global.js');
const page = (rootAttr, inner) => `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0"><div id="root">${inner}</div><script src="${SCRIPT}" ${rootAttr} data-open></script></body></html>`;
const fullWidth = '<div style="display:flex"><aside style="width:240px;padding:16px">Nav</aside><main style="flex:1;padding:24px"><h1>Plans</h1><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px"><div>a</div><div>b</div><div>c</div></div></main></div>';
const centred = '<main style="max-width:960px;margin:0 auto;padding:0 24px"><h1>Plans</h1><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px"><div>a</div><div>b</div><div>c</div></div></main>';
const cases = [['full-width layout, no root', '', fullWidth], ['full-width layout, data-root', 'data-root="#root"', fullWidth], ['centred container, no root', '', centred]];
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined }); let failed = 0;
  fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
  for (const [name, attr, inner] of cases) {
    const f = path.join(__dirname, 'shots', 'grid.html'); fs.writeFileSync(f, page(attr, inner));
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); await p.goto('file://' + f); await p.waitForTimeout(800);
    const tag = await p.evaluate(() => [...document.getElementById('react-spotcheck-root').shadowRoot.querySelectorAll('*')].map(e => e.textContent).find(t => /^\d+ col/.test(t) && t.length < 60) || null);
    const ok = !!tag; failed += !ok; console.log(`grid on ${name}: ${ok ? 'ok' : 'FAILED'} (${tag})`); await p.close();
  }
  await b.close(); process.exit(failed ? 1 : 0);
})();
