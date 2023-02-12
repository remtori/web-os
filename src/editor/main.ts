import { editor, KeyCode, KeyMod, languages } from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution';
import 'monaco-editor/esm/vs/basic-languages/monaco.contribution';
import 'monaco-editor/esm/vs/editor/edcore.main';
import { JsExecutor } from '../runtime/executor';
import libRuntimeSource from '../platform/env.d.ts?raw';
import './worker';
import './styles.scss';

const $editor = document.getElementById('editor') as HTMLDivElement;

const codeEditor = editor.create($editor, {
	language: 'typescript',
	theme: 'vs-dark',
	tabSize: 4,
	insertSpaces: false,
	trimAutoWhitespace: true,
	minimap: {
		enabled: false,
	},
	value: localStorage.getItem('code') ?? '',
});

const { typescriptDefaults, ScriptTarget } = languages.typescript;

typescriptDefaults.setEagerModelSync(true);
typescriptDefaults.setCompilerOptions({
	...typescriptDefaults.getCompilerOptions(),
	strict: true,
	target: ScriptTarget.ESNext,
	lib: ['esnext'],
});

typescriptDefaults.addExtraLib(libRuntimeSource, '/workspace/web-sandbox.d.ts');

editor.addKeybindingRules([
	{
		keybinding: KeyCode.F1,
		command: null,
	},
	{
		keybinding: KeyMod.CtrlCmd | KeyCode.KeyP,
		command: 'editor.action.quickCommand',
	},
	{
		keybinding: KeyMod.CtrlCmd | KeyCode.KeyS,
		command: 'editor.action.formatDocument',
	}
]);

const executor = new JsExecutor({
	async log(text) {
		console.log(text);
	},
	async write(text) {
		console.log(text);
	},
	async input(options) {
		return '42';
	}
});

editor.addEditorAction({
	id: 'web-sandbox.run',
	label: 'Run the code!',
	keybindings: [KeyMod.CtrlCmd | KeyCode.KeyR],
	contextMenuGroupId: 'navigation',
	contextMenuOrder: 10,
	run: (ed) => {
		const code = ed.getValue();
		localStorage.setItem('code', code);
		executor.execute(code, 'scriptFromEditor.js');
	},
});

(window as any).editor = codeEditor;
