// Super minimal and optimized virtual DOM implementation
// Performance is preferred over readability

import { Unsubscribable } from 'rxjs';
import { syscall } from './syscall';

export enum NodeType {
	Text = 1,
	Element = 2,
}

export type DomTextNode = {
	nodeId: number;
	nodeType: 1;
	parent: DomElementNode | null;
	value: string;
};

export type DomElementNode = {
	nodeId: number;
	nodeType: 2;
	parent: DomElementNode | null;
	children: DomNode[];
	properties: Map<string, any>;
	value: string;
};

export type DomNode = DomTextNode | DomElementNode;

let nodeIdGen = 0;
const pooledDomNode: DomNode[] = [];
const POOL_CAPACITY = 12;

export const dummyRoot = createDomNode('root', false);

export function createDomNode(nodeTypeOrTextContent: string, isTextNode: boolean): DomNode {
	let node = pooledDomNode.pop();
	if (node) {
		node.nodeType = isTextNode ? NodeType.Text : NodeType.Element;
		node.parent = null;
		node.value = nodeTypeOrTextContent;
		if (!isTextNode) {
			const elementNode = node as DomElementNode;
			if (elementNode.children == null) {
				elementNode.children = [];
			} else {
				elementNode.children.length = 0;
			}

			if (elementNode.properties == null) {
				elementNode.properties = new Map();
			} else {
				elementNode.properties.clear();
			}
		}
	} else {
		const nodeId = nodeIdGen++;
		node = {
			nodeId,
			nodeType: isTextNode ? NodeType.Text : NodeType.Element,
			parent: null,
			children: isTextNode ? null : [],
			properties: isTextNode ? null : new Map(),
			value: nodeTypeOrTextContent,
		} as DomNode;
	}

	syscall.ui.node.create.mutate({
		nodeId: node.nodeId,
		nodeType: node.nodeType,
		value: node.value,
	});

	return node;
}

export function removeNode(parent: DomElementNode, node: DomNode, removeFromParent = true): void {
	if (removeFromParent) {
		const idx = parent.children.indexOf(node);
		if (idx >= 0) {
			parent.children.splice(idx, 1);
		}
	}

	node.parent = null;
	if (node.nodeType === NodeType.Element) {
		for (let i = node.children.length - 1; i >= 0; i--) {
			removeNode(node, node.children[i], false);
		}

		node.children.length = 0;
		for (const [name, listener] of node.properties) {
			if (name.startsWith('on')) {
				(listener as DomNodeEventListener).unsubscribable.unsubscribe();
			}
		}
		node.properties.clear();
	}

	syscall.ui.node.remove.mutate({
		parent: parent.nodeId,
		node: node.nodeId,
	});

	if (pooledDomNode.length < POOL_CAPACITY) {
		pooledDomNode.push(node);
	}
}

export function insertBefore(parent: DomElementNode, node: DomNode, anchor?: DomNode): void {
	syscall.ui.node.insert.mutate({
		node: node.nodeId,
		parent: parent.nodeId,
		anchor: anchor?.nodeId ?? -1,
	});

	node.parent = parent;
	if (anchor) {
		const idx = parent.children.indexOf(anchor);
		if (idx >= 0) {
			parent.children.splice(idx, 0, node);
			return;
		}
	}

	parent.children.push(node);
}

export function replaceText(textNode: DomTextNode, value: string): void {
	textNode.value = value;
	syscall.ui.node.replaceText.mutate({
		node: textNode.nodeId,
		value,
	});
}

type DomNodeEventListener = {
	unsubscribable: Unsubscribable;
};

export function setProperty(node: DomElementNode, name: string, value: any): void {
	if (name.startsWith('on')) {
		const listener = node.properties.get(name) as DomNodeEventListener | undefined;
		listener?.unsubscribable.unsubscribe();

		if (typeof value !== 'function') {
			node.properties.delete(name);
			return;
		}

		const unsubscribable = syscall.ui.node.onEvent.subscribe(
			{
				node: node.nodeId,
				eventName: name.slice(2),
			},
			{
				onData(data) {
					value(data);
				},
				onError(err) {
					console.error(err);
				},
			}
		);

		node.properties.set(name, { unsubscribable } as DomNodeEventListener);
		return;
	}

	node.properties.set(name, value);
	syscall.ui.node.setProperty.mutate({
		node: node.nodeId,
		name,
		value,
	});
}
