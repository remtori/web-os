// Super minimal and optimized virtual DOM implementation
// Performance is preferred over readability

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

	syscall.call('ui/node/create', {
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
		node.properties.clear();
	}

	syscall.call('ui/node/remove', {
		nodeId: node.nodeId,
		parentNodeId: parent.nodeId,
	});

	if (pooledDomNode.length < POOL_CAPACITY) {
		pooledDomNode.push(node);
	}
}

export function insertBefore(parent: DomElementNode, node: DomNode, anchor?: DomNode): void {
	syscall.call('ui/node/insert', {
		nodeId: node.nodeId,
		parentNodeId: parent.nodeId,
		anchorNodeId: anchor?.nodeId ?? -1,
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
	syscall.call('ui/node/replaceText', {
		nodeId: textNode.nodeId,
		value,
	});
}

export function setProperty(node: DomElementNode, name: string, value: any): void {
	node.properties.set(name, value);
	syscall.call('ui/node/setProperty', {
		nodeId: node.nodeId,
		name,
		value,
	});
}
