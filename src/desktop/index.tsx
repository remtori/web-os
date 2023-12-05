import { Accessor, Setter, createEffect, createSignal, onCleanup } from 'solid-js';
import Fa from 'solid-fa';
import { faMinus, faXmark, faExpand } from '@fortawesome/free-solid-svg-icons';
import { faWindowMaximize } from '@fortawesome/free-regular-svg-icons';

declare module 'solid-js' {
	namespace JSX {
		interface Directives {
			draggable: DirectiveDraggableOption;
			resizable: DirectiveResizableOption;
		}
	}
}

type DirectiveDraggableOption = {
	setX: Setter<number>;
	setY: Setter<number>;
};

function draggable(element: HTMLElement, accessor: Accessor<DirectiveDraggableOption>) {
	const { setX, setY } = accessor();
	let currX: number = 0;
	let currY: number = 0;

	function handleDragStart(e: PointerEvent) {
		if (e.target !== element) {
			return;
		}

		e.preventDefault();
		currX = e.clientX;
		currY = e.clientY;
		document.addEventListener('pointermove', handleDragMove);
		document.addEventListener('pointerup', handleDragEnd);
	}

	function handleDragMove(e: PointerEvent) {
		e.preventDefault();

		setX((x) => x + (e.clientX - currX));
		setY((y) => y + (e.clientY - currY));
		currX = e.clientX;
		currY = e.clientY;
	}

	function handleDragEnd(e: PointerEvent) {
		e.preventDefault();

		document.removeEventListener('pointermove', handleDragMove);
		document.removeEventListener('pointerup', handleDragEnd);
	}

	createEffect(() => {
		element.addEventListener('pointerdown', handleDragStart);

		onCleanup(() => {
			element.removeEventListener('pointerdown', handleDragStart);
		});
	});
}

type DirectiveResizableOption = {
	direction: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
	setX: Setter<number>;
	setY: Setter<number>;
	setWidth: Setter<number>;
	setHeight: Setter<number>;
};

function resizable(element: HTMLElement, accessor: Accessor<DirectiveResizableOption>) {
	const { setX, setY, setWidth, setHeight, direction } = accessor();

	let currX: number = 0;
	let currY: number = 0;

	function handleDragStart(e: PointerEvent) {
		if (e.target !== element) {
			return;
		}

		e.preventDefault();
		currX = e.clientX;
		currY = e.clientY;
		document.addEventListener('pointermove', handleDragMove);
		document.addEventListener('pointerup', handleDragEnd);
	}

	function handleDragMove(e: PointerEvent) {
		e.preventDefault();

		const movementX = e.clientX - currX;
		const movementY = e.clientY - currY;
		currX = e.clientX;
		currY = e.clientY;

		switch (direction) {
			case 'n':
				setY((y) => y + movementY);
				setHeight((h) => h - movementY);
				break;
			case 's':
				setHeight((h) => h + movementY);
				break;
			case 'w':
				setX((x) => x + movementX);
				setWidth((w) => w - movementX);
				break;
			case 'e':
				setWidth((w) => w + movementX);
				break;
			case 'nw':
				setX((x) => x + movementX);
				setY((y) => y + movementY);
				setHeight((h) => h - movementY);
				setWidth((w) => w - movementX);
				break;
			case 'ne':
				setY((y) => y + movementY);
				setHeight((h) => h - movementY);
				setWidth((w) => w + movementX);
				break;
			case 'sw':
				setX((x) => x + movementX);
				setHeight((h) => h + movementY);
				setWidth((w) => w - movementX);
				break;
			case 'se':
				setHeight((h) => h + movementY);
				setWidth((w) => w + movementX);
				break;
		}
	}

	function handleDragEnd(e: PointerEvent) {
		e.preventDefault();

		document.removeEventListener('pointermove', handleDragMove);
		document.removeEventListener('pointerup', handleDragEnd);
	}

	createEffect(() => {
		element.addEventListener('pointerdown', handleDragStart);

		onCleanup(() => {
			element.removeEventListener('pointerdown', handleDragStart);
		});
	});
}

