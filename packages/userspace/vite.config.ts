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
	build: {
		sourcemap: mode === 'production' ? true : 'inline',
		lib: {
			name: '__exports',
			entry: {
				explorer: resolve(__dirname, 'apps/explorer/index.ts'),
			},
			formats: ['iife'],
			fileName(_format, entryName) {
				return `${entryName}.js`;
			},
		},
		outDir: resolve(__dirname, 'dist/__/apps'),
		rollupOptions: {
			external: 'app-sandbox',
			output: {
				globals: {
					'app-sandbox': '__exports__AppSandbox',
				},
			},
		},
	},
}));
