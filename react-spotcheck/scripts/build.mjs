import { build } from 'esbuild';
const common = { bundle: true, target: 'es2020', legalComments: 'inline', logLevel: 'info' };
await build({ ...common, entryPoints: ['src/index.js'], outfile: 'dist/index.js', format: 'esm', external: ['react'], banner: { js: '"use client";' } });
await build({ ...common, entryPoints: ['src/noop.js'], outfile: 'dist/noop.js', format: 'esm', banner: { js: '"use client";' } });
await build({ ...common, entryPoints: ['src/global.js'], outfile: 'dist/react-spotcheck.global.js', format: 'iife', globalName: 'ReactSpotcheck', minify: true });
