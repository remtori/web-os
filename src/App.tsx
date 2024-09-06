import { Route, Router } from '@solidjs/router';
import { ParentComponent } from 'solid-js';
import { FileExplorer } from './components/FileExplorer';

const AppLayout: ParentComponent = (props) => (
	<div class="flex min-h-screen w-screen flex-col">{props.children}</div>
);

export const App = () => {
	return (
		<Router root={AppLayout}>
			<Route path="/" component={FileExplorer} />
		</Router>
	);
};
