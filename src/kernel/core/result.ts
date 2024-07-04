export type Result<T, E = ErrorCode> =
	| { ok: true; value: T }
	| { ok: false; error: E };

export type AsyncResult<T> = Promise<Result<T>>;
export type SyncOrAsyncResult<T> = Result<T> | AsyncResult<T>;

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
	PermissionDenied,
	FileNotFound,
	FileAlreadyExists,
	FileIsNotADirectory,
	FileIsADirectory,
	InvalidArgument,
	InvalidOffset,
	InvalidPath,
	NotAbsolutePath,
	WrongFileSystem,
	UnknownError,
}

export const wrapAsync = async <T>(
	promise: Promise<T>,
	mapError: (err: Error) => ErrorCode,
): AsyncResult<T> => {
	try {
		const value = await promise;
		return ok(value);
	} catch (anyError) {
		const error = anyError as Error;
		return err(mapError(error));
	}
};
