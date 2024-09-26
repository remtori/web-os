import {
	AnyRouter,
	ProcedureType,
	TRPCError,
	callProcedure,
	getTRPCErrorFromUnknown,
	inferRouterContext,
} from '@trpc/server';
import { Unsubscribable, isObservable } from '@trpc/server/observable';
import { getErrorShape } from '@trpc/server/shared';

import type {
	PostMessageEventListener,
	TRPCPostMessageResponse,
} from '../types';

export type CreatePostMessageContextOptions = {
	req: MessageEvent;
	res: undefined;
};

export type CreatePostMessageHandlerOptions<TRouter extends AnyRouter> = {
	router: TRouter;
	context: inferRouterContext<TRouter>;
	postMessage: (args: {
		message: TRPCPostMessageResponse;
		opts: { event: MessageEvent };
	}) => void;
	addEventListener: PostMessageEventListener;
};

export const createPostMessageHandler = <TRouter extends AnyRouter>(
	opts: CreatePostMessageHandlerOptions<TRouter>,
) => {
	const { router, context: ctx, addEventListener, postMessage } = opts;

	const subscriptions = new Map<number | string, Unsubscribable>();
	const onMessage: Parameters<PostMessageEventListener>[0] = async (
		event,
	) => {
		const { data } = event;

		if (!('trpc' in data)) {
			return;
		}

		const { trpc } = data;
		if (!trpc) {
			return;
		}

		if (
			!('id' in trpc) ||
			(typeof trpc.id !== 'number' && typeof trpc.id !== 'string')
		) {
			return;
		}
		if (
			'jsonrpc' in trpc &&
			trpc.jsonrpc !== '2.0' &&
			trpc.jsonrpc !== undefined
		) {
			return;
		}
		if (
			!('method' in trpc) ||
			(trpc.method !== 'query' &&
				trpc.method !== 'mutation' &&
				trpc.method !== 'subscription' &&
				trpc.method !== 'subscription.stop')
		) {
			return;
		}

		const {
			id,
			jsonrpc,
			method,
		}: {
			id: string | number;
			jsonrpc: '2.0' | undefined;
			method: string;
		} = trpc;

		const sendResponse = (response: TRPCPostMessageResponse['trpc']) => {
			postMessage({
				message: { trpc: { id, jsonrpc, ...response } },
				opts: {
					event,
				},
			});
		};

		let params: { path: string; input: unknown } | undefined;
		let input: any;
		try {
			if (method === 'subscription.stop') {
				const subscription = subscriptions.get(id);
				if (subscription) {
					subscription.unsubscribe();
					sendResponse({
						result: {
							type: 'stopped',
						},
					});
					subscriptions.delete(id);
				}
				return;
			}

			// params should always be present for 'query', 'subscription' and 'mutation' {@param method}
			({ params } = trpc);
			if (!params) {
				return;
			}

			input = params.input;
			const result = await callProcedure({
				procedures: router._def.procedures,
				ctx,
				path: params.path,
				rawInput: input,
				type: method,
			});

			if (method !== 'subscription') {
				sendResponse({
					result: {
						type: 'data',
						data: result,
					},
				});

				return;
			}

			if (!isObservable(result)) {
				throw new TRPCError({
					message: `Subscription ${params.path} did not return an observable`,
					code: 'INTERNAL_SERVER_ERROR',
				});
			}

			if (subscriptions.has(id)) {
				subscriptions.get(id)?.unsubscribe();
				sendResponse({
					result: {
						type: 'stopped',
					},
				});
				subscriptions.delete(id);
				throw new TRPCError({
					message: `Duplicate id ${id}`,
					code: 'BAD_REQUEST',
				});
			}

			const subscription = result.subscribe({
				next: (data) => {
					sendResponse({
						result: {
							type: 'data',
							data,
						},
					});
				},
				error: (cause) => {
					const error = getTRPCErrorFromUnknown(cause);

					sendResponse({
						error: getErrorShape({
							config: router._def._config,
							error,
							type: method,
							path: params?.path,
							input,
							ctx,
						}),
					});
				},
				complete: () => {
					sendResponse({
						result: {
							type: 'stopped',
						},
					});
				},
			});
			subscriptions.set(id, subscription);

			sendResponse({
				result: {
					type: 'started',
				},
			});
			return;
		} catch (cause) {
			const error = getTRPCErrorFromUnknown(cause);

			sendResponse({
				error: getErrorShape({
					config: router._def._config,
					error,
					type: method as ProcedureType,
					path: params?.path,
					input,
					ctx,
				}),
			});
		}
	};

	addEventListener(onMessage);
};
