/* Issue #1: auto margins (ml-auto, mr-auto, mt-auto, mx-auto, margin-inline-start: auto) are leftover space, not spacing. */
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SCRIPT = process.env.SPOTCHECK_SCRIPT || 'file://' + path.resolve(__dirname, '../dist/react-spotcheck.global.js');
const css = `.flex{display:flex}.flex-col{flex-direction:column}.ml-auto{margin-left:auto}.mr-auto{margin-right:auto}.mt-auto{margin-top:auto}.mx-auto{margin-left:auto;margin-right:auto}.ms-auto{margin-inline-start:auto}
.p-4{padding:16px}.gap-4{gap:16px}.mx-4{margin-left:16px;margin-right:16px}.mx-off{margin-left:18px;margin-right:18px}.w-40{width:160px}.h-80{height:320px}.max-w{max-width:900px}
@media (max-width: 10px) { .never-auto{margin-left:auto} }`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body style="margin:0"><div id="root">
<header class="flex p-4"><b class="w-40">Logo</b><nav class="ml-auto flex gap-4"><a>Plans</a><a>Runs</a></nav><button class="ms-auto">Sign in</button></header>
<main class="mx-auto max-w p-4"><div class="flex"><span class="mr-auto">Left</span><span>Right</span></div>
<aside class="flex flex-col h-80 w-40 p-4"><p style="margin:0">Top</p><p class="mt-auto" style="margin-bottom:0">Pinned bottom</p></aside>
<div class="flex"><div class="w-40 mx-4">ok 16</div><div class="w-40 mx-off" data-want>off 18</div><div class="w-40 never-auto" style="margin-left:23px">inactive media rule</div><div class="w-40" style="margin-left:auto">inline auto</div></div></main>
</div><script src="${SCRIPT}" data-root="#root" data-open></script></body></html>`;
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true }); const f = path.join(__dirname, 'shots', 'automargin.html'); fs.writeFileSync(f, html);
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); await p.goto('file://' + f); await p.waitForTimeout(900);
  const issues = await p.evaluate(() => window.__spotcheck.issues().filter(i => i.type === 'spacing').map(i => i.text));
  console.log('spacing issues:', JSON.stringify(issues));
  const autoFlags = issues.filter(t => /margin/.test(t) && !/margin (18|23)px/.test(t));
  const checks = {
    'no auto margin flagged': autoFlags.length === 0,
    'symmetric off-scale margin still flagged (18px)': issues.some(t => /margin 18px/.test(t)),
    'auto rule inside an inactive media query ignored (23px flagged)': issues.some(t => /margin 23px/.test(t))
  };
  let failed = 0; for (const [k, v] of Object.entries(checks)) { console.log(`${k}: ${v ? 'ok' : 'FAILED'}`); failed += !v; }
  await b.close(); process.exit(failed ? 1 : 0);
})();
