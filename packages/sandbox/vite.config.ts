import { resolve } from 'path';
import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import solidPlugin from 'vite-plugin-solid';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => ({
	base: '',
	plugins: [basicSsl(), tsconfigPaths()],
	define: {
		__WORKER_MODE__: JSON.stringify(mode === 'production' ? 'classic' : 'module'),
		__DEV__: JSON.stringify(mode !== 'production'),
	},
	worker: {
		format: 'iife',
		plugins: () => [
			solidPlugin({
				solid: {
					omitNestedClosingTags: false,
					moduleName: 'app-sandbox',
					generate: 'universal',
				},
			}),
			tsconfigPaths(),
		],
		rollupOptions: {
			output: {
				entryFileNames: '[name].js',
			},
		},
	},
	resolve: {
		alias: {
			'app-sandbox': resolve(__dirname, './src/index.ts'),
		},
	},
	build: {
		modulePreload: false,
		outDir: resolve(__dirname, '../../dist/sandbox'),
		rollupOptions: {
			input: resolve(__dirname, 'index.html'),
			output: {
				entryFileNames: '[name].js',
			},
		},
	},
	server: {
		port: 5992,
	},
}));
