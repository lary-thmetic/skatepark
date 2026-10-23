/* Feedback, suggestion 6 follow-up: with no layout grid, a guessed 12-column grid is drawn but never audited,
   so a planner's bordered cells are not reported as "1px right of column 11". */
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SCRIPT = process.env.SPOTCHECK_SCRIPT || 'file://' + path.resolve(__dirname, '../dist/react-spotcheck.global.js');
const cells = Array.from({ length: 36 }, (_, i) => `<div style="border-left:1px solid #e5e7eb;height:32px;display:block">${i + 1}</div>`).join('');
const html = `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;font:14px/20px system-ui">
<div id="root"><main style="display:flex;flex-direction:column;gap:4px">
  <section><div style="margin-left:1px;width:600px">Row header after a 1px border</div><div style="margin-left:1px;width:600px">Cell row</div></section>
  <header style="display:flex;gap:4px"><b>Planner</b><span>2026–2028</span></header>
  <div style="display:grid;grid-template-columns:repeat(36,1fr);gap:0">${cells}</div>
  <div style="display:grid;grid-template-columns:repeat(36,1fr);gap:0">${cells}</div>
</main></div><script src="${SCRIPT}" data-root="#root" data-open></script></body></html>`;
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true }); const f = path.join(__dirname, 'shots', 'datagrid.html'); fs.writeFileSync(f, html);
  const p = await b.newPage({ viewport: { width: 1600, height: 800 } }); await p.goto('file://' + f); await p.waitForTimeout(900);
  const R = 'document.getElementById("react-spotcheck-root").shadowRoot';
  await p.evaluate(`${R}.getElementById('sysbtn').click()`); await p.waitForTimeout(300);
  const r = await p.evaluate(`(() => ({ sys: window.__spotcheck.system(), grid: window.__spotcheck.issues().filter(i => i.type === 'grid').length,
    chip: [...${R}.querySelectorAll('.sc')].map(e => e.textContent).find(t => /^Grid/.test(t)),
    drawn: !![...${R}.querySelectorAll('*')].find(e => /^\\d+ col/.test(e.textContent) && e.textContent.length < 60) }))()`);
  console.log(JSON.stringify(r));
  const checks = { 'no grid findings on a data grid': r.grid === 0, 'guide grid still drawn': r.drawn, 'grid score shown as not checked': r.chip === 'Grid–', 'guessed gutter is not 4px': r.sys.gutter >= 12 };
  let failed = 0; for (const [k, v] of Object.entries(checks)) { console.log(`${k}: ${v ? 'ok' : 'FAILED'}`); failed += !v; }
  await b.close(); process.exit(failed ? 1 : 0);
})();
