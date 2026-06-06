const esbuild = require('esbuild');

const args = process.argv.slice(2);
const isProduction = args.includes('--production');
const isWatch = args.includes('--watch');

const config = {
  entryPoints: ['src/extension.ts'],
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  outfile: 'out/extension.js',
  bundle: true,
  minify: isProduction,
  sourcemap: !isProduction,
  treeShaking: true,
  target: 'node18',
};

async function main() {
  if (isWatch) {
    const ctx = await esbuild.context(config);
    await ctx.watch();
    console.log('[esbuild] Watching for changes...');
  } else {
    const result = await esbuild.build(config);
    if (result.errors.length > 0) {
      console.error('[esbuild] Build failed:', result.errors);
      process.exit(1);
    }
    console.log('[esbuild] Build complete.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
