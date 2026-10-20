const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const SECTION = `
<section class="wrap section" data-bench>
 <div class="section-head"><h2>Benchmark</h2><p>Planted cases with known answers.</p></div>
 <div class="grid12">
  <article class="card" data-bm="P-sp1" style="padding:14px 24px"><h3>Padding 14</h3><p>Should flag.</p></article>
  <article class="card"><h3>Gap</h3><div data-bm="P-sp2" style="display:flex;gap:10px"><span>a</span><span>b</span></div></article>
  <article class="card"><h3>Nested</h3><div data-bm="P-sp4" style="padding:6px;border:1px solid var(--line);border-radius:8px">6px padding</div></article>
  <article class="card" data-bm="P-gr2" style="position:relative;left:-2px"><h3>Grid item −2px</h3><p>Should flag.</p></article>
  <article class="card"><h3 data-bm="P-ty1" style="font-size:17px;line-height:26px">Seventeen pixels</h3><p data-bm="P-ty2" style="font-size:13px;line-height:18px">Thirteen pixels once.</p></article>
  <article class="card"><h3>Colours</h3><a class="btn" data-bm="P-co1" style="background:#2a5bd8;color:#fff">Near accent</a><p data-bm="P-co2" style="color:#1b202b">Near ink text</p></article>
  <article class="card" data-bm="N1"><h3 style="font-size:56px;line-height:56px">Hi</h3></article>
  <article class="card"><span data-bm="N3" style="display:inline-block;width:24px;height:24px;border-radius:12px;background:#22a06b"></span><p data-bm="N6" style="color:rgba(16,21,31,.5)">Half-alpha text</p></article>
  <article class="card" data-bm="N5" data-spotcheck-ignore style="padding:13px"><h3>Ignored on purpose</h3><p>13px padding with data-spotcheck-ignore.</p></article>
  <article class="card" data-bm="E1" style="border-radius:12px;padding:8px"><div style="border-radius:12px;background:var(--bg);padding:16px">Same radius nested</div></article>
  <article class="card"><p data-bm="E2" style="color:#a3a8b1">Low-contrast text on white, about 2.4:1.</p><button data-bm="E4" style="width:18px;height:18px;padding:0;border:1px solid var(--line);border-radius:4px;background:none" aria-label="More">⋯</button></article>
  <article class="card"><p data-bm="E3" style="line-height:1.1">A long description that wraps onto three or more lines with a tight line height of 1.1, which the typography rules say needs at least 1.4 for anything that wraps.</p></article>
 </div>
 <div data-bm="P-sp3" style="margin-top:30px" class="card"><h3>Margin-top 30</h3><p>Should flag.</p></div>
 <div data-bm="P-gr1" class="card" style="position:relative;left:5px"><h3>Offset 5px</h3><p>Should flag as off column 1.</p></div>
 <div data-bm="N4" class="card" style="position:relative;left:24px;width:60%"><h3>Indented 24px on purpose</h3><p>Should not flag.</p></div>
 <div class="card"><h2 data-bm="E5a" style="font-size:20px;line-height:28px">An h2 at 20px</h2><h3 data-bm="E5b" style="font-size:28px;line-height:32px">An h3 at 28px, larger than its h2</h3></div>
 <div data-bm="E7" style="width:100vw;height:8px;background:var(--line)"></div>
</section>`;
const TRUTH = {
  'S1': 'type', 'S2': 'spacing', 'S3': 'grid', 'S4': 'spacing', 'S5': 'colour',
  'P-sp1': 'spacing', 'P-sp2': 'spacing', 'P-sp3': 'spacing', 'P-sp4': 'spacing', 'P-ty1': 'type', 'P-ty2': 'type', 'P-co1': 'colour', 'P-co2': 'colour', 'P-gr1': 'grid', 'P-gr2': 'grid'
};
const EXT = { E1: 'Nested radius: outer ≠ inner + padding (better-ui)', E2: 'Text contrast under 4.5:1 (better-accessibility)', E3: 'Line-height under 1.4 on wrapping text (better-typography)', E4: 'Target under 24×24px (better-accessibility)', E5a: 'Heading sizes do not descend (better-typography)', E5b: 'Heading sizes do not descend (better-typography)', E7: 'width: 100vw overflow (better-layout)' };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://'+process.env.PAGE); await p.waitForTimeout(2200);
  const res = await p.evaluate(([SECTION]) => {
    document.querySelector('.lead').dataset.bm = 'S1'; document.querySelector('.ctas').dataset.bm = 'S2'; document.querySelector('.route').dataset.bm = 'S3';
    document.querySelector('.card--b').dataset.bm = 'S4'; document.querySelector('.btn-alt').dataset.bm = 'S5';
    document.querySelector('.site main').insertAdjacentHTML('beforeend', SECTION);
    __spotcheck.rescan();
    return { system: __spotcheck.system(), issues: __spotcheck.issues().map(i => ({ type: i.type, text: i.text, bm: (i.el.closest('[data-bm]') || {}).dataset?.bm || null, exact: !!(i.el.dataset && i.el.dataset.bm), tag: i.el.tagName.toLowerCase() + '.' + (i.el.className || '') })), overflow: document.documentElement.scrollWidth > innerWidth };
  }, [SECTION]);
  // score
  const found = {}; const fps = []; const ext = {};
  for (const i of res.issues) {
    const bm = i.bm;
    if (bm && TRUTH[bm] && i.exact) { (found[bm] = found[bm] || []).push(i); continue; }
    if (bm && EXT[bm] && i.exact) { (ext[bm] = ext[bm] || []).push(i); continue; }
    fps.push(i);
  }
  const rows = Object.entries(TRUTH).map(([k, t]) => ({ id: k, expected: t, caught: !!(found[k] || []).find(x => x.type === t), got: (found[k] || []).map(x => x.type + ': ' + x.text) }));
  const tp = rows.filter(r => r.caught).length;
  const out = { system: res.system, total: res.issues.length, tp, positives: rows.length, fp: fps.length, recall: tp / rows.length, precision: tp / (tp + fps.length), rows, fps, ext: Object.keys(EXT).map(k => ({ id: k, rule: EXT[k], caught: !!ext[k], got: (ext[k] || []).map(x => x.type + ': ' + x.text) })), overflow: res.overflow, errs };
  fs.mkdirSync('shots', { recursive: true }); fs.writeFileSync('shots/bench.json', JSON.stringify(out, null, 1));
  console.log(JSON.stringify({ system: out.system, total: out.total, tp, positives: rows.length, fp: fps.length, recall: out.recall.toFixed(2), precision: out.precision.toFixed(2) }));
  rows.filter(r => !r.caught).forEach(r => console.log('MISSED', r.id, r.expected, r.got));
  fps.forEach(f => console.log('FP', f.bm, f.tag, f.type, f.text));
  out.ext.forEach(e => console.log('EXT', e.id, e.caught, e.got));
  console.log(errs);
  await b.close();
})();
