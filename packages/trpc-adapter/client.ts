import { Operation, TRPCClientError, TRPCLink } from '@trpc/client';
import type { AnyRouter, ProcedureType, inferRouterError } from '@trpc/server';
import type {
	TRPCClientIncomingMessage,
	TRPCClientIncomingRequest,
	TRPCClientOutgoingMessage,
	TRPCRequestMessage,
	TRPCResponseMessage,
} from '@trpc/server/rpc';
import { Observer, UnsubscribeFn, observable } from '@trpc/server/observable';
import { transformResult } from '@trpc/client/shared';
import EventEmitter from 'eventemitter3';

type CallbackResult<TRouter extends AnyRouter, TOutput> = TRPCResponseMessage<TOutput, inferRouterError<TRouter>>;

type CallbackObserver<TRouter extends AnyRouter, TOutput> = Observer<
	CallbackResult<TRouter, TOutput>,
	TRPCClientError<TRouter>
>;

export type ClientTransportEvent = {
	open: [];
	message: [data: any];
	close: [];
};

export interface ClientTransport extends EventEmitter<ClientTransportEvent> {
	send(data: any): void;
	isConnected(): boolean;
	close(): void;
}

function createClient<TClientTransport extends ClientTransport>(client: TClientTransport) {
	let outgoing: TRPCClientOutgoingMessage[] = [];

	type TCallbacks = CallbackObserver<AnyRouter, unknown>;
	type TRequest = {
		type: ProcedureType;
		callbacks: TCallbacks;
		op: Operation;
	};

	const pendingRequests: Record<number | string, TRequest> = Object.create(null);
	let isClosed = false;
	let connectTimer: number | null = null;
	let dispatchTimer: number | null = null;

	function dispatch() {
		if (!client.isConnected()) {
			return;
		}

		if (dispatchTimer) {
			return;
		}

		dispatchTimer = setTimeout(() => {
			dispatchTimer = null;

			if (outgoing.length === 1) {
				client.send(outgoing.pop());
			} else {
				client.send(outgoing);
			}

			// clear
			outgoing = [];
		});
	}

	function closeActiveSubscriptions() {
		Object.values(pendingRequests).forEach((req) => {
			if (req.type === 'subscription') {
				req.callbacks.complete();
			}
		});
	}

	function request(op: Operation, callbacks: TCallbacks): UnsubscribeFn {
		const { type, input, path, id } = op;
		const envelope: TRPCRequestMessage = {
			id,
			method: type,
			params: {
				input,
				path,
			},
		};
		pendingRequests[id] = {
			type,
			callbacks,
			op,
		};

		// enqueue message
		outgoing.push(envelope);
		dispatch();

		return () => {
			const callbacks = pendingRequests[id]?.callbacks;
			delete pendingRequests[id];
			outgoing = outgoing.filter((msg) => msg.id !== id);

			callbacks?.complete?.();
			if (client.isConnected() && op.type === 'subscription') {
				outgoing.push({
					id,
					method: 'subscription.stop',
				});
				dispatch();
			}
		};
	}

	function resumeSubscriptionOnReconnect(req: TRequest) {
		if (outgoing.some((r) => r.id === req.op.id)) {
			return;
		}
		request(req.op, req.callbacks);
	}

	function handleIncomingRequest(req: TRPCClientIncomingRequest) {
		if (req.method === 'reconnect') {
			// notify subscribers
			for (const pendingReq of Object.values(pendingRequests)) {
				if (pendingReq.type === 'subscription') {
					resumeSubscriptionOnReconnect(pendingReq);
				}
			}
		}
	}

	function handleIncomingResponse(data: TRPCResponseMessage) {
		const req = data.id !== null && pendingRequests[data.id];
		if (!req) {
			// do something?
			return;
		}

		req.callbacks.next?.(data);
		if ('result' in data && data.result.type === 'stopped') {
			req.callbacks.complete();
		}
	}

	client.on('open', () => {
		dispatch();
	});

	client.on('message', (rawMessage) => {
		const msg = rawMessage as TRPCClientIncomingMessage;

		if ('method' in msg) {
			handleIncomingRequest(msg);
		} else {
			handleIncomingResponse(msg);
		}
	});

	client.on('close', () => {
		for (const [key, req] of Object.entries(pendingRequests)) {
			if (isClosed) {
				// If the connection was closed, we just call `complete()` on the request
				delete pendingRequests[key];
				req.callbacks.complete?.();
				continue;
			}

			// The connection was closed either unexpectedly or because of a reconnect
			if (req.type === 'subscription') {
				// Subscriptions will resume after we've reconnected
				resumeSubscriptionOnReconnect(req);
			} else {
				// Queries and mutations will error if interrupted
				delete pendingRequests[key];
				req.callbacks.error?.(
					TRPCClientError.from(new TRPCTransportClosedError('Connection closed prematurely'))
				);
			}
		}
	});

	return {
		close: () => {
			isClosed = true;
			closeActiveSubscriptions();
			clearTimeout(connectTimer as any);
			connectTimer = null;
		},
		request,
	};
}

class TRPCTransportClosedError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'TRPCTransportClosedError';
		Object.setPrototypeOf(this, TRPCTransportClosedError.prototype);
	}
}

export function rpcLink<TRouter extends AnyRouter>(opts: { transport: ClientTransport }): TRPCLink<TRouter> {
	const client = createClient(opts.transport);

	return (runtime) => {
		return ({ op }) => {
			return observable((observer) => {
				const { type, path, id, context } = op;

				const input = runtime.transformer.serialize(op.input);

				const unsub = client.request(
					{ type, path, input, id, context },
					{
						error(err) {
							observer.error(err as TRPCClientError<any>);
							unsub();
						},
						complete() {
							observer.complete();
						},
						next(message) {
							const transformed = transformResult(message, runtime);

							if (!transformed.ok) {
								observer.error(TRPCClientError.from(transformed.error));
								return;
							}
							observer.next({
								result: transformed.result,
							});

							if (op.type !== 'subscription') {
								// if it isn't a subscription we don't care about next response

								unsub();
								observer.complete();
							}
						},
					}
				);
				return () => {
					unsub();
				};
			});
		};
	};
}
