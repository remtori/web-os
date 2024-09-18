import { Desktop } from '@/components/Desktop';
import { render } from 'solid-js/web';

import { AppRegistry } from './AppRegistry';
import { auth } from './firebase';
import { trpc } from './trpc';

import './apps/register';
import './globals.css';

(window as any)._ = {
	auth,
	trpc,
	registry: AppRegistry,
};

render(() => <Desktop />, document.getElementById('root')!);
