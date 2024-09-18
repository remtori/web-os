import { createSignal, For, lazy, Show, ValidComponent } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { App, useAppRegistry } from '@/AppRegistry';
import { LoginScene } from '@/components/Login';
import { WindowWidget } from '@/components/WindowWidget';
import { auth } from '@/firebase';

type RunningWindow = {
	id: string;
	component: ValidComponent;
};

export function Desktop() {
	const [isLoggedIn, setIsLoggedIn] = createSignal(false);
	auth.authStateReady().then(() => setIsLoggedIn(!!auth.currentUser));
	auth.onAuthStateChanged((user) => {
		setIsLoggedIn(!!user);
	});

	const { apps } = useAppRegistry();
	const [windows, setWindows] = createSignal<RunningWindow[]>([]);

	const removeWindow = (id: string) => {
		setWindows((child) => child.filter((window) => window.id !== id));
	};

	const addWindow = (app: App) => {
		const id = `${app.id}-${Date.now() % 100_000}`;
		const WindowComponent = lazy(() =>
			Promise.resolve(app.component()).then((c) => ({
				default: c,
			})),
		);

		setWindows((child) => [
			...child,
			{
				id,
				component: () => (
					<WindowWidget
						init={/*@once*/ app.meta}
						close={/*@once*/ () => removeWindow(id)}
					>
						<WindowComponent />
					</WindowWidget>
				),
			},
		]);
	};

	return (
		<Show when={isLoggedIn()} fallback={<LoginScene />}>
			<div class="select-none bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 backdrop-blur-md h-screen w-screen flex flex-col">
				<div class="flex h-full w-full relative">
					<For each={windows()}>
						{(window) => <Dynamic component={window.component} />}
					</For>
				</div>
				<div class="h-12 bg-white bg-opacity-50 flex justify-center flex-row">
					<div class="flex justify-center items-center p-2">
						<For each={apps()}>
							{(app) => (
								<button
									class="bg-sky-300 rounded-md p-2 font-bold"
									onClick={() => addWindow(app)}
								>
									{app.meta.title || 'Untitled'}
								</button>
							)}
						</For>
					</div>
				</div>
			</div>
		</Show>
	);
}
