(function () {
	/**
	 * @param {MessageEvent} event
	 */
	const onMessage = (event) => {
		if (event.data.type === 'init') {
			const port = event.ports[0];

			const fn = new Function('$channel', event.data.code);
			try {
				fn(port);
			} catch (error) {
				console.warn('SandboxWorker init error', error);
			}

			self.removeEventListener('message', onMessage, true);
		}
	};

	self.addEventListener('message', onMessage, true);
})();
