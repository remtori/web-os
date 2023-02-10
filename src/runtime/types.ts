export interface WorkerContext {
	sharedDataBuffer?: SharedArrayBuffer;
}

export interface InitRequest {
	type: 'init';
	sharedArrayBuffer: SharedArrayBuffer;
}

export interface ExecuteCodeRequest {
	type: 'execute';
	code?: string;
	filename: string;
	doExecute: boolean;
}

export type WorkerRequest = InitRequest | ExecuteCodeRequest;

export interface ExecuteCodeResponse {
	type: 'executeResult';
	error?: Error;
}

interface MainThreadAccessRequestImpl<Method extends keyof ContextHandler> {
	type: 'main-thread-access';
	method: Method,
	params: Parameters<ContextHandler[Method]>,
}

export type MainThreadAccessRequest = {
	[K in keyof ContextHandler]: MainThreadAccessRequestImpl<K>;
}[keyof ContextHandler];

export type WorkerResponse = ExecuteCodeResponse | MainThreadAccessRequest;

export type MainThreadAccessResponse = ['MainThreadAccessResponse', any];

export interface TypingInputOptions {
	kind: 'typing';
	inputAttrs?: Record<string, any>;
}

export interface ButtonsInputOptions {
	kind: 'buttons';
	selections: string[];
}

export type InputOptions = TypingInputOptions | ButtonsInputOptions;

export interface ContextHandler {
	log(log: string): void;
	write(text: string): void;
	input(options: InputOptions): string;
}
