'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

function getFirebaseApp() {
	return getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
}

/**
 * Request notification permission, obtain an FCM token, and register it
 * with the backend. Safe to call multiple times — skips if already granted.
 */
export async function registerFCMToken(): Promise<void> {
	try {
		if (typeof window === 'undefined') return;
		if (!(await isSupported())) return;

		const permission = await Notification.requestPermission();
		if (permission !== 'granted') return;

		const app = getFirebaseApp();
		const messaging = getMessaging(app);

		const token = await getToken(messaging, {
			vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
			serviceWorkerRegistration: await navigator.serviceWorker.register(
				'/firebase-messaging-sw.js',
			),
		});

		if (!token) return;

		await fetch('/api/notifications/register-device/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ token, platform: 'web' }),
		});
	} catch (err) {
		// Non-fatal — push notifications are a nice-to-have
		console.warn('[FCM] Registration failed:', err);
	}
}
