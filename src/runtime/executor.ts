import { compile } from './compiler';
import { ExecuteCodeRequest, InitRequest, WorkerResponse, ExecutionContext, AsyncResultRequest, ExecutionContextFuncs } from './types';
import JsWorker from './runtime-worker?worker';

class ExecutionError extends Error {
	filename?: string;
	lineno?: number;
	colno?: number;
}

interface Execution {
	code: string;
	filename: string;
	resolve: () => void;
	reject: (error: Error) => void;
	timeoutHandler: any;
	compileRequired: boolean;
}

export class JsExecutor {
	private _worker?: Worker;

	private _inflightExecution?: Execution;
	private _queue: Execution[];

	private _initRequest: InitRequest;
	private _ctx: ExecutionContextFuncs;

	private constructor(syncFns: string[], asyncFns: string[], props: ExecutionContext, funcs: ExecutionContextFuncs) {
		const size = 1024 * 1024 * 1024;

		this._queue = [];
		this._ctx = funcs;

		this._initRequest = {
			type: 'init',
			sharedArrayBuffer: new SharedArrayBuffer(size),
			contextProps: props,
			contextSyncFns: syncFns,
			contextAsyncFns: asyncFns,
		}
		this._restartWorker();
	}

	execute(code: string, filename: string, compileRequired = true): Promise<void> {
		return new Promise((resolve, reject) => {
			this._queue.push({
				filename,
				code,
				resolve,
				reject,
				timeoutHandler: 0,
				compileRequired,
			});

			this._next();
		});
	}

	private _restartWorker() {
		this._worker?.terminate();

		this._worker = new JsWorker();
		this._worker.addEventListener('error', (err) => {
			err.preventDefault();
			console.log('Worker error', err.filename, err.lineno, err.message);

			const ctx = this._inflightExecution;
			if (ctx) {
				const error = new ExecutionError(err.message);
				error.filename = err.filename;
				error.lineno = err.lineno;
				error.colno = err.colno;
				ctx.reject(error);

				clearTimeout(ctx.timeoutHandler);
				this._inflightExecution = undefined;
				this._next();
			}
		});

		this._worker.addEventListener('messageerror', (err) => {
			console.log('Worker messageerror', err);
			this._restartWorker();
		});

		const sharedData = new Int32Array(this._initRequest.sharedArrayBuffer);
		this._worker.addEventListener('message', async (event) => {
			const request = event.data as WorkerResponse;
			switch (request.type) {
				case 'execution-result': {
					const ctx = this._inflightExecution;
					if (ctx) {
						clearTimeout(ctx.timeoutHandler);
						this._inflightExecution = undefined;

						if (request.error) {
							ctx.reject(request.error);
						} else {
							ctx.resolve();
						}
						this._next();
					}

					break;
				}
				case 'main-thread-access': {
					const handler = this._ctx[request.method] as any;

					let result: any;
					let error: Error | undefined;
					try {
						result = await handler(...request.params);
					} catch (err) {
						error = err as Error;
					}

					if (typeof request.id === 'number') {
						// async request
						const resp: AsyncResultRequest = {
							type: 'async-execution-result',
							id: request.id,
							result,
							error,
						};

						this._worker!.postMessage(resp);
					} else {
						// sync request
						const stringifiedResp = JSON.stringify([
							'resp-' + request.method,
							result,
							error && [
								error.name,
								error.message
							]
						]);
						const stringifiedRespLength = stringifiedResp.length;
						for (let i = 0; i < stringifiedRespLength; i++) {
							sharedData[i + 1] = stringifiedResp.charCodeAt(i);
						}

						sharedData[0] = stringifiedRespLength;
						Atomics.notify(sharedData, 0);
					}

					break;
				}
			}
		});

		this._worker.postMessage(this._initRequest);
		this._next();
	}

	private async _next() {
		if (this._inflightExecution)
			return;

		this._inflightExecution = this._queue.shift();
		if (!this._inflightExecution)
			return;

		if (!this._worker)
			this._restartWorker();

		let code = this._inflightExecution.code;
		if (this._inflightExecution.compileRequired) {
			code = await compile(this._inflightExecution.code, this._inflightExecution.filename);
		}

		const execReq: ExecuteCodeRequest = {
			type: 'execute',
			code,
			filename: this._inflightExecution.filename,
			doExecute: true,
		};
		this._worker!.postMessage(execReq);

		this._inflightExecution.timeoutHandler = setTimeout(() => this._inflightExecution?.reject(new Error('timeout')), 5000);
	}
}
