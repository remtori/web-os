import { router } from '../trpc';

export const authRouter = router({
	// setPermissionLevel: publicProcedure
	// 	.input(
	// 		z.object({
	// 			uid: z.string(),
	// 			permLevel: z.number().int().min(1).max(99),
	// 		}),
	// 	)
	// 	.mutation(async ({ input }) => {
	// 		await auth.setCustomUserClaims(input.uid, {
	// 			permLevel: input.permLevel,
	// 		});
	// 	}),
});
