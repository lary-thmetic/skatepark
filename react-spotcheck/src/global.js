/* Script-tag build: <script src="react-spotcheck.global.js" data-root="#app"></script> mounts itself.
   It starts collapsed (off) until you click its tab or press the hotkey; add data-open to start it on.
   Add data-manual to mount later with ReactSpotcheck.init(). */
import { init, parseHotkey } from './core.js';
const me = document.currentScript;
if (me && !('manual' in me.dataset)) {
  const go = () => init({
    root: me.dataset.root ? document.querySelector(me.dataset.root) || undefined : undefined,
    hotkey: me.dataset.hotkey || undefined,
    open: 'open' in me.dataset ? me.dataset.open !== 'false' : undefined
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go, { once: true }); else go();
}
export { init, parseHotkey };
