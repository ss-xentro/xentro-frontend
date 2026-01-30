'use client';

import { useEffect, useRef } from 'react';
import { subscribeTo, unsubscribeFrom } from '@/lib/pusher';
import type { Channel } from 'pusher-js';

type EventHandlers = Record<string, (data: any) => void>;

/**
 * Hook to subscribe to real-time Pusher events
 * 
 * @example
 * useRealtime(`institution-${institutionId}`, {
 *   'project-created': (data) => addProject(data),
 *   'project-updated': (data) => updateProject(data.id, data),
 *   'project-deleted': (data) => removeProject(data.id),
 * });
 */
export function useRealtime(channelName: string | null, handlers: EventHandlers) {
    const channelRef = useRef<Channel | null>(null);
    const handlersRef = useRef(handlers);

    // Update handlers ref when handlers change
    useEffect(() => {
        handlersRef.current = handlers;
    }, [handlers]);

    useEffect(() => {
        if (!channelName) return;

        // Subscribe to channel
        const channel = subscribeTo(channelName);
        if (!channel) return;

        channelRef.current = channel;

        // Bind all event handlers
        const eventNames = Object.keys(handlersRef.current);
        eventNames.forEach((eventName) => {
            channel.bind(eventName, (data: any) => {
                handlersRef.current[eventName]?.(data);
            });
        });

        // Cleanup on unmount
        return () => {
            eventNames.forEach((eventName) => {
                channel.unbind(eventName);
            });
            unsubscribeFrom(channelName);
            channelRef.current = null;
        };
    }, [channelName]);

    return channelRef.current;
}

/**
 * Hook to subscribe to institution-specific real-time events
 */
export function useInstitutionRealtime(
    institutionId: string | null,
    handlers: {
        onProjectCreated?: (project: any) => void;
        onProjectUpdated?: (project: any) => void;
        onProjectDeleted?: (data: { id: string }) => void;
        onProgramCreated?: (program: any) => void;
        onProgramUpdated?: (program: any) => void;
        onProgramDeleted?: (data: { id: string }) => void;
    }
) {
    const eventHandlers: EventHandlers = {};

    if (handlers.onProjectCreated) eventHandlers['project-created'] = handlers.onProjectCreated;
    if (handlers.onProjectUpdated) eventHandlers['project-updated'] = handlers.onProjectUpdated;
    if (handlers.onProjectDeleted) eventHandlers['project-deleted'] = handlers.onProjectDeleted;
    if (handlers.onProgramCreated) eventHandlers['program-created'] = handlers.onProgramCreated;
    if (handlers.onProgramUpdated) eventHandlers['program-updated'] = handlers.onProgramUpdated;
    if (handlers.onProgramDeleted) eventHandlers['program-deleted'] = handlers.onProgramDeleted;

    return useRealtime(
        institutionId ? `institution-${institutionId}` : null,
        eventHandlers
    );
}
