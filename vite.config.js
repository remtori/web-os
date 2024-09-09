import { defineConfig, loadEnv } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import tsconfigPaths from 'vite-tsconfig-paths';

const BUILD_ENVS = [
    'FIREBASE_PROJECT_ID',
	'FIREBASE_CLIENT_EMAIL',
	'FIREBASE_CLIENT_API_KEY',
	'FIREBASE_CLIENT_MESSAGING_SENDER_ID',
	'FIREBASE_CLIENT_APP_ID',
	'FIREBASE_CLIENT_MEASUREMENT_ID',
];

const ENV = loadEnv('production', __dirname, '');
const buildEnvDefine = Object.fromEntries(BUILD_ENVS.map(envName => {
    let envValue = ENV[envName];
    if (!envValue) {
        throw new Error(`Env ${envName} is required but not set`);
    }

    // NodeJS doesnt support newline escape character so this is a quick fix
    envValue = envValue.replaceAll('\\n', '\n');
    return [`process.env.${envName}`, JSON.stringify(envValue)];
}));

export default defineConfig({
	base: '',
	plugins: [
		solidPlugin(),
		tsconfigPaths()
	],
	server: {
		proxy: {
			'/api': 'http://localhost:5696'
		}
	},
	define: {
		...buildEnvDefine,
	},
	esbuild: {
		legalComments: 'none',
	},
	build: {
		outDir: 'dist/static',
	}
});
