import type { Syscall, SystemMessage } from 'virtual:syscall';

class SyscallMessageChannel {
	private _channel: MessagePort | undefined;

	private _messageBatch: Syscall[] = [];
	private _deferredTimeout: number;

	constructor() {
		this._messageBatch = [];
		this._deferredTimeout = 0;
	}

	__init(channel: MessagePort) {
		this._channel = channel;
		this._channel.onmessage = this.onMessage;
		this.flush();
	}

	private onMessage = (e: MessageEvent) => {
		const messages = e.data as SystemMessage[];
		for (let i = 0; i < messages.length; i++) {
			const message = messages[i];
			switch (message.type) {
				case 'shutdown': {
					// Note: This should be the only thing that keep this Worker alive.
					// So by removing the onmessage handler, the Worker should terminate.
					this._channel!.onmessage = null;
					break;
				}
				default: {
					console.warn('Unhandled system message', message);
					break;
				}
			}
		}
	};

	private flush = () => {
		clearTimeout(this._deferredTimeout);
		this._deferredTimeout = 0;
		if (this._channel) {
			this._channel.postMessage(this._messageBatch);
			this._messageBatch.length = 0;
		}
	};

	call<Type extends Syscall['type']>(type: Type, params: Extract<Syscall, { type: Type }>['params'][0]) {
		let batched = false;
		for (let i = 0; i < this._messageBatch.length; i++) {
			if (this._messageBatch[i].type === type) {
				this._messageBatch[i].params.push(params as any);
				batched = true;
				break;
			}
		}

		if (!batched) {
			this._messageBatch.push({
				type,
				params: [params as any],
			});
		}

		if (this._deferredTimeout === 0) {
			this._deferredTimeout = setTimeout(this.flush, 0) as any;
		}
	}
}

export const syscall = new SyscallMessageChannel();
