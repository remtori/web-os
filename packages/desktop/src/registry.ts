import { Component } from 'solid-js';

import { WindowInitProps } from '@/components/WindowWidget';

import { createSignalStore } from './the-store';

type ComponentLoader = () => Promise<Component> | Component;

export type AppMeta = WindowInitProps & {};

export type App = {
	id: string;
	meta: AppMeta;
	component: ComponentLoader;
};

type AppRegistry = {
	apps: Record<string, App>;
	register: (id: string, component: ComponentLoader, meta: AppMeta) => void;
};

export const useAppRegistry = createSignalStore<AppRegistry>((set) => ({
	apps: {},
	register: (id, component, meta) =>
		set((state) => ({
			apps: {
				...state.apps,
				[id]: { id, meta, component },
			},
		})),
}));

export const registry = useAppRegistry.getInitialState();
