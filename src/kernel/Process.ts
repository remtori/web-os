import type { Syscall } from 'virtual:syscall';
import { sandbox } from './sandbox';

enum NodeType {
	Text = 1,
	Element = 2,
}

export class Process {
	private _workerId: number;
	private _channel: MessagePort;
	private _root: HTMLElement;
	private _refs: Map<number, HTMLElement | Text>;
	private _closed: boolean;

	constructor(root: HTMLElement, code: string) {
		const channel = new MessageChannel();

		this._workerId = -1;
		this._channel = channel.port1;
		this._root = root;
		this._refs = new Map();
		this._closed = false;

		sandbox.spawnWorker(channel.port2, code).then((workerId) => {
			this._workerId = workerId;
		});

		this._channel.onmessage = (e) => {
			const syscalls = e.data as Syscall[];
			console.log('syscalls', syscalls);
			for (let i = 0; i < syscalls.length; i++) {
				this.handleSyscall(syscalls[i]);
			}
		};
	}

	shutdown() {
		this._closed = true;

		this._channel.postMessage({
			type: 'shutdown',
		});
	}

	terminate() {
		this._closed = true;
		sandbox.killWorker(this._workerId);
	}

	private handleSyscall(syscall: Syscall) {
		switch (syscall.type) {
			case 'ui/node/create': {
				for (let i = 0; i < syscall.params.length; i++) {
					const params = syscall.params[i];
					if (params.nodeId === 0) {
						this._refs.set(0, this._root);
						continue;
					}

					if (params.nodeType === NodeType.Element) {
						const node = document.createElement(params.value);
						this._refs.set(params.nodeId, node);
					} else {
						const node = document.createTextNode(params.value);
						this._refs.set(params.nodeId, node);
					}
				}
				break;
			}
			case 'ui/node/remove': {
				for (let i = 0; i < syscall.params.length; i++) {
					const params = syscall.params[i];
					const parent = this._refs.get(params.parentNodeId);
					const node = this._refs.get(params.nodeId);

					if (parent && node) {
						parent.removeChild(node);
					}

					this._refs.delete(params.parentNodeId);
					this._refs.delete(params.nodeId);
				}

				break;
			}
			case 'ui/node/insert': {
				for (let i = 0; i < syscall.params.length; i++) {
					const params = syscall.params[i];

					const parent = this._refs.get(params.parentNodeId);
					const node = this._refs.get(params.nodeId);
					const anchor = this._refs.get(params.anchorNodeId);
					if (parent && node) {
						parent.insertBefore(node, anchor!);
					}
				}

				break;
			}
			case 'ui/node/replaceText': {
				for (let i = 0; i < syscall.params.length; i++) {
					const params = syscall.params[i];
					const node = this._refs.get(params.nodeId);
					if (node) {
						(node as Text).data = params.value;
					}
				}

				break;
			}
			case 'ui/node/setProperty': {
				for (let i = 0; i < syscall.params.length; i++) {
					const params = syscall.params[i];
					const node = this._refs.get(params.nodeId);
					if (node) {
						(node as HTMLElement).setAttribute(params.name, params.value);
					}
				}

				break;
			}
			default: {
				console.warn('Unknown syscall', syscall);
				break;
			}
		}
	}
}
