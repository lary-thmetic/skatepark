import { build } from 'esbuild';
await build({ entryPoints: ['test/pages/strict.jsx'], bundle: true, outfile: 'test/pages/strict.bundle.js', define: { 'process.env.NODE_ENV': '"development"' }, conditions: ['development'], jsx: 'automatic', logLevel: 'warning' });
/* jsxDev adds the source location React 18 keeps as _debugSource, as Vite's dev server does */
await build({ entryPoints: ['test/pages/author/src/App.jsx'], bundle: true, outfile: 'test/pages/author/author.bundle.js', define: { 'process.env.NODE_ENV': '"development"' }, conditions: ['development'], jsx: 'automatic', jsxDev: true, nodePaths: ['test/pages/author/node_modules'], logLevel: 'warning' });
