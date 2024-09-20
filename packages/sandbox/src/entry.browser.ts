import workerUrl from './entry.worker?worker&url';
import type { WorkerInitMessage, WorkerSpawnOptions } from './types';

let workerIdGen = 0;
const workerPrefix = location.host.split('.')[0];

const workers = new Map<string, Worker>();

const spawnWorker = (channel: MessagePort, options: WorkerSpawnOptions) => {
	const worker = new Worker(workerUrl, { type: options.workerType });
	worker.postMessage(
		{
			type: 'init',
			url: options.url,
			workerType: options.workerType,
		} satisfies WorkerInitMessage,
		[channel],
	);

	const workerId = `${workerPrefix}-${workerIdGen++}`;
	workers.set(workerId, worker);
	return workerId;
};

const killWorker = (workerId: string) => {
	const worker = workers.get(workerId);
	workers.delete(workerId);

	if (worker) {
		worker.terminate();
	}
};

window.addEventListener(
	'message',
	(event) => {
		const origin = new URL(event.origin);
		if (
			origin.hostname !== 'localhost' &&
			origin.host !== import.meta.env.VITE_DESKTOP_OS_ORIGIN
		) {
			return;
		}

		const caller = event.source as WindowProxy;
		if (!caller) {
			return;
		}

		try {
			const msg = event.data;
			switch (msg.type) {
				case 'spawn': {
					const workerId = spawnWorker(event.ports[0]!, msg);
					caller.postMessage(
						{ type: 'spawn', workerId },
						caller.origin,
					);
					break;
				}
				case 'kill': {
					killWorker(msg.workerId);
					break;
				}
			}
		} catch (anyError) {
			console.log('[Sandbox][Host] error', anyError);
		}
	},
	false,
);
