import workerUrl from './entry.worker?worker&url';

const workers = new Map<number, Worker>();
let workerIdGen = 0;

function spawnWorker(code: string, port: MessagePort) {
	const worker = new Worker(workerUrl, { type: __WORKER_MODE__ });
	worker.postMessage({ type: 'init', code }, [port]);

	const workerId = workerIdGen++;
	workers.set(workerId, worker);
	return workerId;
}

function killWorker(workerId: number) {
	const worker = workers.get(workerId);
	worker?.terminate();

	workers.delete(workerId);
}

window.addEventListener(
	'message',
	(event) => {
		try {
			const caller = event.source as Window;
			const message = event.data;

			if (message.type === 'spawnWorker') {
				const workerId = spawnWorker(message.code, event.ports[0]);
				caller.postMessage({ type: 'spawnWorker', workerId }, event.origin);
			} else if (message.type === 'killWorker') {
				killWorker(message.workerId);
			}
		} catch (anyError) {
			console.log('[Sandbox] error', anyError);
		}
	},
	true
);

window.parent.postMessage({ type: 'sandboxReady' }, '*');
console.log('[Sandbox] ready');
