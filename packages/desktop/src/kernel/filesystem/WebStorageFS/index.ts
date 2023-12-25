import { AsyncResult, ErrorCode, Result, err, ok, wrapAsync } from '@core/result';
import { $CreateFileOptions, $File, $FileDescriptor, $FileMetadata, $RemoveFileOptions, $SimpleFile } from '../File';
import { $FileSystem } from '../FileSystem';
import { $Custody } from '../Custody';

class $WebStorageFile extends $SimpleFile {
	private _fs: $WebStorageFS;
	private _handle: FileSystemFileHandle;

	constructor(fs: $WebStorageFS, handle: FileSystemFileHandle) {
		super();

		this._fs = fs;
		this._handle = handle;
	}

	name(): string {
		return this._handle.name;
	}

	fs(): $FileSystem {
		return this._fs;
	}

	async dirEntries(): AsyncResult<string[]> {
		return err(ErrorCode.FileIsNotADirectory);
	}

	async getChild(_name: string): AsyncResult<$File> {
		return err(ErrorCode.FileIsNotADirectory);
	}

	async createChild(_name: string, _options?: $CreateFileOptions): AsyncResult<$File> {
		return err(ErrorCode.FileIsNotADirectory);
	}

	async removeChild(_name: string, _options?: $RemoveFileOptions): AsyncResult<void> {
		return err(ErrorCode.FileIsNotADirectory);
	}

	async open(): AsyncResult<$FileDescriptor> {
		return err(ErrorCode.NotImplemented);
	}
}

class $WebStorageDirectory extends $SimpleFile {
	private _fs: $WebStorageFS;
	private _handle: FileSystemDirectoryHandle;

	constructor(fs: $WebStorageFS, handle: FileSystemDirectoryHandle) {
		super({
			isDirectory: true,
		});

		this._fs = fs;
		this._handle = handle;
	}

	name(): string {
		return this._handle.name;
	}

	fs(): $FileSystem {
		return this._fs;
	}

	async dirEntries(): AsyncResult<string[]> {
		// @ts-ignore
		return ok(Array.from(await this._handle.keys()));
	}

	async getChild(name: string): AsyncResult<$File> {
		let child: FileSystemHandle | undefined;
		try {
			child = await this._handle.getFileHandle(name);
		} catch (anyError) {
			const error = anyError as DOMException;
			switch (error.name) {
				case 'NotFoundError':
					return err(ErrorCode.FileNotFound);
				case 'NotAllowedError':
					return err(ErrorCode.PermissionDenied);
				case 'TypeMismatchError':
					break;
				default:
					return err(ErrorCode.UnknownError);
			}
		}

		if (!child) {
			try {
				child = await this._handle.getDirectoryHandle(name);
			} catch (anyError) {
				const error = anyError as DOMException;
				switch (error.name) {
					case 'NotFoundError':
						return err(ErrorCode.FileNotFound);
					case 'NotAllowedError':
						return err(ErrorCode.PermissionDenied);
					default:
						return err(ErrorCode.UnknownError);
				}
			}
		}

		if (child.kind === 'directory') {
			return ok(new $WebStorageDirectory(this._fs, child as FileSystemDirectoryHandle));
		} else {
			return ok(new $WebStorageFile(this._fs, child as FileSystemFileHandle));
		}
	}

	async createChild(name: string, options?: $CreateFileOptions): AsyncResult<$File> {
		// TODO: Return error when file exists

		const isDirectory = options?.isDirectory ?? false;
		const childHandlePromise: Promise<FileSystemHandle> = isDirectory
			? this._handle.getDirectoryHandle(name, { create: true })
			: this._handle.getFileHandle(name, { create: true });

		const childHandleRet = await wrapAsync(childHandlePromise, (error) => {
			switch (error.name) {
				case 'TypeMismatchError ':
					return ErrorCode.FileAlreadyExists;
				case 'NotAllowedError':
					return ErrorCode.PermissionDenied;
				default:
					return ErrorCode.UnknownError;
			}
		});

		if (!childHandleRet.ok) {
			return childHandleRet;
		}

		if (isDirectory) {
			return ok(new $WebStorageDirectory(this._fs, childHandleRet.value as FileSystemDirectoryHandle));
		} else {
			return ok(new $WebStorageFile(this._fs, childHandleRet.value as FileSystemFileHandle));
		}
	}

	async removeChild(name: string, options?: $RemoveFileOptions): AsyncResult<void> {
		this._handle.removeEntry(name, { recursive: options?.recursive ?? false });
		return err(ErrorCode.PermissionDenied);
	}

	async open(): AsyncResult<$FileDescriptor> {
		return err(ErrorCode.FileIsADirectory);
	}
}

export class $WebStorageFS implements $FileSystem {
	private _root: $WebStorageDirectory | undefined;

	constructor() {}

	async initialize(): AsyncResult<void> {
		const handle = await navigator.storage.getDirectory();
		this._root = new $WebStorageDirectory(this, handle);
		return ok();
	}

	root(): $File {
		return this._root!;
	}
}
