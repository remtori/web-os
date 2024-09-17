import { JSX } from 'solid-js';

export type App = {
	component: () => Promise<JSX.Element> | JSX.Element;
};

class AppRegistry {
	private apps: Map<string, App> = new Map();
}
