import { build } from 'esbuild';
await build({ entryPoints: ['test/pages/strict.jsx'], bundle: true, outfile: 'test/pages/strict.bundle.js', define: { 'process.env.NODE_ENV': '"development"' }, conditions: ['development'], jsx: 'automatic', logLevel: 'warning' });
