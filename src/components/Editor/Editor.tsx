import { faFont, faImage, faLink } from '@deps/fontawesome/fa-regular';
import { baseKeymap } from 'prosemirror-commands';
import { gapCursor } from 'prosemirror-gapcursor';
import { history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { schema } from 'prosemirror-schema-basic';
import { EditorState, Plugin, TextSelection } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import Fa from 'solid-fa';
import { Component, Match, Switch, createSignal, onMount } from 'solid-js';
import { Btn } from '../Btn';
import { PlusCircle } from '../icons/plus-circle';
import { UndoRedoPair } from './Buttons';
import { EditorProvider, useEditor } from './EditorProvider';
import { TextStyleMenu } from './TextStyleMenu';

import 'prosemirror-view/style/prosemirror.css';
import './styles.css';

const EditorInner: Component = (props) => {
	const editor = useEditor();

	let editorRef: HTMLDivElement | undefined;
	let bottomMenuRef: HTMLDivElement | undefined;

	onMount(() => {
		editor.mount(editorRef!);

		if (/iP(hone|od|ad)/.exec(navigator.userAgent)) {
			const initHeight = window.visualViewport!.height;
			window.visualViewport!.addEventListener('resize', () => {
				bottomMenuRef!.style.marginBottom = `${initHeight - window.visualViewport!.height}px`;
			});
		}
	});

	const [openTextStyleMenu, setOpenTextStyleMenu] = createSignal(false);

	return (
		<div class="group flex w-full grow flex-col pl-2 pr-2 md:pr-4">
			<div ref={editorRef}></div>
			<div class="group-focus-within:pt-10"></div>
			<div
				ref={bottomMenuRef}
				class="fixed bottom-0 left-0 right-0 flex w-full flex-col"
			>
				<UndoRedoPair />
				<div class="w-100 flex flex-col shadow-t-sm shadow-gray-300">
					<Switch>
						<Match when={!openTextStyleMenu()}>
							<div class="flex h-8 flex-row items-center px-2">
								<Btn
									onclick={() => setOpenTextStyleMenu(true)}
									class="p-2"
								>
									<Fa icon={faFont} />
								</Btn>
								<Btn class="p-2">
									<Fa icon={faImage} />
								</Btn>
								<Btn class="p-2">
									<Fa icon={faLink} />
								</Btn>
								<Btn class="p-2">
									<PlusCircle />
								</Btn>
							</div>
						</Match>
						<Match when={openTextStyleMenu()}>
							<TextStyleMenu
								back={() => setOpenTextStyleMenu(false)}
							/>
						</Match>
					</Switch>
				</div>
			</div>
		</div>
	);
};

export const Editor = () => {
	const editorState = EditorState.create({
		schema,
		plugins: [
			gapCursor(),
			history(),
			keymap(baseKeymap),
			placeholderPlugin('Please enter text'),
		],
	});

	return (
		<EditorProvider state={editorState}>
			<EditorInner />
		</EditorProvider>
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
