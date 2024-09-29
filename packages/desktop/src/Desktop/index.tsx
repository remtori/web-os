import { faUser, faUserSecret } from '@faw/fa-solid';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import Fa from 'solid-fa';
import {
	For,
	Match,
	Show,
	Switch,
	createEffect,
	createMemo,
	createSignal,
} from 'solid-js';

import { useAuthUser } from '@/Login';
import { $WindowServer, WindowServer } from '@/WindowServer';
import { auth } from '@/firebase';
import { useAppRegistry } from '@/registry';
import { usePopper } from '@/use-popper';

import GoogleSvg from '../Login/google-logo.svg';

export function Desktop() {
	const user = useAuthUser();

	const [showUserMenu, setShowUserMenu] = createSignal(!user());

	const [menuTarget, setMenuTarget] = createSignal<HTMLElement>();
	const [menuPopper, setMenuPopper] = createSignal<HTMLElement>();
	const menu = usePopper(menuTarget, menuPopper, {
		placement: 'top-start',
		strategy: 'absolute',
		modifiers: [
			{
				name: 'offset',
				options: {
					offset: [0, 10],
				},
			},
		],
	});

	createEffect(() => {
		if (showUserMenu()) {
			menu()?.update();
		}
	});

	const loginGoogle = () => {
		const provider = new GoogleAuthProvider();
		signInWithPopup(auth, provider).catch((err) => {
			// TODO: Error handling
			console.error(err);
		});
	};

	const apps = useAppRegistry((state) => state.apps);
	const appList = createMemo(() => Object.values(apps()));

	return (
		<div class="flex h-screen w-screen select-none flex-col bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 backdrop-blur-md">
			<WindowServer />
			<div
				ref={setMenuPopper}
				class="flex flex-col items-center rounded-md bg-gray-200 px-2 py-2 text-black"
				classList={{
					hidden: !showUserMenu(),
				}}
			>
				<Switch>
					<Match when={!user()}>
						<div class="font-semibold">Choose a sign in option</div>
						<button
							onclick={loginGoogle}
							class="my-4 flex flex-row items-center justify-center rounded-md bg-white py-2 pl-2 pr-4 font-bold shadow-md"
						>
							<img
								src={GoogleSvg}
								alt="Google Logo"
								class="h-10 w-10 rounded-full bg-white"
							/>
							<span class="ml-2">Sign in with Google</span>
						</button>
					</Match>
					<Match when={user()}>
						<button
							onclick={() => auth.signOut()}
							class="flex flex-row items-center justify-center rounded-md bg-white px-2 font-bold shadow-md"
						>
							Logout
						</button>
					</Match>
				</Switch>
			</div>
			<div class="flex h-14 flex-row justify-start bg-white bg-opacity-50">
				<div class="flex items-center justify-center p-2">
					<button
						ref={setMenuTarget}
						onClick={() => setShowUserMenu((b) => !b)}
						class="flex h-12 w-12 items-center justify-center rounded-full bg-slate-300"
					>
						<Switch>
							<Match when={!user()}>
								<Fa icon={faUserSecret} size="2x" />
							</Match>

							<Match when={user() && !user()!.photoURL}>
								<Fa icon={faUser} size="2x" />
							</Match>
							<Match when={user() && user()!.photoURL}>
								<img
									class="rounded-full"
									src={user()!.photoURL!}
									alt="User profile"
								/>
							</Match>
						</Switch>
					</button>
				</div>
				<div class="flex items-center justify-center p-2">
					<For each={appList()}>
						{(app) => (
							<button
								class="rounded-md bg-white p-2 font-bold"
								onClick={() =>
									$WindowServer.create(
										app.defaultWindow,
										app.id,
									)
								}
							>
								{app.defaultWindow.props.title || 'Untitled'}
							</button>
						)}
					</For>
				</div>
			</div>
		</div>
	);
}
