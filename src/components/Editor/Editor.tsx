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
		<div class="flex flex-col">
			<div class="flex flex-row">
				<a>Add Cover</a>
			</div>
			<input
				type="text"
				class="placeholder-gray-400"
				placeholder="Please enter title (required)"
			/>
			<div class="flex flex-row" ref={editorRef}></div>
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
