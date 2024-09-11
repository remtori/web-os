import { faWindowMaximize } from '@deps/fontawesome/fa-regular';
import { faExpand, faMinus, faXmark } from '@deps/fontawesome/fa-solid';
import Fa from 'solid-fa';
import {
	Accessor,
	Component,
	createContext,
	createEffect,
	createSignal,
	JSX,
	Setter,
	useContext,
} from 'solid-js';
import { draggable } from './draggable';
import { ResizableControl } from './resizable';

// solid-js use: directive doesnt work well with typescript
// so we have to do this to preserve the import.
draggable;

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

const WindowControlContext = createContext<WindowControl>();

export const useWindowControl = () => useContext(WindowControlContext)!;

export const WindowWidget: Component<{
	children: JSX.Element;
}> = (props) => {
	const [title, setTitle] = createSignal('Untitled');
	const [x, setX] = createSignal(100);
	const [y, setY] = createSignal(200);
	const [width, setWidth] = createSignal(400);
	const [height, setHeight] = createSignal(600);
	const [maximized, setMaximized] = createSignal(false);

	const windowContainer = (element: HTMLElement) => {
		createEffect(() => {
			element.style.setProperty('left', `${x()}px`);
			element.style.setProperty('top', `${y()}px`);
			element.style.setProperty('width', `${width()}px`);
			element.style.setProperty('height', `${height()}px`);
		});
	};

	const control: WindowControl = {
		title,
		setTitle,
		width,
		setWidth,
		height,
		setHeight,
		x,
		setX,
		y,
		setY,
		maximized,
		setMaximized,
	};

	return (
		<div
			ref={windowContainer}
			class="absolute shadow-lg flex flex-col justify-start items-center"
		>
			<div
				use:draggable={{ setX, setY }}
				class="rounded-t-sm h-8 w-full bg-black opacity-80 flex flex-row justify-between items-center"
			>
				<div class="text-white p-2">{title()}</div>
				<div class="flex flex-row">
					<button class="appearance-none bg-transparent border-none text-white p-2 hover:bg-gray-400 hover:bg-opacity-60">
						<Fa fw icon={faMinus} />
					</button>
					<button
						class="appearance-none bg-transparent border-none text-white p-2 hover:bg-gray-400 hover:bg-opacity-60"
						onClick={() => setMaximized((v) => !v)}
					>
						<Fa
							fw
							icon={maximized() ? faWindowMaximize : faExpand}
						/>
					</button>
					<button class="appearance-none bg-transparent border-none text-white p-2 hover:bg-red-800">
						<Fa fw scale={1.4} icon={faXmark} />
					</button>
				</div>
			</div>
			<div class="rounded-b-md w-full bg-white opacity-90 flex flex-grow flex-col overflow-hidden">
				<WindowControlContext.Provider value={control}>
					{props.children}
				</WindowControlContext.Provider>
			</div>
			<ResizableControl
				setX={setX}
				setY={setY}
				setWidth={setWidth}
				setHeight={setHeight}
			/>
		</div>
	);
};
