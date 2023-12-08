import { Result, ok, err, AsyncResult } from '@core/result';
import { $File } from './File';

export interface $FileSystem {
	initialize(): AsyncResult<void>;

	root(): $File;

	lookup?(path: string): AsyncResult<$File | undefined>;
	mkdir(base: $File, name: string): AsyncResult<void>;
	create(base: $File, name: string): AsyncResult<$File>;
}
