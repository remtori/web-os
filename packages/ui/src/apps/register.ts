import { registry } from '@/registry';

import { FileExplorer } from './FileExplorer';

registry.register('explorer', () => FileExplorer, {
	title: 'File Explorer',
});
