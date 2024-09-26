import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Component } from 'solid-js';

import { auth } from '@/firebase';

import GoogleSvg from './google-logo.svg';

export const LoginScene: Component = () => {
	const loginGoogle = () => {
		const provider = new GoogleAuthProvider();
		signInWithPopup(auth, provider).catch((err) => {
			// TODO: Error handling
			console.error(err);
		});
	};

	return (
		<div class="flex h-screen w-screen select-none flex-col bg-gradient-to-r from-purple-700 via-pink-600 to-red-700 backdrop-blur-md">
			<div class="flex h-full w-full items-center justify-center">
				<div class="flex flex-col items-center">
					<div class="w-full rounded-t-md bg-slate-900 px-2 text-center text-sm font-semibold text-white">
						Login
					</div>
					<div class="flex w-full flex-col items-center rounded-b-md bg-gray-200 px-4 py-2 text-black">
						<div class="font-semibold">
							Please sign in to continue
						</div>
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
					</div>
				</div>
			</div>
		</div>
	);
};
