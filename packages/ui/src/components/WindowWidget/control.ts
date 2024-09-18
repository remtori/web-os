import { Accessor, createContext, Setter, useContext } from 'solid-js';

export type WindowControl = {
	title: Accessor<string>;
	setTitle: Setter<string>;
	x: Accessor<number>;
	setX: Setter<number>;
	y: Accessor<number>;
	setY: Setter<number>;
	width: Accessor<number>;
	setWidth: Setter<number>;
	height: Accessor<number>;
	setHeight: Setter<number>;
	maximized: Accessor<boolean>;
	setMaximized: Setter<boolean>;
};

export type WindowInitProps = {
	title?: string;
	x?: number;
	y?: number;
	width?: number;
	height?: number;
	maximized?: boolean;
};

export const WindowControlContext = createContext<WindowControl>();

export const useWindowControl = (
	initProps?: WindowInitProps,
): WindowControl => {
	const control = useContext(WindowControlContext);
	if (!control) {
		throw new Error('useWindowControl must be used within a WindowWidget');
	}

	if (!initProps) {
		return control;
	}

	if (typeof initProps.title === 'string') {
		control.setTitle(initProps.title);
	}

	if (typeof initProps.x === 'number') {
		control.setX(initProps.x);
	}

	if (typeof initProps.y === 'number') {
		control.setY(initProps.y);
	}

	if (typeof initProps.width === 'number') {
		control.setWidth(initProps.width);
	}

	if (typeof initProps.height === 'number') {
		control.setHeight(initProps.height);
	}

	if (typeof initProps.maximized === 'boolean') {
		control.setMaximized(initProps.maximized);
	}

	return control;
};
