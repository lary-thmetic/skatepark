/* Production build: react-spotcheck ships nothing but these stubs. */
const NOOP = Object.freeze({ destroy() {}, issues: () => [], system: () => null, rescan() {} });
export function init() { return NOOP; }
export function parseHotkey() { return () => false; }
export function Spotcheck() { return null; }
