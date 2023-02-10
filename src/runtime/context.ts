import type { ContextHandler } from './types';

export function createSandboxContext(handler: ContextHandler): [Console, sandbox.Context] {
	const console = {
		assert(value: any, message?: string, ...optionalParams: any[]) { },
		count(label?: string) { },
		countReset(label?: string) { },
		trace(...args: any[]) { },
		debug(...args: any[]) { },
		info(...args: any[]) { },
		warn(...args: any[]) { },
		error(...args: any[]) { },
		log(...args: any[]) {
			handler.log(argsToString(args) + '\n');
		},
		group(...label: any[]) { },
		groupCollapsed(...label: any[]) { },
		groupEnd() { },
		table(tabularData: any, properties?: ReadonlyArray<string>) { },
		time(label?: string) { },
		timeEnd(label?: string) { },
		timeLog(label?: string, ...data: any[]) { },
	} as Console;

	const context: sandbox.Context = {
		readFloat(prompt, options = {}) {
			if (prompt && prompt.length > 0) {
				handler.write(prompt + '\n');
			}

			const out = handler.input({
				kind: 'typing',
				inputAttrs: {
					step: '0.2',
					...options,
					type: 'number',
				}
			});

			return parseFloat(out);
		},
		readInt(prompt, options = {}) {
			if (prompt && prompt.length > 0) {
				handler.write(prompt + '\n');
			}

			const out = handler.input({
				kind: 'typing',
				inputAttrs: {
					...options,
					type: 'number',
				}
			});

			return parseInt(out);
		},
		readString(prompt, options = {}) {
			if (prompt && prompt.length > 0) {
				handler.write(prompt + '\n');
			}

			return handler.input({
				kind: 'typing',
				inputAttrs: {
					...options,
					type: 'text',
				}
			});
		},
		readSelections(prompt, selections) {
			if (prompt && prompt.length > 0) {
				handler.write(prompt + '\n');
			}

			return handler.input({
				kind: 'buttons',
				selections,
			});
		},
		write(...args: any[]) {
			handler.write(argsToString(args));
		},
		writeln(...args: any[]) {
			handler.write(argsToString(args) + '\n');
		}
	};

	return [console, context];
}

function argsToString(args: any[]): string {
	let str = '';
	for (let i = 0; i < args.length; i++) {
		str += String(args[i]) + '\t';
	}

	return str;
}
