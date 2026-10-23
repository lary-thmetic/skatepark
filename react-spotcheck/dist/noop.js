"use client";

// src/noop.js
var NOOP = Object.freeze({ destroy() {
}, issues: () => [], system: () => null, rescan() {
}, marked: () => 0, prompt: () => "" });
function init() {
  return NOOP;
}
function parseHotkey() {
  return () => false;
}
function Spotcheck() {
  return null;
}
export {
  Spotcheck,
  init,
  parseHotkey
};
