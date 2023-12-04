export interface WorkerContext {
	sharedDataBuffer?: SharedArrayBuffer;
	console?: Console;
	executionContext?: ExecutionContext;
}

export type ExecutionContext = Record<string | number, any>;

export type ExecutionContextFuncs = Record<string, Function>;

export interface InitRequest {
	type: 'init';
	sharedArrayBuffer: SharedArrayBuffer;
	contextProps: Record<string | number, any>;
	contextSyncFns: string[];
	contextAsyncFns: string[];
}

export interface ExecuteCodeRequest {
	type: 'execute';
	code?: string;
	filename: string;
	doExecute: boolean;
}

export interface AsyncResultRequest {
	type: 'async-execution-result';
	id: number;
	result: any;
	error?: Error;
}

export type WorkerRequest = InitRequest | ExecuteCodeRequest | AsyncResultRequest;

export interface ExecuteCodeResponse {
	type: 'execution-result';
	error?: Error;
}

export interface MainThreadAccessRequest {
	type: 'main-thread-access';
	method: string,
	params: any,
	id?: number,
}

export type WorkerResponse = ExecuteCodeResponse | MainThreadAccessRequest;

export type ContextSyncFuncCallHandler = (method: string, params: any[]) => any;

export type ContextAsyncFuncCallHandler = (method: string, params: any[]) => Promise<any>;
