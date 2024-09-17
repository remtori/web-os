import { FileExplorer } from '@/apps/FileExplorer';
import { LoginScene } from '@/components/Login';
import { WindowWidget } from '@/components/WindowWidget';
import { auth } from '@/firebase';
import { createSignal, Show } from 'solid-js';

export function Desktop() {
	const [isLoggedIn, setIsLoggedIn] = createSignal(false);
	auth.authStateReady().then(() => setIsLoggedIn(!!auth.currentUser));
	auth.onAuthStateChanged((user) => {
		setIsLoggedIn(!!user);
	});

	return (
		<Show when={isLoggedIn()} fallback={<LoginScene />}>
			<div class="select-none bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 backdrop-blur-md h-screen w-screen flex flex-col">
				<div class="flex h-full w-full relative">
					<WindowWidget>
						<FileExplorer />
					</WindowWidget>
				</div>
				<div class="h-12 bg-white bg-opacity-50 flex justify-center flex-row">
					<div class="flex justify-center items-center p-2">
						<div class="w-10 h-10 bg-gray-300 rounded-full"></div>
					</div>
				</div>
			</div>
		</Show>
	);
}