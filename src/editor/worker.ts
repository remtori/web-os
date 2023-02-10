import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import TypescriptWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
	getWorker(_, label) {
		if (label === 'typescript' || label === 'javascript')
			return new TypescriptWorker();

		return new EditorWorker();
	}
}
