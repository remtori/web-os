import { ValidComponent, lazy } from 'solid-js';

import { App } from '@/registry';
import { createSignalStore } from '@/the-store';

import { AnyWindow, WindowWidget } from '../WindowWidget';

export type RunningWindow = {
	id: string;
	component: ValidComponent;
};

type WindowServerRegistry = {
	runningWindows: RunningWindow[];
	create: (window: AnyWindow, prefix?: string) => string;
	close: (id: string) => void;
};

export const useWindowServer = createSignalStore<WindowServerRegistry>(
	(set) => ({
		runningWindows: [],
		pendingSpawns: [],
		create(window, prefix = 'unknown') {
			const id = `${prefix}-${Date.now() % 100_000}`;
			const WindowComponent = lazy(() =>
				Promise.resolve(window.component()).then((c) => ({
					default: c,
				})),
			);

			set((state) => ({
				...state,
				runningWindows: [
					...state.runningWindows,
					{
						id,
						component: () => (
							<WindowWidget id={id} init={/*@once*/ window.props}>
								<WindowComponent />
							</WindowWidget>
						),
					},
				],
			}));

			return id;
		},
		close(id: string) {
			set((state) => ({
				runningWindows: state.runningWindows.filter(
					(window) => window.id !== id,
				),
			}));
		},
	}),
);

export const windowServer: Pick<WindowServerRegistry, 'create' | 'close'> =
	useWindowServer.getInitialState();