function WindowWidget() {
	const [x, setX] = createSignal(100);
	const [y, setY] = createSignal(200);
	const [width, setWidth] = createSignal(400);
	const [height, setHeight] = createSignal(600);
	const [maximized, setMaximize] = createSignal(false);

	const windowContainer = (element: HTMLElement) => {
		createEffect(() => {
			element.style.setProperty('left', `${x()}px`);
			element.style.setProperty('top', `${y()}px`);
			element.style.setProperty('width', `${width()}px`);
			element.style.setProperty('height', `${height()}px`);
		});
	};

	// const windowMenuBar = (element: HTMLElement) => {
	// 	const removeHandler = draggable(element, setX, setY);
	// };

	return (
		<div ref={windowContainer} class='absolute shadow-lg flex flex-col justify-start items-center'>
			<div
				use:draggable={{ setX, setY }}
				class='rounded-t-sm h-8 w-full bg-black opacity-80 flex flex-row justify-between items-center'
			>
				<div class='text-white p-2'>App icon</div>
				<div class='flex flex-row'>
					<button class='appearance-none bg-transparent border-none text-white p-2 hover:bg-gray-400 hover:bg-opacity-60'>
						<Fa fw icon={faMinus} />
					</button>
					<button
						class='appearance-none bg-transparent border-none text-white p-2 hover:bg-gray-400 hover:bg-opacity-60'
						onClick={() => setMaximize(!maximized())}
					>
						<Fa fw icon={maximized() ? faWindowMaximize : faExpand} />
					</button>
					<button class='appearance-none bg-transparent border-none text-white p-2 hover:bg-red-800'>
						<Fa fw scale={1.4} icon={faXmark} />
					</button>
				</div>
			</div>
			<div class='rounded-b-md w-full bg-white opacity-80 flex flex-grow flex-col'>
				<h1 class='text-2xl font-bold text-center'>SolidJS</h1>
				<p class='text-center'>Hello World!</p>
			</div>

			<div
				use:resizable={{ setX, setY, setWidth, setHeight, direction: 'e' }}
				class='absolute bg-transparent right-0 bottom-0 w-1 h-full cursor-e-resize'
			/>
			<div
				use:resizable={{ setX, setY, setWidth, setHeight, direction: 'w' }}
				class='absolute bg-transparent left-0 bottom-0 w-1 h-full cursor-w-resize'
			/>
			<div
				use:resizable={{ setX, setY, setWidth, setHeight, direction: 's' }}
				class='absolute bg-transparent right-0 bottom-0 w-full h-1 cursor-s-resize'
			/>
			<div
				use:resizable={{ setX, setY, setWidth, setHeight, direction: 'n' }}
				class='absolute bg-transparent right-0 top-0 w-full h-1 cursor-n-resize'
			/>
			<div
				use:resizable={{ setX, setY, setWidth, setHeight, direction: 'ne' }}
				class='absolute bg-transparent z-10 -right-1 -top-1 w-2 h-2 cursor-ne-resize'
			/>
			<div
				use:resizable={{ setX, setY, setWidth, setHeight, direction: 'nw' }}
				class='absolute bg-transparent z-10 -left-1 -top-1 w-2 h-2 cursor-nw-resize'
			/>
			<div
				use:resizable={{ setX, setY, setWidth, setHeight, direction: 'sw' }}
				class='absolute bg-transparent z-10 -left-1 -bottom-1 w-2 h-2 cursor-sw-resize'
			/>
			<div
				use:resizable={{ setX, setY, setWidth, setHeight, direction: 'se' }}
				class='absolute bg-transparent z-10 -right-1 -bottom-1 w-2 h-2 cursor-se-resize'
			/>
		</div>
	);
}

export function App() {
	return (
		<div class='select-none bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 backdrop-blur-md h-screen w-screen flex flex-col'>
			<div class='flex flex-grow'>
				<WindowWidget />
			</div>
			<div class='h-12 bg-white bg-opacity-50 flex justify-center flex-row'>
				<div class='flex justify-center items-center p-2'>
					<div class='w-10 h-10 bg-gray-300 rounded-full'></div>
				</div>
			</div>
		</div>
	);
}
