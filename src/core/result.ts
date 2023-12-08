export type Result<T, E = ErrorCode> = { ok: true; value: T } | { ok: false; error: E };

export type AsyncResult<T> = Promise<Result<T>>;

export function ok(): Result<void>;
export function ok<T>(value: T): Result<T>;
export function ok(value?: any): Result<any> {
	return { ok: true, value };
}

export function err<T>(error: ErrorCode): Result<T> {
	return { ok: false, error };
}

export enum ErrorCode {
	Ok = 0,
	NotImplemented,
	FileNotFound,
	FileAlreadyExists,
	FileIsNotADirectory,
	FileIsADirectory,
	InvalidArgument,
	InvalidPath,
	NotAbsolutePath,
}
