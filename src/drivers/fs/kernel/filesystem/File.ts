import { AsyncResult, ErrorCode, Result, err, ok } from '@core/result';
import { $FileSystem } from './FileSystem';

export type $FileMetadata = {
	isDirectory: boolean;
	isSymlink: boolean;
	isReadable: boolean;
	isWritable: boolean;
	isExecutable: boolean;
	size: number;
	accessTime: number;
	creationTime: number;
	modificationTime: number;
};

export enum SeekWhence {
	Set,
	Current,
	End,
}

export type $CreateFileOptions = {
	isDirectory: boolean;
};

export type $RemoveFileOptions = {
	recursive: boolean;
};

export interface $File {
	name(): string;

	isDirectory(): boolean;
	isSymlink(): boolean;

	fs(): $FileSystem;

	dirEntries(): AsyncResult<string[]>;
	getChild(name: string): AsyncResult<$File>;
	createChild(name: string, options?: $CreateFileOptions): AsyncResult<$File>;
	removeChild(name: string, options?: $RemoveFileOptions): AsyncResult<void>;

	isReadable(): boolean;
	setReadable(readable: boolean): AsyncResult<void>;

	isWritable(): boolean;
	setWritable(readable: boolean): AsyncResult<void>;

	isExecutable(): boolean;
	setExecutable(readable: boolean): AsyncResult<void>;

	stat(): Result<$FileMetadata>;
	open(): AsyncResult<$FileDescriptor>;
}

export abstract class $SimpleFile implements $File {
	protected _metadata: $FileMetadata;

	constructor(metadata?: Partial<$FileMetadata>) {
		const now = Date.now();
		this._metadata = Object.assign(
			{
				isDirectory: false,
				isSymlink: false,
				isReadable: false,
				isWritable: false,
				isExecutable: false,
				size: 0,
				accessTime: now,
				creationTime: now,
				modificationTime: now,
			},
			metadata
		);
	}

	abstract fs(): $FileSystem;
	abstract name(): string;
	abstract dirEntries(): AsyncResult<string[]>;
	abstract open(): AsyncResult<$FileDescriptor>;
	abstract getChild(name: string): AsyncResult<$File>;
	abstract createChild(name: string, options?: $CreateFileOptions): AsyncResult<$File>;
	abstract removeChild(name: string, options?: $RemoveFileOptions): AsyncResult<void>;

	stat(): Result<$FileMetadata> {
		return ok(this._metadata);
	}

	isDirectory(): boolean {
		return this._metadata.isDirectory;
	}

	isSymlink(): boolean {
		return this._metadata.isSymlink;
	}

	isReadable(): boolean {
		return this._metadata.isReadable;
	}

	isWritable(): boolean {
		return this._metadata.isWritable;
	}

	isExecutable(): boolean {
		return this._metadata.isExecutable;
	}

	async setReadable(readable: boolean): AsyncResult<void> {
		this._metadata.isReadable = readable;
		return ok();
	}

	async setWritable(writable: boolean): AsyncResult<void> {
		this._metadata.isWritable = writable;
		return ok();
	}

	async setExecutable(executable: boolean): AsyncResult<void> {
		this._metadata.isExecutable = executable;
		return ok();
	}
}

export interface $FileDescriptor {
	file(): $File | undefined;
	close(): AsyncResult<void>;

	seek(offset: number, whence: SeekWhence): AsyncResult<number>;
	offset(): number;

	read(buffer: ArrayBuffer): AsyncResult<number>;
	write(buffer: ArrayBuffer): AsyncResult<number>;
}

export const $FileHelper = {
	seek(offset: number, whence: SeekWhence, currentOffset: number, size: number): Result<number> {
		switch (whence) {
			case SeekWhence.Set:
				if (offset < 0 || offset > size) {
					return err(ErrorCode.InvalidOffset);
				}

				return ok(offset);
			case SeekWhence.Current:
				if (currentOffset + offset < 0 || currentOffset + offset > size) {
					return err(ErrorCode.InvalidOffset);
				}

				return ok(currentOffset + offset);
			case SeekWhence.End:
				if (size + offset < 0 || size + offset > size) {
					return err(ErrorCode.InvalidOffset);
				}

				return ok(size + offset);
		}

		return err(ErrorCode.InvalidArgument);
	},
};
