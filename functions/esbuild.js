const { build, context } = require('esbuild');

/** @type {import('esbuild').BuildOptions} */
const buildOptions = {
	entryPoints: [
        './src/main.ts'
    ],
	bundle: true,
	outfile: 'dist/main.cjs',
	platform: 'node',
	packages: 'bundle',
	target: 'node20.17',
    format: 'cjs',
	sourcemap: 'external',
    legalComments: 'none',
}

if (process.argv[2] === '--watch') {
    context(buildOptions).then(ctx => ctx.watch());
} else {
	build(buildOptions);
}
