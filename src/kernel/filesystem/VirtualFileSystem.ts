import { AsyncResult, ErrorCode, err } from '@kernel/core';
import { $RamFS } from './$RamFS';
import { $WebStorageFS } from './$WebStorageFS';
import { $Custody } from './Custody';
import { $File } from './File';
import { $FileSystem } from './FileSystem';

class $VirtualFileSystem {
	private _root!: $Custody;
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

		const ret = await this.mount('/tmp', new $RamFS());
		if (!ret.ok) {
			console.error(`Failed to mount /tmp: ${ret.error}`);
		}
		this._initialized = true;
	}

	ready(): Promise<void> {
		return this._readyPromise;
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
		path: string,
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
