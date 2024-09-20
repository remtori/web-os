import { TRPCClientError, TRPCLink } from '@trpc/client';
import type { AnyRouter } from '@trpc/server';
import { observable } from '@trpc/server/observable';

import type {
	PostMessageEventListener,
	TRPCPostMessageRequest,
} from '../types';

export type PostMessageLinkOption = {
	postMessage: (args: { message: TRPCPostMessageRequest }) => void;
	addEventListener: PostMessageEventListener;
	removeEventListener: PostMessageEventListener;
};

export const postMessageLink = <TRouter extends AnyRouter>(
	opts: PostMessageLinkOption,
): TRPCLink<TRouter> => {
	return (_runtime) => {
		const { addEventListener, postMessage, removeEventListener } = opts;

		return ({ op }) => {
			return observable((observer) => {
				const listeners: (() => void)[] = [];
				const { id, input, type, path } = op;
				try {
					const onMessage: Parameters<PostMessageEventListener>[0] = (
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
							(typeof trpc.id !== 'number' &&
								typeof trpc.id !== 'string')
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

						if (id !== trpc.id) {
							return;
						}

						if ('error' in trpc) {
							observer.error(TRPCClientError.from(trpc));

							return;
						}

						if ('result' in trpc) {
							observer.next({
								result: trpc.result,
							});

							if (
								type !== 'subscription' ||
								trpc.result.type === 'stopped'
							) {
								observer.complete();
							}
						}
					};

					const maybeNewListener = addEventListener(onMessage);
					listeners.push(
						maybeNewListener
							? () => removeEventListener(maybeNewListener)
							: () => removeEventListener(onMessage),
					);

					postMessage({
						message: {
							trpc: {
								id,
								jsonrpc: undefined,
								method: type,
								params: { path, input },
							},
						},
					});
				} catch (cause) {
					observer.error(
						new TRPCClientError(
							cause instanceof Error
								? cause.message
								: 'Unknown error',
						),
					);
				}

				return () => {
					if (type === 'subscription') {
						postMessage({
							message: {
								trpc: {
									id,
									jsonrpc: undefined,
									method: 'subscription.stop',
								},
							},
						});
					}

					listeners.forEach((unsub) => unsub());
				};
			});
		};
	};
};
