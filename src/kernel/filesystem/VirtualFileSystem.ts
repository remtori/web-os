import { AsyncResult, ErrorCode, err, ok } from '@core/result';
import { $FileSystem } from './FileSystem';
import { $File, $FileDescriptor, $HierarchicalFile } from './File';
import { $RamFS } from './RamFS/RamFS';
import { $path } from '@core/path';

class $FileNode extends $HierarchicalFile {
	private _name: string;
	private _children: Map<string, $File>;
	private _mount: $FileSystem | undefined;

	constructor(name: string, mount?: $FileSystem) {
		super(undefined, {
			accessTime: Date.now(),
			modificationTime: Date.now(),
			creationTime: Date.now(),
			size: 0,
			isDirectory: true,
			isRegularFile: false,
			isSymlink: false,
			isDevice: false,
			isExecutable: false,
			isReadable: true,
			isWritable: true,
		});

		this._name = name;
		this._children = new Map();
		this._mount = mount;
	}

	name(): string {
		return this._name;
	}

	async dirEntries(): AsyncResult<string[]> {
		if (this._mount) {
			return this._mount.root().dirEntries();
		}

		return ok(Array.from(this._children.keys()));
	}

	async open(): AsyncResult<$FileDescriptor> {
		return err(ErrorCode.InvalidArgument);
	}

	async getChild(name: string): AsyncResult<$File> {
		if (this._mount) {
			return this._mount.root().getChild(name);
		}

		const child = this._children.get(name);
		if (!child) {
			return err(ErrorCode.FileNotFound);
		}

		return ok(child);
	}

	async addChild(file: $File, name: string): AsyncResult<void> {
		if (this._mount) {
			return this._mount.root().addChild(file, name);
		}

		if (this._children.has(name)) {
			return err(ErrorCode.FileAlreadyExists);
		}

		file.__setParent(this);
		this._children.set(name, file);
		return ok();
	}

	async removeChild(name: string): AsyncResult<void> {
		if (this._mount) {
			return this._mount.root().removeChild(name);
		}

		if (!this._children.has(name)) {
			return err(ErrorCode.FileNotFound);
		}

		this._children.delete(name);
		return ok();
	}
}

class $FileSystemImpl {
	private _root: $FileNode;
	private _initialized: boolean;
	private _readyPromise: Promise<void>;

	constructor() {
		this._root = new $FileNode('/');
		this._initialized = false;
		this._readyPromise = this.initialize();
	}

	private async initialize() {
		let ret = await this.mount('/tmp', new $RamFS());
		if (!ret.ok) {
			console.error(`Failed to mount /tmp: ${ret.error}`);
		}
		this._initialized = true;
	}

	async mount(mountPoint: string, fs: $FileSystem): AsyncResult<void> {
		const parsedPath = $path.parse(mountPoint);
		const ret = await this.resolvePath(parsedPath.dirname);
		if (!ret.ok) {
			return ret;
		}

		const parent = ret.value;
		if (!parent.isDirectory()) {
			return err(ErrorCode.FileIsNotADirectory);
		}

		const childWrapper = new $FileNode(parsedPath.filename, fs);
		return await parent.addChild(childWrapper, parsedPath.basename);
	}

	async unmount(mountPoint: string): AsyncResult<void> {
		const parsedPath = $path.parse(mountPoint);
		const ret = await this.resolvePath(parsedPath.dirname);
		if (!ret.ok) {
			return ret;
		}

		return await ret.value.removeChild(parsedPath.filename);
	}

	async dirEntries(path: string): AsyncResult<string[]> {
		const ret = await this.resolvePath(path);
		if (!ret.ok) {
			return ret;
		}

		return ret.value.dirEntries();
	}

	async resolvePath(path: string): AsyncResult<$File> {
		if (path[0] !== '/') {
			return err(ErrorCode.NotAbsolutePath);
		}

		if (path === '/') {
			return ok(this._root);
		}

		let currentFile: $File = this._root;

		const parts = path.split('/');
		for (let i = 1; i < parts.length; i++) {
			if (!parts[i]) {
				return err(ErrorCode.InvalidPath);
			}

			const child = await currentFile.getChild(parts[i]);
			if (child.ok) {
				currentFile = child.value;
			} else {
				return err(child.error);
			}
		}

		return ok(currentFile);
	}

	async create(path: string): AsyncResult<$File> {
		const parsedPath = $path.parse(path);
		const ret = await this.resolvePath(parsedPath.dirname);
		if (!ret.ok) {
			return ret;
		}

		const parent = ret.value;
		if (!parent.isDirectory()) {
			return err(ErrorCode.FileIsNotADirectory);
		}

		// return await parent.createChild(parsedPath.basename);
	}

	async mkdir(path: string): AsyncResult<$File> {
		return err(ErrorCode.NotImplemented);
	}

	async rmdir(path: string): AsyncResult<void> {
		return err(ErrorCode.NotImplemented);
	}

	async link(target: string, linkPath: string): AsyncResult<void> {
		return err(ErrorCode.NotImplemented);
	}

	async unlink(path: string): AsyncResult<void> {
		return err(ErrorCode.NotImplemented);
	}

	async rename(oldPath: string, newPath: string): AsyncResult<void> {
		return err(ErrorCode.NotImplemented);
	}
}

export const $fs = new $FileSystemImpl();
