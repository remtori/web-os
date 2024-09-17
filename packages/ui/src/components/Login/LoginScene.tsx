import { auth } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Component } from 'solid-js';
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
		<div class="select-none bg-gradient-to-r from-purple-700 via-pink-600 to-red-700 backdrop-blur-md h-screen w-screen flex flex-col">
			<div class="flex h-full w-full justify-center items-center">
				<div class="flex flex-col items-center">
					<div class="bg-slate-900 rounded-t-md px-2 w-full text-white text-center font-semibold text-sm">
						Login
					</div>
					<div class="w-full rounded-b-md flex flex-col items-center text-black px-4 py-2 bg-gray-200">
						<div class="font-semibold">
							Please sign in to continue
						</div>
						<button
							onclick={loginGoogle}
							class="flex flex-row justify-center items-center font-bold py-2 pl-2 pr-4 my-4 rounded-md bg-white shadow-md"
						>
							<img
								src={GoogleSvg}
								alt="Google Logo"
								class="w-10 h-10 bg-white rounded-full"
							/>
							<span class="ml-2">Sign in with Google</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
