import { syscall } from './syscall';
import * as theLib from './index';

const onMessage = (event: MessageEvent) => {
	if (event.data.type === 'init') {
		const port = event.ports[0];
		const code = event.data.code;
		syscall.__init(port);

		const fn = new Function('__exports__AppSandbox', code);
		try {
			fn(theLib);
		} catch (anyError) {
			console.log('error', anyError);
		}

		self.removeEventListener('message', onMessage, true);
	}
};

self.addEventListener('message', onMessage, true);
