export function removeAllChild(node: HTMLElement) {
	while (node.firstChild) {
		node.removeChild(node.firstChild);
	}
}

export function createHistoryLine(line: string): HTMLDivElement {
	const $line = document.createElement('div');
	$line.classList.add('line');
	$line.innerHTML = line;
	return $line;
}

export function createSuggestionNode(command: string, label?: string): HTMLButtonElement {
	const $button = document.createElement('button');
	$button.value = command;
	$button.textContent = label ?? command;
	return $button;
}
