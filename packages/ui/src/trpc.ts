import type { AppRouter } from '@api';
import {
	createTRPCProxyClient,
	createWSClient,
	httpBatchLink,
	splitLink,
	wsLink,
} from '@trpc/client';
import superjson from 'superjson';

import { auth } from './firebase';

const isSecureProtocol = location.protocol === 'https:';
const urlEndPoint = `${location.host}/api/bundle`;
const wsClient = createWSClient({
	url: `${isSecureProtocol ? 'wss' : 'ws'}://${urlEndPoint}`,
});

export const trpc = createTRPCProxyClient<AppRouter>({
	links: [
		splitLink({
			condition(op) {
				return op.type === 'subscription';
			},
			true: wsLink({ client: wsClient }),
			false: httpBatchLink({
				url: `${location.protocol}//${urlEndPoint}`,
				async headers(_opts) {
					const token = await auth.currentUser?.getIdToken();
					if (!token) {
						return {};
					}

					return {
						Authorization: token,
					};
				},
			}),
		}),
	],
	transformer: superjson,
});
