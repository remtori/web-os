import { ErrorCode, Result, SyncOrAsyncResult, err, ok } from '@kernel/core';
import { $FileSystem } from './FileSystem';

export type $FileMetadata = {
	isDirectory: boolean;
	isSymlink: boolean;
	isReadable: boolean;
	isWritable: boolean;
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

	dirEntries(): SyncOrAsyncResult<string[]>;
	getChild(name: string): SyncOrAsyncResult<$File>;
	createChild(
		name: string,
		options?: $CreateFileOptions,
	): SyncOrAsyncResult<$File>;
	removeChild(
		name: string,
		options?: $RemoveFileOptions,
	): SyncOrAsyncResult<void>;

	isReadable(): boolean;
	setReadable(readable: boolean): SyncOrAsyncResult<void>;

	isWritable(): boolean;
	setWritable(readable: boolean): SyncOrAsyncResult<void>;

	stat(): SyncOrAsyncResult<$FileMetadata>;
	open(): SyncOrAsyncResult<$FileDescriptor>;
}

export abstract class $SimpleFile implements $File {
	protected _metadata: $FileMetadata;

	constructor(metadata?: Partial<$FileMetadata>) {
		this._metadata = Object.assign(
			{
				isDirectory: false,
				isSymlink: false,
				isReadable: false,
				isWritable: false,
				size: 0,
				accessTime: 0,
				creationTime: 0,
				modificationTime: 0,
			},
			metadata,
		);
	}

	abstract fs(): $FileSystem;
	abstract name(): string;
	abstract dirEntries(): SyncOrAsyncResult<string[]>;
	abstract open(): SyncOrAsyncResult<$FileDescriptor>;
	abstract getChild(name: string): SyncOrAsyncResult<$File>;
	abstract createChild(
		name: string,
		options?: $CreateFileOptions,
	): SyncOrAsyncResult<$File>;
	abstract removeChild(
		name: string,
		options?: $RemoveFileOptions,
	): SyncOrAsyncResult<void>;

	stat(): SyncOrAsyncResult<$FileMetadata> {
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

	setReadable(readable: boolean) {
		this._metadata.isReadable = readable;
		return ok();
	}

	setWritable(writable: boolean) {
		this._metadata.isWritable = writable;
		return ok();
	}
}

export interface $FileDescriptor {
	file(): $File | undefined;
	close(): SyncOrAsyncResult<void>;

	seek(offset: number, whence: SeekWhence): SyncOrAsyncResult<number>;
	offset(): number;

	read(buffer: ArrayBuffer): SyncOrAsyncResult<number>;
	write(buffer: ArrayBuffer): SyncOrAsyncResult<number>;
}

export const $FileHelper = {
	seek(
		offset: number,
		whence: SeekWhence,
		currentOffset: number,
		size: number,
	): Result<number> {
		switch (whence) {
			case SeekWhence.Set:
				if (offset < 0 || offset > size) {
					return err(ErrorCode.InvalidOffset);
				}

				return ok(offset);
			case SeekWhence.Current:
				if (
					currentOffset + offset < 0 ||
					currentOffset + offset > size
				) {
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
