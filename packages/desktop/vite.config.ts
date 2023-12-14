import fs from 'fs';
import { resolve } from 'path';
import { ViteDevServer, defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import solidPlugin from 'vite-plugin-solid';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => ({
	plugins: [
		basicSsl(),
		solidPlugin(),
		tsconfigPaths(),
		multipleAssetsPlugin([resolve(__dirname, '../../dist/userspace')]),
	],
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

function multipleAssetsPlugin(extraAssetsDir: string[]) {
	return {
		name: 'multiple-assets-dir',
		configureServer(server: ViteDevServer) {
			server.middlewares.use((req, res, next) => {
				if (req.method !== 'GET' && req.method !== 'HEAD') {
					return next();
				}

				const url = new URL(req.originalUrl!, 'https://placeholder.com');
				const pathname = url.pathname.slice(1);

				let resolved = 0;
				let found = false;
				for (let i = 0; i < extraAssetsDir.length; i++) {
					const path = resolve(extraAssetsDir[i], pathname);
					fs.stat(path, (err, stat) => {
						resolved++;
						if (!err && !found) {
							if (stat.isFile()) {
								found = true;
								res.writeHead(200, {
									'Content-Type': 'application/octet-stream',
									'Content-Length': stat.size,
								});

								const fileStream = fs.createReadStream(path);
								fileStream.pipe(res);
								res.on('close', () => {
									fileStream.close();
								});

								return;
							}
						}

						if (resolved === extraAssetsDir.length && !found) {
							next();
						}
					});
				}

				if (resolved === extraAssetsDir.length) {
					next();
				}
			});
		},
	};
}
