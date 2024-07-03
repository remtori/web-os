export type WorkerId = number;

declare const __SANDBOX_URL__: string;

export const sandbox = (function () {
	const sandboxElement = document.createElement('iframe');
	sandboxElement.sandbox.add('allow-scripts');
	sandboxElement.sandbox.add('allow-same-origin');
	sandboxElement.src = __SANDBOX_URL__;
	sandboxElement.style.display = 'none';
	document.body.appendChild(sandboxElement);

	let resolveSandboxReady: () => void;
	const sandboxReady = new Promise<void>((resolve) => {
		resolveSandboxReady = resolve;
	});

	const warnFailedToLoadSandboxTimeout = setTimeout(() => {
		console.warn(
			'[Kernel] failed to load sandbox, if you are running locally, try to visit and accept the certificate at',
			sandboxElement.src
		);
	}, 1000);
	sandboxReady.then(() => clearTimeout(warnFailedToLoadSandboxTimeout));

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
			console.log('[Kernel] waiting for sandbox to be ready');
			await sandboxReady;

			console.log('[Kernel] spawning process');
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
