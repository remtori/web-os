import { createSyscall } from './syscall';
import type { WorkerInitMessage } from './types';

const onMessage = async (event: MessageEvent) => {
	const msg = event.data as WorkerInitMessage;
	if (msg.type === 'init') {
		const port = event.ports[0];
		if (!port) {
			console.error('Missing MessagePort when initialize sandbox');
			return;
		}

		(globalThis as any).__exports_syscall = createSyscall(port);

		try {
			if (msg.workerType === 'module') {
				await import(/* @vite-ignore */ msg.url);
			} else {
				importScripts(msg.url);
			}
		} catch (anyError) {
			console.log('[Sandbox][Worker] error', anyError);
		}

		self.removeEventListener('message', onMessage, true);
	}
};

self.addEventListener('message', onMessage, true);
