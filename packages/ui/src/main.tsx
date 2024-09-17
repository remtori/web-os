import { Desktop } from '@/components/Desktop';
import { render } from 'solid-js/web';
import { auth } from './firebase';
import './globals.css';
import { trpc } from './trpc';

(window as any)._ = {
	auth,
	trpc,
};

render(() => <Desktop />, document.getElementById('root')!);
