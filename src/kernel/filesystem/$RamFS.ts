import { AsyncResult, ErrorCode, Result, err, ok } from '@kernel/core';
import {
	$CreateFileOptions,
	$File,
	$FileDescriptor,
	$FileHelper,
	$FileMetadata,
	$RemoveFileOptions,
	$SimpleFile,
	SeekWhence,
} from './File';
import { $FileSystem } from './FileSystem';

export class $RamFS implements $FileSystem {
	private _root: $RamFile;

	constructor() {
		this._root = new $RamFile(this, '<RamFS>', {
			isDirectory: true,
		});
	}

	initialize(): Result<void> {
		return ok();
	}

	root(): $File {
		return this._root;
	}
}

class $RamFile extends $SimpleFile implements $FileDescriptor {
	private _fs: $FileSystem;
	private _name: string;
	private _children: Map<string, $File>;

	private _data: Uint8Array;
	private _dataLength: number;
	private _offset: number;

	constructor(
		fs: $FileSystem,
		name: string,
		metadata?: Partial<$FileMetadata>,
	) {
		super(metadata);

		this._fs = fs;
		this._name = name;
		this._children = new Map();

		this._data = new Uint8Array(0);
		this._dataLength = 0;
		this._offset = 0;
	}

	fs(): $FileSystem {
		return this._fs;
	}

	file(): $File | undefined {
		return this;
	}

	close(): Result<void> {
		return err(ErrorCode.NotImplemented);
	}

	name(): string {
		return this._name;
	}

	async dirEntries(): AsyncResult<string[]> {
		if (!this.isDirectory()) {
			return err(ErrorCode.FileIsNotADirectory);
		}

		return ok(Array.from(this._children.keys()));
	}

	async open(): AsyncResult<$FileDescriptor> {
		if (this.isDirectory()) {
			return err(ErrorCode.FileIsADirectory);
		}

		this._metadata.accessTime = Date.now();
		return ok(this);
	}

	offset(): number {
		return this._offset;
	}

	async seek(offset: number, whence: SeekWhence): AsyncResult<number> {
		if (this.isDirectory()) {
			return err(ErrorCode.FileIsADirectory);
		}

		const ret = $FileHelper.seek(
			offset,
			whence,
			this._offset,
			this._dataLength,
		);

		if (!ret.ok) {
			return ret;
		}

		if (ret.value < 0 || ret.value >= this._dataLength) {
			return err(ErrorCode.InvalidArgument);
		}

		this._offset = ret.value;
		return ok(this._offset);
	}

	async read(buffer: ArrayBuffer): AsyncResult<number> {
		if (this.isDirectory()) {
			return err(ErrorCode.FileIsADirectory);
		}

		if (this._offset + buffer.byteLength > this._dataLength) {
			return err(ErrorCode.InvalidArgument);
		}

		const bufferView = new Uint8Array(buffer);
		bufferView.set(
			this._data.slice(this._offset, this._offset + buffer.byteLength),
		);
		this._offset += buffer.byteLength;
		return ok(buffer.byteLength);
	}

	async write(buffer: ArrayBuffer): AsyncResult<number> {
		if (this.isDirectory()) {
			return err(ErrorCode.FileIsADirectory);
		}

		const bufferView = new Uint8Array(buffer);
		if (this._offset + bufferView.byteLength > this._data.byteLength) {
			const oldCapacity = this._data.byteLength;
			const newCapacity = Math.max(
				this._offset + bufferView.byteLength,
				oldCapacity * 2,
			);
			const newData = new Uint8Array(newCapacity);
			newData.set(this._data);
			this._data = newData;
		}

		this._data.set(bufferView, this._dataLength);
		this._dataLength += bufferView.byteLength;
		this._metadata.size = this._data.byteLength;
		this._metadata.modificationTime = Date.now();

		return ok(bufferView.byteLength);
	}

	async getChild(name: string): AsyncResult<$File> {
		if (!this.isDirectory()) {
			return err(ErrorCode.FileIsNotADirectory);
		}

		const child = this._children.get(name);
		if (!child) {
			return err(ErrorCode.FileNotFound);
		}

		return ok(child);
	}

	async createChild(
		name: string,
		options?: $CreateFileOptions,
	): AsyncResult<$File> {
		if (!this.isDirectory()) {
			return err(ErrorCode.FileIsNotADirectory);
		}

		if (this._children.has(name)) {
			return err(ErrorCode.FileAlreadyExists);
		}

		const file = new $RamFile(this._fs, name, {
			isDirectory: options?.isDirectory ?? false,
		});
		this._children.set(name, file);
		return ok(file);
	}

	async removeChild(
		name: string,
		options?: $RemoveFileOptions,
	): AsyncResult<void> {
		if (!this.isDirectory()) {
			return err(ErrorCode.FileIsNotADirectory);
		}

		if (options?.recursive) {
			const success = this._children.delete(name);
			if (!success) {
				return err(ErrorCode.FileNotFound);
			}

			return ok();
		}

		const child = this._children.get(name);
		if (!child) {
			return err(ErrorCode.FileNotFound);
		}

		if (child.isDirectory()) {
			return err(ErrorCode.FileIsADirectory);
		}

		this._children.delete(name);
		return ok();
	}

	static instanceOf(instance: $File): instance is $RamFile {
		return instance.fs() instanceof $RamFS;
	}
}
