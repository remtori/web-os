import initSwc, { transformSync, Options } from '@swc/wasm-web';
import swcWasmUrl from '@swc/wasm-web/wasm-web_bg.wasm?url'

const compilerOptions: Options = {
	isModule: true,
	root: '/sandbox',
	rootMode: 'root',
	envName: 'production',
	configFile: false,
	swcrc: false,
	inputSourceMap: false,
	jsc: {
		target: 'es2021',
		minify: {
			compress: true,
			mangle: false,
			sourceMap: true,
		},
		parser: {
			syntax: 'typescript',
		},
		externalHelpers: false,
	},
	module: {
		type: 'commonjs',
		strict: true,
		strictMode: false,
		lazy: true,
		importInterop: 'none',
	},
	minify: true,
	sourceMaps: 'inline',
	inlineSourcesContent: true,
}

const initSwcPromise = initSwc(swcWasmUrl);

export async function compile(tsCode: string, filename: string): Promise<string> {
	await initSwcPromise;

	const { code } = transformSync(tsCode, {
		...compilerOptions,
		filename,
	});

	return code;
}
