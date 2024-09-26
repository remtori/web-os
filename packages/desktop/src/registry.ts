import { AnyWindow } from '@/components/WindowWidget';

import { createSignalStore } from './the-store';

export type AppMeta = {};

export type App = {
	id: string;
	meta: AppMeta;
	defaultWindow: AnyWindow;
};

type AppRegistry = {
	apps: Record<string, App>;
	register: (id: string, defaultWindow: AnyWindow) => void;
};

export const useAppRegistry = createSignalStore<AppRegistry>((set) => ({
	apps: {},
	register: (id, defaultWindow) =>
		set((state) => ({
			apps: {
				...state.apps,
				[id]: {
					id,
					meta: {},
					defaultWindow,
				},
			},
		})),
}));

export const registry = useAppRegistry.getInitialState();
