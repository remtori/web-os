export type WorkerId = number;

export const sandbox = (function () {
	const sandboxElement = document.getElementById('sandbox') as HTMLIFrameElement;

	let resolveSandboxReady: () => void;
	const sandboxReady = new Promise<void>((resolve) => {
		resolveSandboxReady = resolve;
	});

	const pendingSpawnWorkers: ((workerId: number) => void)[] = [];
	window.addEventListener('message', (e) => {
		if (e.source === sandboxElement.contentWindow) {
			if (e.data?.type === 'spawnWorker') {
				pendingSpawnWorkers.pop()?.(e.data.workerId);
			} else if (e.data?.type === 'sandboxReady') {
				resolveSandboxReady();
			}
		}
	});

	return {
		async spawnWorker(port: MessagePort, code: string): Promise<WorkerId> {
			await sandboxReady;

			sandboxElement.contentWindow!.postMessage(
				{
					type: 'spawnWorker',
					code,
				},
				'*',
				[port]
			);

			return new Promise((resolve) => {
				pendingSpawnWorkers.push(resolve);
			});
		},
		killWorker(workerId: WorkerId) {
			sandboxElement.contentWindow!.postMessage({
				type: 'killWorker',
				workerId,
			});
		},
	};
})();
