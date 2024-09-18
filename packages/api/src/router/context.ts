import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';

import { auth } from './firebase';

type User = {
	uid: string;
	permLevel: number;
};

export async function createContext({ req, res }: CreateFastifyContextOptions) {
	let user: User | undefined;
	try {
		if (req.headers.authorization) {
			const token = await auth.verifyIdToken(req.headers.authorization);
			user = {
				uid: token.uid,
				permLevel: Number(token.permLevel) || 0,
			};
		}
	} catch (err) {}

	const permLevel = user?.permLevel ?? -1;
	return { req, res, user, permLevel };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
