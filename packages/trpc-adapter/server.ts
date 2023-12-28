import { AnyRouter, TRPCError, callProcedure, getTRPCErrorFromUnknown, inferRouterContext } from '@trpc/server';
import { JSONRPC2, TRPCClientOutgoingMessage, TRPCResponseMessage, parseTRPCMessage } from '@trpc/server/rpc';
import { getErrorShape, transformTRPCResponse } from '@trpc/server/shared';
import { Unsubscribable, isObservable } from 'rxjs';
import EventEmitter from 'eventemitter3';

export type ServerTransportEvent = {
	message: [data: any];
	close: [];
};

export interface ServerTransport extends EventEmitter<ServerTransportEvent> {
	send(data: any): void;
	isConnected(): boolean;
	close(): void;
}

export function createServer<TRouter extends AnyRouter, TServerTransport extends ServerTransport>(opt: {
	router: TRouter;
	transport: TServerTransport;
	context: inferRouterContext<TRouter>;
}): void {
	const { router, transport, context: ctx } = opt;
	const { transformer } = router._def._config;

	const clientSubscriptions = new Map<number | string, Unsubscribable>();

	function respond(untransformedJSON: TRPCResponseMessage) {
		transport.send(transformTRPCResponse(router._def._config, untransformedJSON));
	}

	function stopSubscription(
		subscription: Unsubscribable,
		{ id, jsonrpc }: JSONRPC2.BaseEnvelope & { id: JSONRPC2.RequestId }
	) {
		subscription.unsubscribe();

		respond({
			id,
			jsonrpc,
			result: {
				type: 'stopped',
			},
		});
	}

	async function handleRequest(msg: TRPCClientOutgoingMessage) {
		const { id, jsonrpc } = msg;

		if (id === null) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: '`id` is required',
			});
		}

		if (msg.method === 'subscription.stop') {
			const sub = clientSubscriptions.get(id);
			if (sub) {
				sub.unsubscribe();
			}

			clientSubscriptions.delete(id);
			return;
		}

		const { path, input } = msg.params;
		const type = msg.method;
		try {
			const result = await callProcedure({
				procedures: router._def.procedures,
				ctx,
				path,
				rawInput: input,
				type,
			});

			if (type === 'subscription') {
				if (!isObservable(result)) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: `Subscription ${path} did not return an observable`,
					});
				}
			} else {
				// send the value as data if the method is not a subscription
				respond({
					id,
					jsonrpc,
					result: {
						type: 'data',
						data: result,
					},
				});

				return;
			}

			const observable = result;
			const sub = observable.subscribe({
				next(data) {
					respond({
						id,
						jsonrpc,
						result: {
							type: 'data',
							data,
						},
					});
				},
				error(err) {
					const error = getTRPCErrorFromUnknown(err);
					// NOTE: maybe delegate error
					respond({
						id,
						jsonrpc,
						error: getErrorShape({
							config: router._def._config,
							error,
							type,
							path,
							input,
							ctx,
						}),
					});
				},
				complete() {
					respond({
						id,
						jsonrpc,
						result: {
							type: 'stopped',
						},
					});
				},
			});

			if (!transport.isConnected()) {
				// if the client got disconnected whilst initializing the subscription
				// no need to send stopped message if the client is disconnected
				sub.unsubscribe();
				return;
			}

			if (clientSubscriptions.has(id)) {
				// duplicate request ids for client
				stopSubscription(sub, { id, jsonrpc });
				throw new TRPCError({
					message: `Duplicate id ${id}`,
					code: 'BAD_REQUEST',
				});
			}
			clientSubscriptions.set(id, sub);

			respond({
				id,
				jsonrpc,
				result: {
					type: 'started',
				},
			});
		} catch (cause) {
			// procedure threw an error
			const error = getTRPCErrorFromUnknown(cause);
			// NOTE: maybe delegate error
			respond({
				id,
				jsonrpc,
				error: getErrorShape({
					config: router._def._config,
					error,
					type,
					path,
					input,
					ctx,
				}),
			});
		}
	}

	transport.on('message', async (msgJSON: any) => {
		try {
			const msgs: unknown[] = Array.isArray(msgJSON) ? msgJSON : [msgJSON];

			for (let i = 0; i < msgs.length; i++) {
				const parsedMsg = parseTRPCMessage(msgs[i], transformer);
				await handleRequest(parsedMsg);
			}
		} catch (cause) {
			const error = new TRPCError({
				code: 'PARSE_ERROR',
				cause,
			});

			respond({
				id: null,
				error: getErrorShape({
					config: router._def._config,
					error,
					type: 'unknown',
					path: undefined,
					input: undefined,
					ctx: undefined,
				}),
			});
		}
	});

	transport.once('close', () => {
		for (const sub of clientSubscriptions.values()) {
			sub.unsubscribe();
		}
		clientSubscriptions.clear();
	});
}
