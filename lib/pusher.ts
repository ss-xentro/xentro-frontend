import Pusher from 'pusher-js';

// Pusher client configuration
// Set these environment variables in your .env.local:
// NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
// NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster (e.g., 'ap2')

let pusherInstance: Pusher | null = null;

export function getPusher(): Pusher | null {
    if (typeof window === 'undefined') return null;

    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2';

    if (!key) {
        console.warn('[Pusher] No NEXT_PUBLIC_PUSHER_KEY found. Real-time updates disabled.');
        return null;
    }

    if (!pusherInstance) {
        pusherInstance = new Pusher(key, {
            cluster,
            forceTLS: true,
        });
    }

    return pusherInstance;
}

export function subscribeTo(channelName: string) {
    const pusher = getPusher();
    if (!pusher) return null;
    return pusher.subscribe(channelName);
}

export function unsubscribeFrom(channelName: string) {
    const pusher = getPusher();
    if (!pusher) return;
    pusher.unsubscribe(channelName);
}
