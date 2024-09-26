// sort-imports-ignore

import { render } from 'solid-js/web';

import { Desktop } from './Desktop';
import { auth } from './firebase';
import { useAppRegistry } from './registry';
import { trpc } from './trpc';

import './apps/register';
import './globals.css';

(window as any)._ = {
	auth,
	trpc,
	appRegistry: useAppRegistry,
};

render(() => <Desktop />, document.getElementById('root')!);
