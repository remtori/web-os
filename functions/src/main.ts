import { createServer } from './server';

const REQUIRED_ENVS = [
	'S3_ENDPOINT',
	'S3_BUCKET',
	'S3_REGION',
	'S3_ACCESS_KEY',
	'S3_SECRET_KEY',
	'FIREBASE_PROJECT_ID',
	'FIREBASE_PRIVATE_KEY',
	'FIREBASE_CLIENT_EMAIL',
];
REQUIRED_ENVS.forEach((envName) => {
	if (!process.env[envName]) {
		console.error(`Env ${envName} is required but not set`);
		process.exit(1);
	}
});

const server = createServer({
	dev: process.env.NODE_ENV !== 'production',
	port: Number(process.env.PORT),
	prefix: process.env.PREFIX,
});

server.start();
