import fs from 'fs';
import { resolve } from 'path';
import { ViteDevServer, defineConfig } from 'vite';
import mime from 'mime-types';
import basicSsl from '@vitejs/plugin-basic-ssl';
import solidPlugin from 'vite-plugin-solid';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => ({
	base: '',
	plugins: [basicSsl(), tsconfigPaths(), multipleAssetsPlugin([resolve(__dirname, '../../dist/userspace')])],
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
									'Content-Type': mime.lookup(pathname) ?? 'application/octet-stream',
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
