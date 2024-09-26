import { For, Show, createMemo } from 'solid-js';

import { LoginScene, useAuthUser } from '@/Login';
import { $WindowServer, WindowServer } from '@/WindowServer';
import { useAppRegistry } from '@/registry';

export function Desktop() {
	const user = useAuthUser();

	const apps = useAppRegistry((state) => state.apps);
	const appList = createMemo(() => Object.values(apps()));

	return (
		<Show when={user()} fallback={<LoginScene />}>
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
