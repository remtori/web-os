import type { UserInfo } from 'firebase/auth';
import { Accessor, createSignal } from 'solid-js';

import { auth } from '@/firebase';

const LOCAL_CACHE_KEY = 'auth-user';

auth.onAuthStateChanged((user) => {
	if (user) {
		localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(user.toJSON()));
	} else {
		localStorage.removeItem(LOCAL_CACHE_KEY);
	}
});

export const useAuthUser = (): Accessor<UserInfo | null> => {
	const [user, setUser] = createSignal<UserInfo | null>(
		JSON.parse(localStorage.getItem(LOCAL_CACHE_KEY) || 'null'),
	);

	auth.authStateReady().then(() => setUser(auth.currentUser));
	auth.onAuthStateChanged((user) => setUser(user));

	return user;
};
