import { __init } from './syscall';
import * as theLib from './index';

(self as any).__exports__AppSandbox = theLib;

const onMessage = async (event: MessageEvent) => {
	if (event.data.type === 'init') {
		const port = event.ports[0];
		const code = event.data.code;
		__init(port);

		try {
			if (__WORKER_MODE__ === 'module') {
				await import(/* @vite-ignore */ code);
			} else {
				importScripts(code);
			}
		} catch (anyError) {
			console.log('[Sandbox] error', anyError);
		}

		self.removeEventListener('message', onMessage, true);
	}
};

self.addEventListener('message', onMessage, true);
