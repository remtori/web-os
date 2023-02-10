import { createSandboxContext } from './context';
import type { ExecuteCodeResponse, MainThreadAccessRequest, MainThreadAccessResponse, WorkerContext, WorkerRequest, WorkerResponse } from './types';

const noScope = Object.create(null);
const workerCtx: WorkerContext = {};
const moduleCache: Map<string, Module> = new Map();

interface Module {
	exports: Record<string, Function>;
}

const [sandboxConsole, sandboxExecutionCtx] = createSandboxContext({
	input(options) {
		const [_, data] = syncSendMessageToMain({
			type: 'main-thread-access',
			method: 'input',
			params: [options],
		});

		return data;
	},
	log(text) {
		const [_, data] = syncSendMessageToMain({
			type: 'main-thread-access',
			method: 'log',
			params: [text],
		});

		return data;
	},
	write(text) {
		const [_, data] = syncSendMessageToMain({
			type: 'main-thread-access',
			method: 'write',
			params: [text],
		});

		return data;
	},
});

self.onmessage = async (event) => {
	const request = event.data as WorkerRequest;
	switch (request.type) {
		case 'init': {
			workerCtx.sharedDataBuffer = request.sharedArrayBuffer;
			break;
		}
		case 'execute': {
			const { code, filename, doExecute } = request;

			let module: Module | undefined;
			if (code) {
				module = evalModule(filename, code);
			} else {
				module = moduleCache.get(filename);
			}

			if (module && doExecute && typeof module.exports.execute === 'function') {
				try {
					await (module.exports.execute as ExecuteFunction)(sandboxExecutionCtx);
					self.postMessage({ type: 'executeResult' });
				} catch (error) {
					self.postMessage({
						type: 'executeResult',
						error,
					});
				}
			}

			break;
		}
	}
}

function evalModule(filename: string, code: string): Module | undefined {
	const module: Module = { exports: {} };
	const require = () => {
	};

	const func = new Function(
		'exports', 'module', 'require',
		'__dirname', '__filename',
		'console', '__$code$__',
		'eval(__$code$__)',
	);

	try {
		func.bind(noScope)(module.exports, module, require, '/sandbox', filename, sandboxConsole, code);
	} catch (ex) {
		console.log('eval module', ex, code);
		return;
	}

	moduleCache.set(filename, module);
	return module;
}

function syncSendMessageToMain(request: MainThreadAccessRequest): MainThreadAccessResponse {
	const sharedDataBuffer = workerCtx.sharedDataBuffer!;
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

	return JSON.parse(response) as MainThreadAccessResponse;
}

