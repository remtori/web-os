import { render } from 'solid-js/web';
import { App } from './App';
import { auth } from './firebase';
import './globals.css';
import { trpc } from './trpc';

(window as any)._ = {
	auth,
	trpc,
};

render(() => <App />, document.getElementById('root')!);
