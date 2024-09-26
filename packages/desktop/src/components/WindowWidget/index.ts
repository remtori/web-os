import { Component } from 'solid-js';

import { WindowInitProps } from './WindowWidget';

export { useWindowControl } from './control';
export type { WindowControl } from './control';

export { WindowWidget } from './WindowWidget';
export type { WindowInitProps } from './WindowWidget';

export type ComponentLoader = () => Promise<Component> | Component;

export type AnyWindow = {
	props: WindowInitProps;
	component: ComponentLoader;
};
