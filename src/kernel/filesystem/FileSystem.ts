import { AsyncResult } from '@core/result';
import { $File } from './File';
import { $Custody } from './Custody';

export interface $FileSystem {
	initialize(): AsyncResult<void>;

	root(): $File;
	lookup?(base: $Custody, path: string): AsyncResult<$File | undefined>;
}
