import { ServerTransportEvent, createServer } from '@trpc-adapter/server';
import { sandbox } from './sandbox';
import { sysRouter } from './syscall';
import EventEmitter from 'eventemitter3';

class MessagePortTransport extends EventEmitter<ServerTransportEvent> {
	private _closed: boolean = false;

	constructor(private channel: MessagePort) {
		super();

		this.channel.onmessage = (event) => {
			this.emit('message', event.data);
		};
	}

	send(data: any) {
		this.channel.postMessage(data);
	}

	isConnected() {
		return true;
	}

	close() {
		if (this._closed) {
			return;
		}
		this._closed = true;

		this.emit('close');
		this.channel.close();
	}
}

export class Process {
	private _workerId: number;
	private _transport: MessagePortTransport;
	private _closed: boolean;

	private _root: HTMLElement;
	private _refs: Map<number, HTMLElement | Text>;

	constructor(root: HTMLElement, code: string) {
		const channel = new MessageChannel();

		this._workerId = -1;
		this._transport = new MessagePortTransport(channel.port1);
		this._closed = false;

		this._root = root;
		this._refs = new Map();
		this._refs.set(0, this._root);

		sandbox.spawnWorker(channel.port2, code).then((workerId) => {
			this._workerId = workerId;
		});

		createServer({
			router: sysRouter,
			transport: this._transport,
			context: {
				process: this,
			},
		});
	}

	getNode(id: number) {
		return this._refs.get(id);
	}

	addNode(id: number, node: HTMLElement | Text) {
		this._refs.set(id, node);
		return id;
	}

	deleteNode(id: number) {
		return this._refs.delete(id);
	}

	shutdown() {
		if (this._closed) {
			return;
		}
		this._closed = true;

		this._transport.send({
			type: 'shutdown',
		});
		this._transport.close();
	}

	terminate() {
		if (this._closed) {
			return;
		}
		this._closed = true;

		sandbox.killWorker(this._workerId);
		this._transport.close();
	}
}
