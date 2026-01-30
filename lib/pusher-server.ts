import Pusher from 'pusher';

// Server-side Pusher for broadcasting events
// Set these environment variables in your .env.local:
// PUSHER_APP_ID=your_app_id
// PUSHER_KEY=your_key
// PUSHER_SECRET=your_secret
// PUSHER_CLUSTER=your_cluster

let pusherServer: Pusher | null = null;

function getPusherServer(): Pusher | null {
    const appId = process.env.PUSHER_APP_ID;
    const key = process.env.PUSHER_KEY;
    const secret = process.env.PUSHER_SECRET;
    const cluster = process.env.PUSHER_CLUSTER || 'ap2';

    if (!appId || !key || !secret) {
        console.warn('[Pusher Server] Missing credentials. Real-time broadcasts disabled.');
        return null;
    }

    if (!pusherServer) {
        pusherServer = new Pusher({
            appId,
            key,
            secret,
            cluster,
            useTLS: true,
        });
    }

    return pusherServer;
}

/**
 * Broadcast an event to a channel
 * @param channel - Channel name (e.g., 'institution-{id}')
 * @param event - Event name (e.g., 'project-created')
 * @param data - Event payload
 */
export async function broadcast(channel: string, event: string, data: any): Promise<boolean> {
    const pusher = getPusherServer();
    if (!pusher) {
        console.log(`[Pusher] Would broadcast ${event} to ${channel}:`, data);
        return false;
    }

    try {
        await pusher.trigger(channel, event, data);
        console.log(`[Pusher] Broadcasted ${event} to ${channel}`);
        return true;
    } catch (err) {
        console.error(`[Pusher] Failed to broadcast ${event}:`, err);
        return false;
    }
}

/**
 * Broadcast project events to institution channel
 */
export const projectEvents = {
    created: (institutionId: string, project: any) =>
        broadcast(`institution-${institutionId}`, 'project-created', project),

    updated: (institutionId: string, project: any) =>
        broadcast(`institution-${institutionId}`, 'project-updated', project),

    deleted: (institutionId: string, projectId: string) =>
        broadcast(`institution-${institutionId}`, 'project-deleted', { id: projectId }),
};

/**
 * Broadcast program events to institution channel
 */
export const programEvents = {
    created: (institutionId: string, program: any) =>
        broadcast(`institution-${institutionId}`, 'program-created', program),

    updated: (institutionId: string, program: any) =>
        broadcast(`institution-${institutionId}`, 'program-updated', program),

    deleted: (institutionId: string, programId: string) =>
        broadcast(`institution-${institutionId}`, 'program-deleted', { id: programId }),
};
