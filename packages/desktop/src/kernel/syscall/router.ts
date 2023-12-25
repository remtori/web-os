import { Process } from '@kernel/Process';
import { initTRPC } from '@trpc/server';

const t = initTRPC
	.context<{
		process: Process;
	}>()
	.create({
		isServer: true,
	});

export const publicProcedure = t.procedure;
export const router = t.router;
