import { resolve } from 'path';
import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		basicSsl(),
	],
	server: {
		https: true,
		headers: {
			'cross-origin-opener-policy': 'same-origin',
			'cross-origin-embedder-policy': 'require-corp',
		}
	},
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html'),
			}
		}
	}
})
