import EventEmitter from 'eventemitter3';
import { Component, createSignal, onCleanup } from 'solid-js';

import { WindowInitProps } from '@/components/WindowWidget';

type ComponentLoader = () => Promise<Component> | Component;

export type AppMeta = WindowInitProps & {};

export type App = {
	id: string;
	meta: AppMeta;
	component: ComponentLoader;
};

type AppRegistryEvents = {
	change: () => void;
};

class AppRegistryClass extends EventEmitter<AppRegistryEvents> {
	private apps: Map<string, App> = new Map();

	register(id: string, component: ComponentLoader, meta: AppMeta) {
		this.apps.set(id, { id, meta, component });
		this.emit('change');
	}

	allRegisteredApps() {
		return Array.from(this.apps.values());
	}
}

export const AppRegistry = new AppRegistryClass();

export const useAppRegistry = () => {
	const [apps, setApps] = createSignal<App[]>(
		AppRegistry.allRegisteredApps(),
	);

	const onChange = () => {
		setApps(AppRegistry.allRegisteredApps());
	};

	AppRegistry.on('change', onChange);
	onCleanup(() => AppRegistry.off('change', onChange));

	return {
		apps,
	};
};
