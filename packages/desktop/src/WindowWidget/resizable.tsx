import {
	Accessor,
	Component,
	Setter,
	batch,
	createEffect,
	onCleanup,
} from 'solid-js';

declare module 'solid-js' {
	namespace JSX {
		interface Directives {
			resizable: DirectiveResizableOption;
		}
	}
}

export type DirectiveResizableOption = {
	direction: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
	setX: Setter<number>;
	setY: Setter<number>;
	setWidth: Setter<number>;
	setHeight: Setter<number>;
};

export function resizable(
	element: HTMLElement,
	accessor: Accessor<DirectiveResizableOption>,
) {
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

		batch(() => {
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
		});
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

export const ResizableControl: Component<{
	setX: Setter<number>;
	setY: Setter<number>;
	setWidth: Setter<number>;
	setHeight: Setter<number>;
}> = (props) => {
	return (
		<>
			<div
				use:resizable={{
					setX: props.setX,
					setY: props.setY,
					setWidth: props.setWidth,
					setHeight: props.setHeight,
					direction: 'e',
				}}
				class="absolute bottom-0 right-0 h-full w-1 cursor-e-resize bg-transparent"
			/>
			<div
				use:resizable={{
					setX: props.setX,
					setY: props.setY,
					setWidth: props.setWidth,
					setHeight: props.setHeight,
					direction: 'w',
				}}
				class="absolute bottom-0 left-0 h-full w-1 cursor-w-resize bg-transparent"
			/>
			<div
				use:resizable={{
					setX: props.setX,
					setY: props.setY,
					setWidth: props.setWidth,
					setHeight: props.setHeight,
					direction: 's',
				}}
				class="absolute bottom-0 right-0 h-1 w-full cursor-s-resize bg-transparent"
			/>
			<div
				use:resizable={{
					setX: props.setX,
					setY: props.setY,
					setWidth: props.setWidth,
					setHeight: props.setHeight,
					direction: 'n',
				}}
				class="absolute right-0 top-0 h-1 w-full cursor-n-resize bg-transparent"
			/>
			<div
				use:resizable={{
					setX: props.setX,
					setY: props.setY,
					setWidth: props.setWidth,
					setHeight: props.setHeight,
					direction: 'ne',
				}}
				class="absolute -right-1 -top-1 z-10 h-2 w-2 cursor-ne-resize bg-transparent"
			/>
			<div
				use:resizable={{
					setX: props.setX,
					setY: props.setY,
					setWidth: props.setWidth,
					setHeight: props.setHeight,
					direction: 'nw',
				}}
				class="absolute -left-1 -top-1 z-10 h-2 w-2 cursor-nw-resize bg-transparent"
			/>
			<div
				use:resizable={{
					setX: props.setX,
					setY: props.setY,
					setWidth: props.setWidth,
					setHeight: props.setHeight,
					direction: 'sw',
				}}
				class="absolute -bottom-1 -left-1 z-10 h-2 w-2 cursor-sw-resize bg-transparent"
			/>
			<div
				use:resizable={{
					setX: props.setX,
					setY: props.setY,
					setWidth: props.setWidth,
					setHeight: props.setHeight,
					direction: 'se',
				}}
				class="absolute -bottom-1 -right-1 z-10 h-2 w-2 cursor-se-resize bg-transparent"
			/>
		</>
	);
};
