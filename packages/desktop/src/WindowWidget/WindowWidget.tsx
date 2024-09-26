import { faWindowMaximize } from '@faw/fa-regular';
import { faExpand, faMinus, faXmark } from '@faw/fa-solid';
import Fa from 'solid-fa';
import { Component, JSX, createEffect, createSignal } from 'solid-js';

import { $WindowServer } from '@/WindowServer';

import { WindowControl, WindowControlContext } from './control';
import { draggable } from './draggable';
import { ResizableControl } from './resizable';

// solid-js use: directive doesnt work well with typescript
// so we have to do this to preserve the import.
draggable;

export type WindowInitProps = {
	title?: string;
	x?: number;
	y?: number;
	width?: number;
	height?: number;
	maximized?: boolean;
	icon?: string;
};

export const WindowWidget: Component<{
	id: string;
	init?: WindowInitProps;
	children: JSX.Element;
}> = (props) => {
	const [title, setTitle] = createSignal(props.init?.title || 'Untitled');
	const [x, setX] = createSignal(
		props.init?.x || Math.round(window.innerWidth * 0.05),
	);
	const [y, setY] = createSignal(
		props.init?.y || Math.round(window.innerHeight * 0.2),
	);
	const [width, setWidth] = createSignal(
		props.init?.width || Math.round(window.innerWidth * 0.5),
	);
	const [height, setHeight] = createSignal(
		props.init?.height || Math.round(window.innerHeight * 0.5),
	);
	const [maximized, setMaximized] = createSignal(
		Boolean(props.init?.maximized),
	);

	const windowContainer = (element: HTMLElement) => {
		createEffect(() => {
			if (maximized()) {
				element.style.setProperty('left', '0px');
				element.style.setProperty('top', '0px');
				element.style.setProperty('bottom', '0px');
				element.style.setProperty('right', '0px');
				element.style.setProperty('width', null);
				element.style.setProperty('height', null);
			} else {
				element.style.setProperty('left', `${x()}px`);
				element.style.setProperty('top', `${y()}px`);
				element.style.setProperty('bottom', null);
				element.style.setProperty('right', null);
				element.style.setProperty('width', `${width()}px`);
				element.style.setProperty('height', `${height()}px`);
			}
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
		close: () => $WindowServer.close(props.id),
	};

	return (
		<div
			ref={windowContainer}
			class="absolute flex flex-col items-center justify-start shadow-lg"
		>
			<div
				use:draggable={{ setX, setY }}
				class="flex h-8 w-full flex-row items-center justify-between rounded-t-sm bg-black"
			>
				<div class="p-2 text-white">{title()}</div>
				<div class="flex flex-row">
					<button class="appearance-none border-none bg-transparent p-2 text-white hover:bg-gray-400 hover:bg-opacity-60">
						<Fa fw icon={faMinus} />
					</button>
					<button
						class="appearance-none border-none bg-transparent p-2 text-white hover:bg-gray-400 hover:bg-opacity-60"
						onClick={() => setMaximized((v) => !v)}
					>
						<Fa
							fw
							icon={maximized() ? faWindowMaximize : faExpand}
						/>
					</button>
					<button
						class="appearance-none border-none bg-transparent p-2 text-white hover:bg-red-800"
						onClick={control.close}
					>
						<Fa fw scale={1.4} icon={faXmark} />
					</button>
				</div>
			</div>
			<div class="flex w-full flex-grow flex-col overflow-hidden bg-white">
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
