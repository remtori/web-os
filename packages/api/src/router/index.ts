import { authRouter } from './routers/auth';
import { s3fsRouter } from './routers/s3fs';
import { router } from './trpc';

export const appRouter = router({
	auth: authRouter,
	s3fs: s3fsRouter,
});

export type AppRouter = typeof appRouter;
