import { AsyncResult, ErrorCode, Result, err, ok } from '@core/result';

export type $FileMetadata = {
	isDirectory: boolean;
	isRegularFile: boolean;
	isSymlink: boolean;
	isDevice: boolean;
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

export interface $File {
	name(): string;
	parent(): $File | undefined;
	__setParent(parent: $File | undefined): void;

	isDirectory(): boolean;
	isRegularFile(): boolean;
	isSymlink(): boolean;
	isDevice(): boolean;

	absolutePath(): string;
	dirEntries(): AsyncResult<string[]>;

	isReadable(): boolean;
	setReadable(readable: boolean): AsyncResult<void>;

	isWritable(): boolean;
	setWritable(readable: boolean): AsyncResult<void>;

	isExecutable(): boolean;
	setExecutable(readable: boolean): AsyncResult<void>;

	stat(): Result<$FileMetadata>;
	open(): AsyncResult<$FileDescriptor>;

	getChild(name: string): AsyncResult<$File>;
	addChild(file: $File, name: string): AsyncResult<void>;
	removeChild(name: string): AsyncResult<void>;

	lookup?(name: string): AsyncResult<$File | undefined>;
}

export abstract class $BaseFile implements $File {
	protected _metadata: $FileMetadata;

	constructor(metadata?: Partial<$FileMetadata>) {
		const now = Date.now();
		this._metadata = Object.assign(
			{
				isDirectory: false,
				isRegularFile: false,
				isSymlink: false,
				isDevice: false,
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

	abstract name(): string;
	abstract parent(): $File | undefined;
	abstract __setParent(parent: $File | undefined): void;

	abstract absolutePath(): string;
	abstract dirEntries(): AsyncResult<string[]>;

	abstract open(): AsyncResult<$FileDescriptor>;

	abstract getChild(name: string): AsyncResult<$File>;
	abstract addChild(file: $File, name: string): AsyncResult<void>;
	abstract removeChild(name: string): AsyncResult<void>;

	isDirectory(): boolean {
		return this._metadata.isDirectory;
	}

	isRegularFile(): boolean {
		return this._metadata.isRegularFile;
	}

	isSymlink(): boolean {
		return this._metadata.isSymlink;
	}

	isDevice(): boolean {
		return this._metadata.isDevice;
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

	stat(): Result<$FileMetadata> {
		return ok(this._metadata);
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

export abstract class $HierarchicalFile extends $BaseFile {
	protected _parent: $File | undefined;

	private _cachedAbsolutePath: string | undefined;

	constructor(parent: $File | undefined, metadata?: Partial<$FileMetadata>) {
		super(metadata);

		this._parent = parent;
	}

	parent(): $File | undefined {
		return this._parent;
	}

	__setParent(parent: $File | undefined): void {
		this._parent = parent;
		this.invalidateAbsolutePath();
	}

	absolutePath(): string {
		if (!this._cachedAbsolutePath) {
			this.invalidateAbsolutePath();
		}

		return this._cachedAbsolutePath!;
	}

	protected invalidateAbsolutePath(): void {
		const name = this.name();
		this._cachedAbsolutePath = this._parent?.absolutePath() ?? '';
		if (name) {
			this._cachedAbsolutePath += '/' + name;
		}
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

export abstract class $ReadWriteFile extends $HierarchicalFile implements $FileDescriptor {
	protected _offset: number = 0;

	file(): $File | undefined {
		return this;
	}

	protected seekCursor(offset: number, whence: SeekWhence): Result<number> {
		let newOffset = 0;
		switch (whence) {
			case SeekWhence.Set:
				newOffset = offset;
				break;
			case SeekWhence.Current:
				newOffset = this._offset + offset;
				break;
			case SeekWhence.End:
				newOffset = this._metadata.size + offset;
				break;
			default:
				return err(ErrorCode.InvalidArgument);
		}

		if (newOffset < 0) {
			return err(ErrorCode.InvalidArgument);
		}

		return ok(newOffset);
	}

	async close(): AsyncResult<void> {
		return ok();
	}

	offset(): number {
		return this._offset;
	}

	abstract seek(offset: number, whence: SeekWhence): AsyncResult<number>;

	abstract read(buffer: ArrayBuffer): AsyncResult<number>;
	abstract write(buffer: ArrayBuffer): AsyncResult<number>;
}
