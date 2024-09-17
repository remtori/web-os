import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
	apiKey: process.env.FIREBASE_CLIENT_API_KEY,
	authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
	projectId: process.env.FIREBASE_PROJECT_ID,
	storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
	messagingSenderId: process.env.FIREBASE_CLIENT_MESSAGING_SENDER_ID,
	appId: process.env.FIREBASE_CLIENT_APP_ID,
	measurementId: process.env.FIREBASE_CLIENT_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
