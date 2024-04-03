import { Component } from 'solid-js';
import { onMount, onCleanup } from 'solid-js';
import { EditorState, Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { Schema, DOMParser } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { gapCursor } from 'prosemirror-gapcursor';
import { history } from 'prosemirror-history';
import { toggleMark } from 'prosemirror-commands';
import { menuBar, MenuElement, undoItem, redoItem } from 'prosemirror-menu';
import 'prosemirror-view/style/prosemirror.css';
import { PhotoIcon } from '../icons/photo';

const mySchema = new Schema({
	nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
	marks: schema.spec.marks,
});

export const Editor: Component = (props) => {
	let editorRef: HTMLDivElement | undefined;
	let editorView: EditorView;

	onMount(() => {
		editorView = new EditorView(editorRef!, {
			state: EditorState.create({
				schema: mySchema,
				plugins: [
					gapCursor(),
					history(),
					// menuBar({
					// 	floating: false,
					// 	content: [[undoItem, redoItem]],
					// }),
					placeholderPlugin('Please enter text'),
				],
			}),
		});

		editorView.focus();

		(window as any).view = editorView;
	});

	return (
		<div class="flex flex-col p-2">
			<div class="flex flex-row items-center text-sm">
				<PhotoIcon />
				<span class="w-1"></span>
				<a>Add Cover</a>
			</div>
			<div class="group my-3 flex flex-col text-xl">
				<input
					type="text"
					class="box-border w-full placeholder-gray-400 caret-green-600 placeholder:font-bold focus:outline-none"
					placeholder="Please enter title (required)"
				/>
				<div
					class="h-3 self-end text-xs text-gray-400"
					style={{ 'line-height': '12px' }}
				>
					<span class="hidden group-focus-within:block">0/200</span>
				</div>
				<div class="m-0 w-full border-b border-gray-300"></div>
				<div class="-mt-[1px] w-0 border-b border-green-600 transition-all duration-300 ease-in-out group-focus-within:w-full"></div>
			</div>
			<div class="flex flex-row focus:outline-none" ref={editorRef}></div>
		</div>
	);
};

function placeholderPlugin(text: string) {
	return new Plugin({
		props: {
			decorations(state: EditorState) {
				let doc = state.doc;
				if (
					doc.childCount == 1 &&
					doc.firstChild &&
					doc.firstChild.isTextblock &&
					doc.firstChild.content.size == 0
				) {
					const span = document.createElement('span');
					span.textContent = text;
					span.className = 'text-gray-400';

					return DecorationSet.create(doc, [
						Decoration.widget(1, span),
					]);
				}
			},
		},
	});
}
