import { registry } from '@/registry';

import { FileExplorer } from './FileExplorer';

registry.register('explorer', {
	props: {
		title: 'File Explorer',
	},
	component: () => FileExplorer,
});
