import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
	build: {
		lib: {
			entry: {
				adapter: path.resolve(__dirname, './src/adapter/index.ts'),
				link: path.resolve(__dirname, './src/link/index.ts'),
			},
		},
	},
	esbuild: {
		legalComments: 'none',
	}
});
