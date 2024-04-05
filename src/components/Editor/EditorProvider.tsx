import EventEmitter from 'eventemitter3';
import { Command, EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { ParentComponent, createContext, useContext } from 'solid-js';

export class EditorViewRef extends EventEmitter<{
	beforeTransaction: [EditorState];
	afterTransaction: [EditorState];
}> {
	private view?: EditorView;
	private initialState: EditorState;

	constructor(state: EditorState) {
		super();
		this.initialState = state;
	}

	mount(element: HTMLElement) {
		const self = this;
		this.view = new EditorView(
			{ mount: element },
			{
				state: this.initialState,
				dispatchTransaction(tr) {
					self.emit('beforeTransaction', this.state);
					self.view!.updateState(this.state.apply(tr));
					self.emit('afterTransaction', this.state);
				},
			},
		);

		this.view.focus();
	}

	exec(command: Command) {
		return command(this.view!.state, this.view!.dispatch);
	}
}

const EditorContext = createContext<EditorViewRef>();

export const EditorProvider: ParentComponent<{ state: EditorState }> = (
	props,
) => {
	const editor = new EditorViewRef(props.state);

	return (
		<EditorContext.Provider value={editor}>
			{props.children}
		</EditorContext.Provider>
	);
};

export const useEditor = (): EditorViewRef => useContext(EditorContext)!;
