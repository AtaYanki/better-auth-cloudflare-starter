import type { InvalidateMessage } from "../protocol";

export type QueryKeyLike = readonly unknown[];

export interface EntityRegistration {
	/** Coarse keys invalidated on reconnect catch-up (e.g. tRPC pathKey()). */
	rootKeys: () => readonly QueryKeyLike[];
	/** Fine-grained keys to invalidate for a live event. */
	onEvent: (event: InvalidateMessage) => readonly QueryKeyLike[];
}

export interface SyncQueryRegistry {
	register(entity: string, registration: EntityRegistration): SyncQueryRegistry;
	keysFor(event: InvalidateMessage): readonly QueryKeyLike[];
	allRootKeys(): readonly QueryKeyLike[];
}

/**
 * Maps sync entities to TanStack Query keys. Configured once per app:
 *
 *   createSyncQueryRegistry().register("todo", {
 *     rootKeys: () => [trpc.todo.pathKey()],
 *     onEvent: (e) => [trpc.todo.list.queryKey(), trpc.todo.stats.queryKey()],
 *   })
 *
 * Unknown entities are ignored with a warning — servers may ship new synced
 * entities before clients register them.
 */
export function createSyncQueryRegistry(): SyncQueryRegistry {
	const registrations = new Map<string, EntityRegistration>();
	const warned = new Set<string>();
	return {
		register(entity, registration) {
			registrations.set(entity, registration);
			return this;
		},
		keysFor(event) {
			const registration = registrations.get(event.entity);
			if (!registration) {
				if (!warned.has(event.entity)) {
					warned.add(event.entity);
					console.warn(
						`[sync] no query registration for entity "${event.entity}" — ignoring its events`,
					);
				}
				return [];
			}
			return registration.onEvent(event);
		},
		allRootKeys() {
			return [...registrations.values()].flatMap((r) => r.rootKeys());
		},
	};
}
