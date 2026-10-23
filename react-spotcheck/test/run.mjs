/* Runs the planted-issue benchmark on the script-tag build, the StrictMode lifecycle test on the ESM build, and the theme checks. */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const here = path.dirname(fileURLToPath(import.meta.url));
const run = (file, env = {}) => execFileSync('node', [path.join(here, file)], { cwd: here, env: { ...process.env, ...env }, encoding: 'utf8' });
let failed = false;
const bench = run('bench.cjs', { PAGE: path.join(here, 'pages/global.html') });
const res = JSON.parse(bench.split('\n')[0]);
/* Token mode also flags a 56px heading and a one-off green that are not tokens: two expected extra flags. */
const ok = res.tp === res.positives && res.fp <= 2;
console.log(`benchmark: ${res.tp}/${res.positives} caught, ${res.fp} extra flags ${ok ? 'ok' : 'FAILED'}`); failed ||= !ok;
const strict = run('strict.cjs');
const lines = Object.fromEntries(strict.trim().split('\n').map(l => [l.split(':')[0], l.slice(l.indexOf(':') + 1).trim()]));
const checks = {
  'one host under StrictMode': /"hosts":1/.test(lines['mounted under StrictMode']),
  'preview restored on unmount': /padding: 23px/.test(lines['after unmount']) && /"hosts":0/.test(lines['after unmount']),
  'hotkey removed on unmount': /"hosts":0/.test(lines['hotkey after unmount does nothing']),
  'remounts': /"hosts":1/.test(lines['remounted']),
  'no page errors': lines['errors'] === '[]'
};
for (const [k, v] of Object.entries(checks)) { console.log(`${k}: ${v ? 'ok' : 'FAILED'}`); failed ||= !v; }
try { console.log(run('author.cjs').trim()); } catch (e) { console.log(String(e.stdout || e).trim()); failed = true; }
try { console.log(run('automargin.cjs').trim()); } catch (e) { console.log(String(e.stdout || e).trim()); failed = true; }
try { console.log(run('planner.cjs').trim()); } catch (e) { console.log(String(e.stdout || e).trim()); failed = true; }
try { console.log(run('datagrid.cjs').trim()); } catch (e) { console.log(String(e.stdout || e).trim()); failed = true; }
try { console.log(run('grid.cjs').trim()); } catch (e) { console.log(String(e.stdout || e).trim()); failed = true; }
try { console.log(run('theme.cjs').trim()); } catch (e) { console.log(String(e.stdout || e).trim()); failed = true; }
process.exit(failed ? 1 : 0);
