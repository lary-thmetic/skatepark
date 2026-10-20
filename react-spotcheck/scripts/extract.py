"""Turn the prototype's overlay script into src/core.js: an init(options) that mounts once and can be destroyed."""
import re, sys, pathlib
proto = pathlib.Path(sys.argv[1]).read_text()
start = proto.index('/* ---------- react-spotcheck v0 prototype ---------- */')
body = proto[start:proto.index('</script>', start)]
body = body[body.index('(function () {') + len('(function () {'):body.rindex('})();')]

def rep(a, b, n=1):
    global body
    c = body.count(a)
    assert c == n, (a[:70], c)
    body = body.replace(a, b)

rep("  const APP = document.getElementById('app');", "  const APP = opts.root || document.body;")
rep("  const KEY = 'react-spotcheck:' + location.pathname;", "  const KEY = 'react-spotcheck:' + location.pathname;\n  const HK = parseHotkey(opts.hotkey || 'alt+shift+g');")
rep("if (e.code === 'KeyG' && e.altKey && e.shiftKey && !e.metaKey && !e.ctrlKey) {", "if (HK(e)) {")
# every page-level listener gets the abort signal so destroy() removes it
TARGETS = ("window.addEventListener(", "document.addEventListener(", "matchMedia('(prefers-color-scheme: dark)').addEventListener(")
def close_paren(src, i):
    """index of the ')' matching the '(' at i, skipping strings and template literals"""
    depth, q = 0, None
    while i < len(src):
        c = src[i]
        if q:
            if c == '\\': i += 2; continue
            if c == q: q = None
        elif c in "'\"`": q = c
        elif c == '(': depth += 1
        elif c == ')':
            depth -= 1
            if depth == 0: return i
        i += 1
    raise ValueError('unbalanced')
def split_top(args):
    out, depth, q, cur, i = [], 0, None, '', 0
    while i < len(args):
        c = args[i]
        if q:
            cur += c
            if c == '\\': cur += args[i+1]; i += 2; continue
            if c == q: q = None
        elif c in "'\"`": q = c; cur += c
        elif c in '([{': depth += 1; cur += c
        elif c in ')]}': depth -= 1; cur += c
        elif c == ',' and depth == 0: out.append(cur); cur = ''
        else: cur += c
        i += 1
    out.append(cur); return out
n = 0; pos = 0
while True:
    hits = [(body.find(t, pos), t) for t in TARGETS]; hits = [h for h in hits if h[0] >= 0]
    if not hits: break
    at, t = min(hits); op = at + len(t) - 1; cl = close_paren(body, op)
    args = split_top(body[op+1:cl])
    if len(args) == 2: opt = ' { signal }'
    else:
        o = args[2].strip()
        opt = ' { signal, capture: true }' if o == 'true' else ' { signal, ' + o.strip('{} ').strip() + ' }'
    new = ','.join(args[:2]) + ',' + opt
    body = body[:op+1] + new + body[cl:]; n += 1; pos = op + 1 + len(new)
print('listeners with signal:', n)
body = body.replace("new MutationObserver(", "track(new MutationObserver(")
rep(".observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });", ").observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });")
rep(".observe(APP, { childList: true, subtree: true, attributes: true, characterData: true });", ").observe(APP, { childList: true, subtree: true, attributes: true, characterData: true });")
rep("  function rescanSoon() { if (S.muteMut || S.preview) return;", "  function rescanSoon() { if (dead || S.muteMut || S.preview) return;")
rep("  window.__spotcheck = Object.freeze({", "  const hook = Object.freeze({")
rep("    rescan: () => scan()\n  });", "    rescan: () => scan()\n  });\n  if (opts.testHook !== false) window.__spotcheck = hook;")
rep("  const boot = () => { buildBar(); setActive(!saved.collapsed); };", "  const boot = () => { if (dead) return; buildBar(); setActive(opts.open != null ? !!opts.open : !saved.collapsed); };")

core = f"""/*! react-spotcheck · generated from the prototype by scripts/extract.py; edit the prototype, not this file. */
/* Lucide icons: ISC, Copyright (c) 2026 Lucide Icons and Contributors; Feather-derived icons: MIT, Copyright (c) 2013-present Cole Bemis. See THIRD_PARTY_NOTICES.md. */
const MODS = {{ alt: 'altKey', option: 'altKey', shift: 'shiftKey', ctrl: 'ctrlKey', control: 'ctrlKey', meta: 'metaKey', cmd: 'metaKey' }};
/* Matched on the physical key (KeyG), not the typed character: Option+Shift+G types "˝" on macOS. */
export function parseHotkey(str) {{
  const parts = String(str).toLowerCase().split('+').map(s => s.trim()).filter(Boolean);
  const key = parts.pop() || 'g', mods = new Set(parts.map(p => MODS[p]).filter(Boolean));
  const code = /^[a-z]$/.test(key) ? 'Key' + key.toUpperCase() : /^[0-9]$/.test(key) ? 'Digit' + key : key;
  return e => e.code === code && ['altKey', 'shiftKey', 'ctrlKey', 'metaKey'].every(m => !!e[m] === mods.has(m));
}}

let current = null;
const NOOP = Object.freeze({{ destroy() {{}}, issues: () => [], system: () => null, rescan() {{}} }});

/** Mounts the overlay once per page. Calling it again returns the live instance. */
export function init(opts = {{}}) {{
  if (typeof window === 'undefined' || typeof document === 'undefined') return NOOP;
  if (current) return current;
  const ac = new AbortController(), signal = ac.signal, observers = [];
  const track = o => (observers.push(o), o);
  let dead = false;
{body}
  current = Object.freeze({{
    issues: hook.issues, system: hook.system, rescan: hook.rescan,
    destroy() {{
      if (dead) return; dead = true;
      try {{ clearPreview(); }} catch (e) {{ /* nothing previewed */ }}
      ac.abort(); observers.forEach(o => o.disconnect()); clearTimeout(rt); if (raf) cancelAnimationFrame(raf);
      try {{ dropUa(); }} catch (e) {{ /* no frame */ }}
      host.remove();
      if (window.__spotcheck === hook) delete window.__spotcheck;
      current = null;
    }}
  }});
  return current;
}}
"""
pathlib.Path('src/core.js').write_text(core)
print('core.js', len(core.splitlines()), 'lines; signal listeners:', core.count('{ signal'))
