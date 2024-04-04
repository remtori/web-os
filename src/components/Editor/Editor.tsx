import { Component, createSignal, onMount, onCleanup } from 'solid-js';
import { EditorState, Plugin, TextSelection } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { Schema, DOMParser } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { gapCursor } from 'prosemirror-gapcursor';
import { history } from 'prosemirror-history';
import { toggleMark, baseKeymap } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { PhotoIcon } from '../icons/photo';
import 'prosemirror-view/style/prosemirror.css';
import './styles.css';
import { ArrowUTurnLeftIcon } from '../icons/arrow-uturn-left';
import { ArrowUTurnRightIcon } from '../icons/arrow-uturn-right';

const mySchema = new Schema({
	nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
	marks: schema.spec.marks,
});

export const Editor: Component = (props) => {
	let editorRef: HTMLDivElement | undefined;
	let editorView: EditorView;
	let bottomMenuRef: HTMLDivElement | undefined;

	onMount(() => {
		editorView = new EditorView(
			{ mount: editorRef! },
			{
				state: EditorState.create({
					schema: mySchema,
					plugins: [
						gapCursor(),
						history(),
						keymap(baseKeymap),
						placeholderPlugin('Please enter text'),
					],
				}),
			},
		);

		editorView.focus();

		if (/iP(hone|od|ad)/.exec(navigator.userAgent)) {
			const initHeight = window.visualViewport!.height;
			window.visualViewport!.addEventListener('resize', () => {
				bottomMenuRef!.style.marginBottom = `${initHeight - window.visualViewport!.height}px`;
			});
		}
	});

	return (
		<div
			// oncontextmenu={(e) => e.preventDefault()}
			class="flex min-h-screen w-screen flex-col"
		>
			<div class="flex flex-row items-center p-2 text-sm">
				<button class="flex flex-row items-center">
					<PhotoIcon />
					Add Cover
				</button>
			</div>
			<div class="group my-1 flex flex-col px-2 text-xl">
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
				<div class="-mt-[1px] w-0 border-b border-green-600 transition-all duration-500 ease-in-out group-focus-within:w-full"></div>
			</div>
			<div class="group flex w-full grow flex-col pl-2 pr-2 md:pr-4">
				<div ref={editorRef}></div>
				<div class="group-focus-within:pt-10"></div>
				<div
					ref={bottomMenuRef}
					class="fixed bottom-0 left-0 right-0 flex w-full flex-col"
				>
					<div class="mb-4 mr-2 flex w-min flex-row self-end text-white ">
						<button class="rounded-l-lg border-r border-gray-400 bg-slate-700 p-1 active:bg-slate-900">
							<ArrowUTurnLeftIcon />
						</button>
						<button class="rounded-r-lg bg-slate-700 p-1 active:bg-slate-900">
							<ArrowUTurnRightIcon />
						</button>
					</div>
					<div class="w-100 h-8 bg-gray-200"></div>
				</div>
			</div>
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

					state.tr.setSelection(TextSelection.create(state.doc, 0));
					return DecorationSet.create(doc, [
						Decoration.widget(1, span),
					]);
				}
			},
		},
	});
}
