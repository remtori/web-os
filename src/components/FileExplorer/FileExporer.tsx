import { VFS } from '@/kernel';
import { Component } from 'solid-js';

export const FileExplorer: Component = () => {
	(window as any).VFS = VFS;

	return (
		<div>
			FileExplorer
			<div>FileExplorer</div>
		</div>
	);
};
