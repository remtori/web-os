import { Accessor, Setter, createContext, useContext } from 'solid-js';

type Fn = () => void;

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
	close: Fn;
};

export const WindowControlContext = createContext<WindowControl>();

export const useWindowControl = (): WindowControl => {
	const control = useContext(WindowControlContext);
	if (!control) {
		throw new Error('useWindowControl must be used within a WindowWidget');
	}

	return control;
};
