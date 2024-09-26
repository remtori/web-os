import { Component, For } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { useWindowServer } from './window-server-registry';

export const WindowServer: Component = () => {
	const windows = useWindowServer((state) => state.runningWindows);

	return (
		<div class="relative flex h-full w-full">
			<For each={windows()}>
				{(window) => <Dynamic component={window.component} />}
			</For>
		</div>
	);
};
