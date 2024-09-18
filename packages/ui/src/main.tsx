import { render } from 'solid-js/web';

import { Desktop } from '@/components/Desktop';

import './apps/register';
import { auth } from './firebase';
import './globals.css';
import { useAppRegistry } from './registry';
import { trpc } from './trpc';

(window as any)._ = {
	auth,
	trpc,
	appRegistry: useAppRegistry,
};

render(() => <Desktop />, document.getElementById('root')!);
