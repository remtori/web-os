import { createSandboxContext } from './context';
import type { ExecuteCodeResponse, MainThreadAccessRequest, WorkerContext, WorkerRequest, WorkerResponse } from './types';

const noScope = Object.create(null);
const workerCtx: WorkerContext = {};
const asyncRequests: Map<number, [(value: any) => void, (error: Error) => void]> = new Map();
const moduleCache: Map<string, Module> = new Map();

interface Module {
	exports: Record<string, Function>;
}

self.onmessage = (event) => {
	onRequest(event.data as WorkerRequest);
}

async function onRequest(request: WorkerRequest) {
	switch (request.type) {
		case 'init': {
			workerCtx.sharedDataBuffer = request.sharedArrayBuffer;
			const [sandboxConsole, sandboxExecutionCtx] = createSandboxContext(
				request.contextProps,
				request.contextSyncFns,
				request.contextAsyncFns,
				(method, params) => syncSendMessageToMain(workerCtx, {
					type: 'main-thread-access',
					method,
					params,
				}),
				(method, params) => asyncSendMessageToMain({
					type: 'main-thread-access',
					method,
					params,
				}),
			);

			workerCtx.console = sandboxConsole;
			workerCtx.executionContext = sandboxExecutionCtx;
			break;
		}
		case 'async-execution-result': {
			const o = asyncRequests.get(request.id);
			if (o) {
				const [resolve, reject] = o;
				if (request.error) {
					reject(request.error);
				} else {
					resolve(request.result);
				}
			}

			break;
		}
		case 'execute': {
			const { code, filename, doExecute } = request;

			let module: Module | undefined;
			if (code) {
				module = await evalModule(workerCtx, filename, code);
			} else {
				module = moduleCache.get(filename);
			}

			if (module && doExecute && typeof module.exports.main === 'function') {
				let resp: ExecuteCodeResponse;

				try {
					await (module.exports.main as Main)(workerCtx.executionContext as any);
					resp = { type: 'execution-result' };
				} catch (error) {
					resp = {
						type: 'execution-result',
						error: error as Error,
					};
				}

				self.postMessage(resp);
			}

			break;
		}
	}
}

async function evalModule(ctx: WorkerContext, filename: string, code: string): Promise<Module | undefined> {
	const module: Module = { exports: {} };
	const require = () => {
	};

	const globals = {
		exports: module.exports,
		module,
		require,
		console: ctx.console,
		__dirname: '/sandbox',
		__filename: filename,
		__sourcecode: code,
	};

	const func = new Function(...Object.keys(globals), 'return eval(__sourcecode);');

	let error: undefined | Error;
	try {
		await func.apply(noScope, Object.values(globals));
	} catch (ex) {
		error = ex as Error;
	}

	moduleCache.set(filename, module);
	return module;
}

function syncSendMessageToMain(ctx: WorkerContext, request: MainThreadAccessRequest) {
	const sharedDataBuffer = ctx.sharedDataBuffer!;
	const sharedData = new Int32Array(sharedDataBuffer);

	// reset length
	Atomics.store(sharedData, 0, 0);

	// call mainthread
	self.postMessage(request);

	// wait for response
	Atomics.wait(sharedData, 0, 0);

	let response = '';
	const dataLength = Atomics.load(sharedData, 0);
	for (let i = 0; i < dataLength; i++) {
		response += String.fromCharCode(sharedData[i + 1]);
	}

	const [error, result] = JSON.parse(response) as [Error | undefined, any];
	if (error) {
		throw error;
	}

	return result;
}

let asyncMsgIdGen = 1;
function asyncSendMessageToMain(request: MainThreadAccessRequest) {
	return new Promise((resolve, reject) => {
		request.id = asyncMsgIdGen++;

		asyncRequests.set(request.id, [resolve, reject]);
		self.postMessage(request);
	});
}