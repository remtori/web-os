import {
	For,
	Show,
	ValidComponent,
	createEffect,
	createMemo,
	createSignal,
	lazy,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { LoginScene } from '@/components/Login';
import { WindowWidget } from '@/components/WindowWidget';
import { auth } from '@/firebase';
import { App, useAppRegistry } from '@/registry';

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

	const apps = useAppRegistry((state) => state.apps);
	const appList = createMemo(() => Object.values(apps()));

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
			<div class="flex h-screen w-screen select-none flex-col bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 backdrop-blur-md">
				<div class="relative flex h-full w-full">
					<For each={windows()}>
						{(window) => <Dynamic component={window.component} />}
					</For>
				</div>
				<div class="flex h-12 flex-row justify-center bg-white bg-opacity-50">
					<div class="flex items-center justify-center p-2">
						<For each={appList()}>
							{(app) => (
								<button
									class="rounded-md bg-sky-300 p-2 font-bold"
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
