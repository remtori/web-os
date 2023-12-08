import { AsyncResult, ErrorCode, err, ok } from '@core/result';
import { $File, $FileDescriptor, $FileMetadata, $ReadWriteFile, SeekWhence } from '../File';
import { $FileSystem } from '../FileSystem';

class $RamFile extends $ReadWriteFile {
	private _name: string;
	private _children: Map<string, $File>;

	private _data: Uint8Array;
	private _dataLength: number;

	constructor(parent: $File | undefined, name: string, metadata?: Partial<$FileMetadata>) {
		super(parent, metadata);

		this._name = name;
		this._data = new Uint8Array(0);
		this._dataLength = 0;
		this._children = new Map();
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

	async seek(offset: number, whence: SeekWhence): AsyncResult<number> {
		if (this.isDirectory()) {
			return err(ErrorCode.FileIsADirectory);
		}

		const ret = this.seekCursor(offset, whence);
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
		bufferView.set(this._data.slice(this._offset, this._offset + buffer.byteLength));
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
			const newCapacity = Math.max(this._offset + bufferView.byteLength, oldCapacity * 2);
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

	async addChild(file: $File, name: string): AsyncResult<void> {
		if (!this.isDirectory()) {
			return err(ErrorCode.FileIsNotADirectory);
		}

		if (this._children.has(name)) {
			return err(ErrorCode.FileAlreadyExists);
		}

		file.__setParent(this);
		this._children.set(name, file);
		return ok();
	}

	async removeChild(name: string): AsyncResult<void> {
		if (!this.isDirectory()) {
			return err(ErrorCode.FileIsNotADirectory);
		}

		const success = this._children.delete(name);
		if (!success) {
			return err(ErrorCode.FileNotFound);
		}

		return ok();
	}
}

export class $RamFS implements $FileSystem {
	private _root: $RamFile;

	constructor() {
		this._root = new $RamFile(undefined, '', {
			isDirectory: true,
		});
	}

	async initialize(): AsyncResult<void> {
		return ok();
	}

	root(): $File {
		return this._root;
	}

	mkdir(base: $File, name: string): AsyncResult<void> {
		const folder = new $RamFile(base, name, {
			isDirectory: true,
		});

		return base.addChild(folder, name);
	}

	async create(base: $File, name: string): AsyncResult<$File> {
		const file = new $RamFile(base, name, {
			isRegularFile: true,
		});

		const ret = await base.addChild(file, name);
		if (!ret.ok) {
			return ret;
		}

		return ok(file);
	}
}
