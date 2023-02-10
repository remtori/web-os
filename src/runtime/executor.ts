import { compile } from './compiler';
import { ContextHandler, ExecuteCodeRequest, InitRequest, WorkerResponse } from './types';
import JsWorker from './worker?worker';

interface ExecutionContext {
	code: string;
	resolve: () => void;
	reject: (error: Error) => void;
	timeoutHandler: number;
}

class ExecutionError extends Error {
	filename?: string;
	lineno?: number;
	colno?: number;
}

interface Execution {
	code: string;
	filename: string;
}

export class JsExecutor {
	private _worker?: Worker;
	private _inflightExecutionContext?: ExecutionContext;
	private _queue: Execution[];
	private _sharedArrayBuffer: SharedArrayBuffer;
	private _handler: Promisify<ContextHandler>;

	constructor(handler: Promisify<ContextHandler>) {
		this._queue = [];

		const size = 1024 * 1024 * 1024;
		this._sharedArrayBuffer = new SharedArrayBuffer(size);
		this._handler = handler;
		this._restartWorker();
	}

	execute(code: string, filename: string) {
		this._queue.push({ code, filename });
		this._next();
	}

	private _restartWorker() {
		this._worker?.terminate();

		this._worker = new JsWorker();
		this._worker.addEventListener('error', (err) => {
			err.preventDefault();
			console.log('Worker error', err.filename, err.lineno, err.message);

			const ctx = this._inflightExecutionContext;
			if (ctx) {
				const error = new ExecutionError(err.message);
				error.filename = err.filename;
				error.lineno = err.lineno;
				error.colno = err.colno;
				ctx.reject(error);

				clearTimeout(ctx.timeoutHandler);
				this._inflightExecutionContext = undefined;
				this._next();
			}
		});

		this._worker.addEventListener('messageerror', (err) => {
			console.log('Worker messageerror', err);
			this._restartWorker();
		});

		const sharedData = new Int32Array(this._sharedArrayBuffer);
		this._worker.addEventListener('message', async (event) => {
			const packet = event.data as WorkerResponse;
			switch (packet.type) {
				case 'executeResult': {
					console.log('stacktrace? ' + packet.error?.stack);
					const ctx = this._inflightExecutionContext;
					if (ctx) {
						clearTimeout(ctx.timeoutHandler);
						this._inflightExecutionContext = undefined;

						if (packet.error) {
							ctx.reject(packet.error);
						} else {
							ctx.resolve();
						}
						this._next();
					}

					break;
				}
				case 'main-thread-access': {
					const handler = this._handler[packet.method];
					// @ts-ignore
					const response = await handler(...packet.params);

					const stringifiedResp = JSON.stringify(['resp-' + packet.method, response]);
					const stringifiedRespLength = stringifiedResp.length;
					for (let i = 0; i < stringifiedRespLength; i++) {
						sharedData[i + 1] = stringifiedResp.charCodeAt(i);
					}

					sharedData[0] = stringifiedRespLength;
					Atomics.notify(sharedData, 0);

					break;
				}
			}
		});

		const initReq: InitRequest = {
			type: 'init',
			sharedArrayBuffer: this._sharedArrayBuffer,
		};

		this._worker.postMessage(initReq);
		this._next();
	}

	private async _next() {
		if (this._inflightExecutionContext)
			return;

		const execution = this._queue.shift();
		if (!execution)
			return;

		if (!this._worker)
			this._restartWorker();

		const code = await compile(execution.code, execution.filename);
		console.log(code);
		const execReq: ExecuteCodeRequest = {
			type: 'execute',
			code,
			filename: execution.filename,
			doExecute: true,
		};
		this._worker!.postMessage(execReq);
	}
}
