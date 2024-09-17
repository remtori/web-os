import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export const app = initializeApp({
	credential: cert({
		projectId: process.env.FIREBASE_PROJECT_ID!,
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
		// Loaded env doesnt support newline escape character so this is a quick fix
		privateKey: process.env.FIREBASE_PRIVATE_KEY!.replaceAll('\\n', '\n'),
	}),
});

export const auth = getAuth(app);
