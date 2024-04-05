import { redo, redoDepth, undo, undoDepth } from 'prosemirror-history';
import { Command } from 'prosemirror-state';
import { Component, ParentComponent, createSignal } from 'solid-js';
import { ArrowUTurnLeftIcon } from '../icons/arrow-uturn-left';
import { ArrowUTurnRightIcon } from '../icons/arrow-uturn-right';
import { useEditor } from './EditorProvider';

export const CommandBtn: ParentComponent<{
	command: Command;
	disabled?: () => boolean;
	class?: string;
}> = (props) => {
	const editor = useEditor();

	const handleMouseDown = (e: Event) => {
		e.preventDefault();
		editor.exec(props.command);
	};

	return (
		<button
			class={props.class}
			disabled={props.disabled?.()}
			onmousedown={handleMouseDown}
		>
			{props.children}
		</button>
	);
};

export const UndoRedoPair: Component = (props) => {
	const editor = useEditor();
	const [noMoreUndo, setNoMoreUndo] = createSignal(true);
	const [noMoreRedo, setNoMoreRedo] = createSignal(true);

	editor.on('afterTransaction', (state) => {
		setNoMoreUndo(undoDepth(state) === 0);
		setNoMoreRedo(redoDepth(state) === 0);
	});

	return (
		<div class="mb-4 mr-2 flex w-min flex-row self-end rounded-lg text-white shadow-sm shadow-gray-300">
			<CommandBtn
				class="rounded-l-lg border-r border-gray-400 bg-slate-700 p-1 text-white disabled:text-gray-500"
				disabled={noMoreUndo}
				command={undo}
			>
				<ArrowUTurnLeftIcon />
			</CommandBtn>
			<CommandBtn
				class="rounded-r-lg bg-slate-700 p-1 text-white disabled:text-gray-500"
				disabled={noMoreRedo}
				command={redo}
			>
				<ArrowUTurnRightIcon />
			</CommandBtn>
		</div>
	);
};
