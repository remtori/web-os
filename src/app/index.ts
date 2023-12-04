import { JsExecutorBuilder } from '../runtime/builder';
import './index.scss';

const $chatHistory = document.getElementById('chatHistory') as HTMLDivElement;
const $input = document.getElementById('input') as HTMLInputElement;

const executor = new JsExecutorBuilder()
	.addSyncFn(async function readFloat(prompt?: string, options?: sandbox.NumberInputOptions): Promise<number> {
		if (prompt) {
			addChatHistory(prompt, true);
		}

		$input.type = 'number';
		if (options) {
			if (options.min) $input.min = String(options.min);
			if (options.max) $input.max = String(options.max);
			if (options.step) $input.step = String(options.step);
		}

		const value = await waitForInput();
		return parseFloat(value);
	})
	.addSyncFn(async function readFloat(prompt?: string, options?: sandbox.NumberInputOptions): Promise<number> {
		if (prompt) {
			addChatHistory(prompt, true);
		}

		$input.type = 'number';
		if (options) {
			if (options.min) $input.min = String(Math.round(options.min));
			if (options.max) $input.max = String(Math.round(options.max));
			if (options.step) $input.step = String(Math.round(options.step));
		}

		const value = await waitForInput();
		return parseInt(value);
	})
	.addSyncFn(function readString(prompt?: string, options?: sandbox.StringInputOptions) {
		if (prompt) {
			addChatHistory(prompt, true);
		}

		$input.type = 'text';
		if (options) {
			if (options.pattern) $input.pattern = options.pattern;
			if (options.minlength) $input.minLength = options.minlength;
			if (options.maxlength) $input.maxLength = options.maxlength;
		}

		return waitForInput();
	})
	.addSyncFn(function readSelections(prompt: string | string[], selections?: string[]) {
		if (typeof prompt === 'string') {
			addChatHistory(prompt, true);
		} else {
			selections = prompt;
		}

		return '';
	})
	.addSyncFn(function write(...args: string[]) {
		addChatHistory(args.join('\t'), true);
	})
	.addSyncFn(function writeln(...args: string[]) {
		addChatHistory(args.join('\t'), true);
	});

$input.focus();
$input.addEventListener('keydown', event => {
	if (event.key === 'Enter') {
		const value = $input.value.trim();
		if (value.length > 0) {
			handleInput(value);
		}

		$input.value = '';
	}
});

function addChatHistory(content: string, isAnswer = false) {
	const $chat = document.createElement('div');
	$chat.classList.add('item');
	$chat.classList.add(isAnswer ? 'left' : 'right');
	$chat.textContent = content;
	$chatHistory.appendChild($chat);
}

function handleInput(value: string) {
	addChatHistory(value);
	if (resolveInput) {
		resolveInput(value);
		return;
	}

	switch (value) {
		case 'ls': {
			
		}
	}
}

let resolveInput: ((value: string) => void) | undefined;
function waitForInput(): Promise<string> {
	if (resolveInput)
		throw new Error('Cannot call waitForInput() multiple time (how did this happen anyway?)');

	return new Promise(resolve => {
		resolveInput = (value) => {
			resolveInput = undefined;
			resolve(value);
		}
	});
}
