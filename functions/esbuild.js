const { build, context } = require('esbuild');

const BUILD_ENVS = [
    'S3_ENDPOINT',
    'S3_REGION',
    'S3_ACCESS_KEY',
    'S3_SECRET_KEY',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
];

/** @type {import('esbuild').BuildOptions} */
const buildOptions = {
	entryPoints: [
        './src/main.ts'
    ],
	bundle: true,
	outfile: 'dist/main.js',
	platform: 'node',
	target: 'node20.17',
    format: 'cjs',
	sourcemap: 'external',
    legalComments: 'none',
    define: Object.fromEntries(BUILD_ENVS.map(envName => {
        let envValue = process.env[envName];
        if (!envValue) {
            throw new Error(`Env ${envName} is required but not set`);
        }

        // NodeJS doesnt support newline escape character so this is a quick fix
        envValue = envValue.replaceAll('\\n', '\n');
        return [`process.env.${envName}`, JSON.stringify(envValue)];
    })),
}

if (process.argv[2] === '--watch') {
    context(buildOptions).then(ctx => ctx.watch());
} else {
	build(buildOptions);
}
