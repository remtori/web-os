import { AsyncResult, ErrorCode, err, ok } from '@core/result';
import { $FileSystem } from './FileSystem';
import { $File, $FileDescriptor, $SimpleFile } from './File';
import { $RamFS } from './RamFS';
import { $path } from '@core/path';
import { $Custody } from './Custody';
import { $WebStorageFS } from './WebStorageFS';

class $VirtualFileSystem {
	private _root: $Custody | undefined;
	private _initialized: boolean;
	private _readyPromise: Promise<void>;

	private _tmpFs = new $RamFS();
	private _rootFs = new $WebStorageFS();

	constructor() {
		this._initialized = false;
		this._readyPromise = this.initialize();
	}

	private async initialize() {
		await this._tmpFs.initialize();
		await this._rootFs.initialize();

		this._root = new $Custody(undefined, this._rootFs.root());

		let ret = await this.mount('/tmp', new $RamFS());
		if (!ret.ok) {
			console.error(`Failed to mount /tmp: ${ret.error}`);
		}
		this._initialized = true;
	}

	async mount(mountPoint: string, fs: $FileSystem): AsyncResult<void> {
		return err(ErrorCode.NotImplemented);
	}

	async unmount(mountPoint: string): AsyncResult<void> {
		return err(ErrorCode.NotImplemented);
	}

	async dirEntries(path: string): AsyncResult<string[]> {
		return err(ErrorCode.NotImplemented);
	}

	async resolvePath(
		base: $Custody,
		path: string
	): AsyncResult<{
		parent: $Custody | undefined;
		custody: $Custody | undefined;
	}> {
		return err(ErrorCode.NotImplemented);
	}

	async create(base: $Custody, path: string): AsyncResult<$File> {
		return err(ErrorCode.NotImplemented);
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

export const VFS = new $VirtualFileSystem();
