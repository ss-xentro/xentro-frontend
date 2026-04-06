// Firebase Cloud Messaging service worker — handles background push notifications.
// This file is served from /firebase-messaging-sw.js (Next.js public/ folder).

importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
	apiKey: 'AIzaSyCw-CD5nCCzuKpFFs3S1dJyzNlYcC42Eh8',
	authDomain: 'xentro-7de6d.firebaseapp.com',
	projectId: 'xentro-7de6d',
	storageBucket: 'xentro-7de6d.firebasestorage.app',
	messagingSenderId: '617554871084',
	appId: '1:617554871084:web:f62061d56fff946bc3e289',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
	const title = payload.notification?.title ?? 'Xentro';
	const body = payload.notification?.body ?? '';
	const icon = '/xentro-logo.png';

	self.registration.showNotification(title, {
		body,
		icon,
		data: payload.data ?? {},
	});
});

// On notification click — focus existing tab or open the app
self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const url = event.notification.data?.url ?? '/';
	event.waitUntil(
		clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
			for (const client of clientList) {
				if (client.url.includes(self.location.origin) && 'focus' in client) {
					return client.focus();
				}
			}
			return clients.openWindow(url);
		}),
	);
});
