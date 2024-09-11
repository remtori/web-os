import { Accessor, Setter, batch, createEffect, onCleanup } from 'solid-js';

declare module 'solid-js' {
	namespace JSX {
		interface Directives {
			draggable: DirectiveDraggableOption;
		}
	}
}

export type DirectiveDraggableOption = {
	setX: Setter<number>;
	setY: Setter<number>;
};

export function draggable(
	element: HTMLElement,
	accessor: Accessor<DirectiveDraggableOption>,
) {
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

		const movementX = e.clientX - currX;
		const movementY = e.clientY - currY;
		currX = e.clientX;
		currY = e.clientY;

		batch(() => {
			setX((x) => x + movementX);
			setY((y) => y + movementY);
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
