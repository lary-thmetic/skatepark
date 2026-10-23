/* From the Test Planner feedback: a data grid (one track per month) and a small card pair are not the layout grid (6),
   and red or amber status tints are not near-duplicates of greys (3). A real grey near-duplicate is still flagged. */
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SCRIPT = process.env.SPOTCHECK_SCRIPT || 'file://' + path.resolve(__dirname, '../dist/react-spotcheck.global.js');
const months = Array.from({ length: 36 }, (_, i) => `<div style="height:24px">${i + 1}</div>`).join('');
const html = `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#fff;font:14px/20px system-ui">
<div id="root"><main style="padding:24px">
  <div style="display:grid;grid-template-columns:repeat(2,398px);gap:12px;margin-bottom:24px"><div style="background:#f9fafb;padding:16px">Card</div><div style="background:#f9fafb;padding:16px">Card</div></div>
  <div style="display:grid;grid-template-columns:repeat(36,40px);gap:0">${months}</div>
  <p><span style="background:#fef2f2;padding:4px 8px">Blocked</span> <span style="background:#fffbeb;padding:4px 8px">At risk</span> <span style="background:#f9fafa;padding:4px 8px">Almost grey</span></p>
</main></div><script src="${SCRIPT}" data-root="#root" data-open></script></body></html>`;
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true }); const f = path.join(__dirname, 'shots', 'planner.html'); fs.writeFileSync(f, html);
  const p = await b.newPage({ viewport: { width: 1600, height: 800 } }); await p.goto('file://' + f); await p.waitForTimeout(900);
  const r = await p.evaluate(() => ({ sys: window.__spotcheck.system(), colour: window.__spotcheck.issues().filter(i => i.type === 'colour').map(i => i.el.textContent + ': ' + i.text) }));
  console.log('grid:', JSON.stringify(r.sys), '| colour issues:', JSON.stringify(r.colour));
  const checks = {
    'planner months not taken as the layout grid': r.sys.cols !== 36,
    'two-card pair not taken as the layout grid': r.sys.cols !== 2,
    'red tint not a near-duplicate of grey': !r.colour.some(t => /^Blocked/.test(t)),
    'amber tint not a near-duplicate of grey': !r.colour.some(t => /^At risk/.test(t)),
    'real grey near-duplicate still flagged': r.colour.some(t => /^Almost grey/.test(t))
  };
  let failed = 0; for (const [k, v] of Object.entries(checks)) { console.log(`${k}: ${v ? 'ok' : 'FAILED'}`); failed += !v; }
  await b.close(); process.exit(failed ? 1 : 0);
})();
