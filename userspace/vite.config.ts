import { resolve } from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig(({ mode }) => ({
	plugins: [
		solidPlugin({
			solid: {
				omitNestedClosingTags: false,
				moduleName: 'app-sandbox',
				generate: 'universal',
			},
		}),
	],
	resolve: {
		alias: {
			'app-sandbox': resolve(__dirname, 'renderer/index.ts'),
		},
	},
	build: {
		sourcemap: mode === 'production' ? true : 'inline',
		lib: {
			name: '__exports',
			entry: {
				explorer: resolve(__dirname, 'apps/explorer/index.ts'),
			},
			formats: ['es'],
			fileName(_format, entryName) {
				return `${entryName}.js`;
			},
		},
		outDir: resolve(__dirname, 'dist/__/apps'),
	},
}));
