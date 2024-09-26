import { For, Show, createMemo, createSignal } from 'solid-js';

import { LoginScene } from '@/Login';
import { $WindowServer, WindowServer } from '@/WindowServer';
import { auth } from '@/firebase';
import { useAppRegistry } from '@/registry';

export function Desktop() {
	const [isLoggedIn, setIsLoggedIn] = createSignal(false);
	auth.authStateReady().then(() => setIsLoggedIn(!!auth.currentUser));
	auth.onAuthStateChanged((user) => {
		setIsLoggedIn(!!user);
	});

	const apps = useAppRegistry((state) => state.apps);
	const appList = createMemo(() => Object.values(apps()));

	return (
		<Show when={isLoggedIn()} fallback={<LoginScene />}>
			<div class="flex h-screen w-screen select-none flex-col bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 backdrop-blur-md">
				<WindowServer />
				<div class="flex h-12 flex-row justify-center bg-white bg-opacity-50">
					<div class="flex items-center justify-center p-2">
						<For each={appList()}>
							{(app) => (
								<button
									class="rounded-md bg-sky-300 p-2 font-bold"
									onClick={() =>
										$WindowServer.create(
											app.defaultWindow,
											app.id,
										)
									}
								>
									{app.defaultWindow.props.title ||
										'Untitled'}
								</button>
							)}
						</For>
					</div>
				</div>
			</div>
		</Show>
	);
}
