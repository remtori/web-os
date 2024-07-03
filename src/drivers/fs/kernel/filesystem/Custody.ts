import { $File } from './File';

export class $Custody {
	private _parent: $Custody | undefined;
	private _file: $File;

	constructor(parent: $Custody | undefined, file: $File) {
		this._parent = parent;
		this._file = file;
	}

	parent(): $Custody | undefined {
		return this._parent;
	}

	file(): $File {
		return this._file;
	}

	absolutePath(): string {
		if (!this._parent) {
			return '/';
		}

		return this._parent.absolutePath() + '/' + this._file.name();
	}
}
