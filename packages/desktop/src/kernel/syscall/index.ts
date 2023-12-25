import { router } from './router';
import { uiRouter } from './ui';

export const sysRouter = router({
	ui: uiRouter,
});

export type SysRouter = typeof sysRouter;
