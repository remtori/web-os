import { render } from 'solid-js/web';
import { App } from './App';
import { auth } from './firebase';
import './globals.css';

console.log(auth);

render(() => <App />, document.getElementById('root')!);
