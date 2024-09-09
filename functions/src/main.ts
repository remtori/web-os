import { createServer } from './server';

const server = createServer({
	dev: process.env.NODE_ENV !== 'production',
	port: Number(process.env.PORT),
	prefix: process.env.PREFIX,
});

server.start();
