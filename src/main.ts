import { createHistoryLine } from './util';
import './styles.scss'

const $shell = document.getElementById('shell') as HTMLDivElement;
const $history = document.getElementById('history') as HTMLDivElement;
const $input = document.getElementById('input') as HTMLInputElement;
const $suggestion = document.getElementById('suggestions') as HTMLDivElement;

window.addEventListener('DOMContentLoaded', () => {
	$input.focus();
});

window.addEventListener('resize', () => {
	$shell.scrollTo({
		top: $shell.scrollHeight ?? 99999,
		behavior: 'smooth',
	});
});

$shell.addEventListener('click', () => {
	$input.focus();
});

$input.addEventListener('keydown', (e) => {
	if (e.key === 'Enter') {
		//execute
	}

	if (e.key === 'n') {
		$input.type = 'number';
		$input.value = '';
	}

	if (e.key === 't') {
		$input.type = 'text';
		$input.value = '';
	}

	console.log(e.key);
});

function stdoutWrite(text: string) {
	const $lastLine = $history.lastElementChild;

	let buf = $lastLine?.innerHTML ?? '';
	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		switch (char) {
			case '\n': {
				if ($lastLine) {
					$lastLine.innerHTML = buf;
				} else {
					$history.appendChild(createHistoryLine(buf));
				}

				buf = '';
				$history.appendChild(createHistoryLine(''));
				break;
			}
			case '\r': {
				buf = '';
				break;
			}
			default: {
				buf += char;
			}
		}
	}
}
