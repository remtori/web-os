import fastifyStatic from '@fastify/static';
import ws from '@fastify/websocket';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import fastify from 'fastify';
import path from 'node:path';

import { appRouter } from './router';
import { createContext } from './router/context';

export interface ServerOptions {
	dev?: boolean;
	port?: number;
	prefix?: string;
}

export function createServer(opts: ServerOptions) {
	const dev = opts.dev ?? true;
	const port = opts.port || 5696;
	const prefix = opts.prefix || '/api/bundle';

	const server = fastify({ logger: true });

	server.log.info(
		`Starting server on port ${port} with prefix ${prefix} and running in ${dev ? 'development' : 'production'} mode`,
	);
	server.register(ws);
	server.register(fastifyTRPCPlugin, {
		prefix,
		useWSS: !dev,
		trpcOptions: { router: appRouter, createContext },
	});

	if (!dev) {
		server.register(fastifyStatic, {
			root: path.join(__dirname, 'static'),
			index: 'index.html',
		});
	}

	const stop = async () => {
		await server.close();
	};
	const start = async () => {
		try {
			await server.listen({
				host: '0.0.0.0',
				port,
			});
			console.log('listening on port', port);
		} catch (err) {
			server.log.error(err);
			process.exit(1);
		}
	};

	return { server, start, stop };
}
