export { $path } from './path';
export type { ParsedPath } from './path';

export { ErrorCode, err, ok, wrapAsync } from './result';
export type { AsyncResult, Result, SyncOrAsyncResult } from './result';

export type Promisify<T extends Record<string | symbol | number, any>> = {
	[K in keyof T]: (...params: Parameters<T[K]>) => Promise<ReturnType<T[K]>>;
};
