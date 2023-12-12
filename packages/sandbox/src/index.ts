import { createRenderer } from 'solid-js/universal';
import * as vdom from './vdom';

const renderer = createRenderer<vdom.DomNode>({
	createElement(type) {
		return vdom.createDomNode(type, false);
	},
	createTextNode(value) {
		return vdom.createDomNode(value, true);
	},
	replaceText(textNode, value) {
		vdom.replaceText(textNode as vdom.DomTextNode, value);
	},
	setProperty(node, name, value) {
		vdom.setProperty(node as vdom.DomElementNode, name, value);
	},
	insertNode(parent, node, anchor) {
		vdom.insertBefore(parent as vdom.DomElementNode, node, anchor);
	},
	isTextNode(node) {
		return node.nodeType === vdom.NodeType.Text;
	},
	removeNode(parent, node) {
		vdom.removeNode(parent as vdom.DomElementNode, node);
	},
	getParentNode(node) {
		return node.parent as unknown as vdom.DomElementNode | undefined;
	},
	getFirstChild(node) {
		return (node as vdom.DomElementNode).children[0];
	},
	getNextSibling(node) {
		const parent = node.parent as vdom.DomElementNode;
		const idx = parent.children.indexOf(node);
		if (idx === -1) {
			return;
		}

		return parent.children[idx + 1];
	},
});

// Forward Solid control flow
export { For, Show, Suspense, SuspenseList, Switch, Match, Index, ErrorBoundary } from 'solid-js';

export const {
	effect,
	memo,
	createComponent,
	createElement,
	createTextNode,
	insertNode,
	insert,
	spread,
	setProp,
	mergeProps,
	use,
} = renderer;

export const render = (code: () => vdom.DomNode) => {
	return renderer.render(code, vdom.dummyRoot);
};
