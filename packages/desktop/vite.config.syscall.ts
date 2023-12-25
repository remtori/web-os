import { resolve } from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';

export default defineConfig({
	publicDir: false,
	plugins: [
		tsconfigPaths(),
		dts({
			rollupTypes: true,
		}),
	],
	build: {
		// We dont really care about the output, we just want the types
		outDir: resolve(__dirname, 'dist'),
		lib: {
			entry: resolve(__dirname, './src/kernel/syscall/index.ts'),
			formats: ['es'],
		},
	},
});
