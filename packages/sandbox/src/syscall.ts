import { rpcLink } from '@trpc-adapter/client';
import type { SysRouter } from '../../desktop/src/kernel/syscall/index';
import { createTRPCProxyClient } from '@trpc/client';
import EventEmitter from 'eventemitter3';

type TransportEvent = {
	open: [];
	message: [data: any];
	close: [];
};

const clientTransport = new (class extends EventEmitter<TransportEvent> {
	_port: MessagePort | undefined;

	initChannel(channel: MessagePort) {
		this._port = channel;
		this._port.onmessage = (event) => {
			this.emit('message', event.data);
		};

		this.emit('open');
	}

	send(data: any): void {
		this._port!.postMessage(data);
	}

	isConnected(): boolean {
		return !!this._port;
	}

	close(): void {
		if (this._port) {
			this._port.close();
			this._port.onmessage = null;
		}

		this._port = undefined;
		this.emit('close');
	}
})();

export function __init(channel: MessagePort) {
	clientTransport.initChannel(channel);
}

export const syscall = createTRPCProxyClient<SysRouter>({
	links: [rpcLink({ transport: clientTransport })],
});
