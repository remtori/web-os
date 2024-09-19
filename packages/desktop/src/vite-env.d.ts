declare namespace global {
	namespace process.env {
		const FIREBASE_PROJECT_ID: string;
		const FIREBASE_CLIENT_EMAIL: string;
		const FIREBASE_CLIENT_API_KEY: string;
		const FIREBASE_CLIENT_MESSAGING_SENDER_ID: string;
		const FIREBASE_CLIENT_APP_ID: string;
		const FIREBASE_CLIENT_MEASUREMENT_ID: string;
	}
}

declare module '*.svg' {
	const link: string;
	export default link;
}
