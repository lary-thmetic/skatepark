/* Feedback 7 and 4: issues point at the line that writes the JSX and the component that owns it (not a library
   wrapper or the parent's usage site); one line repeated per row is named as such; data-spotcheck-ignore with a
   value marks a deliberate value on that element. */
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined }); let failed = 0;
  const ok = (k, v) => { console.log(`${k}: ${v ? 'ok' : 'FAILED'}`); failed += !v; };
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, 'pages/author/index.html')); await p.waitForTimeout(1200);
  const r = await p.evaluate(() => ({ issues: window.__spotcheck.issues().map(i => ({ text: i.text, comp: i.comp, src: i.src })), prompt: window.__spotcheck.prompt() }));
  const gap = r.issues.find(i => /gap 7px/.test(i.text)), chev = r.issues.filter(i => /margin 2px/.test(i.text));
  console.log(JSON.stringify({ gap, chev: chev[0], n: chev.length }));
  ok('gap names the line that writes it', !!gap && /^src\/CustomerTree\.jsx:6$/.test(gap.src));
  ok('gap names the component that writes it', !!gap && gap.comp === 'CustomerTree');
  ok('chevron names the line that writes <ChevronRight>', chev.length === 3 && chev.every(i => /^src\/CustomerTree\.jsx:11$/.test(i.src)));
  ok('chevron owned by CustomerTree, not the library wrapper', chev.every(i => i.comp === 'CustomerTree'));
  ok('repeat note says one line, repeated per item', /written once in CustomerTree \(src\/CustomerTree\.jsx:11\), repeated per item/.test(r.prompt));
  await p.goto('file://' + path.resolve(__dirname, 'pages/author/index.html') + '#mark'); await p.reload(); await p.waitForTimeout(1200);
  const m = await p.evaluate(() => ({ left: window.__spotcheck.issues().filter(i => /gap 7px|margin 2px/.test(i.text)).length, marked: window.__spotcheck.marked() }));
  ok('scoped data-spotcheck-ignore silences only those values', m.left === 0 && m.marked === 4);
  ok('no page errors', errs.length === 0);
  await b.close(); process.exit(failed ? 1 : 0);
})();
