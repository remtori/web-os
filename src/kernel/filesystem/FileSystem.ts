import { SyncOrAsyncResult } from '@kernel/core';
import { $Custody } from './Custody';
import { $File } from './File';

export interface $FileSystem {
	initialize(): SyncOrAsyncResult<void>;

	root(): $File;
	lookup?(base: $Custody, path: string): SyncOrAsyncResult<$File | undefined>;
}
