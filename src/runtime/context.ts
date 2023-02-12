import type { ContextAsyncFuncCallHandler, ContextSyncFuncCallHandler, ExecutionContext } from './types';

export function createSandboxContext(
	contextProps: Record<string, any>,
	contextSyncFns: string[],
	contextAsyncFns: string[],
	syncHandler: ContextSyncFuncCallHandler,
	asyncHandler: ContextAsyncFuncCallHandler,
): [Console, ExecutionContext] {
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
			asyncHandler('log', [argsToString(args) + '\n']);
		},
		group(...label: any[]) { },
		groupCollapsed(...label: any[]) { },
		groupEnd() { },
		table(tabularData: any, properties?: ReadonlyArray<string>) { },
		time(label?: string) { },
		timeEnd(label?: string) { },
		timeLog(label?: string, ...data: any[]) { },
	} as Console;

	const context: ExecutionContext = {
		...contextProps
	};

	for (const fnName of contextSyncFns) {
		context[fnName] = (...args: any[]) => syncHandler(fnName, args);
	}

	for (const fnName of contextAsyncFns) {
		context[fnName] = (...args: any[]) => asyncHandler(fnName, args);
	}

	deepFreeze(context);
	return [console, context];
}

function argsToString(args: any[]): string {
	let str = '';
	for (let i = 0; i < args.length; i++) {
		str += String(args[i]) + '\t';
	}

	return str;
}

function deepFreeze(object: any) {
	const stack = [object];
	while (stack.length > 0) {
		const o = stack.shift();
		if (!Object.isFrozen(o)) {
			for (const key in Object.getOwnPropertyNames(o)) {
				stack.push(o[key]);
			}

			Object.freeze(o);
		}
	}
}
