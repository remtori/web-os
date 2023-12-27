import { resolve } from 'path';
import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import solidPlugin from 'vite-plugin-solid';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => ({
	plugins: [basicSsl(), solidPlugin(), tsconfigPaths()],
	define: {
		__SANDBOX_URL__: JSON.stringify(
			mode === 'production' ? 'https://cdn.remtori.com/sandbox/index.html' : 'https://localhost:5992'
		),
	},
	build: {
		outDir: resolve(__dirname, '../../dist/desktop'),
		rollupOptions: {
			input: resolve(__dirname, 'index.html'),
		},
	},
	server: {
		port: 5991,
	},
}));
