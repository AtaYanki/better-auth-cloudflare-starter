import {
	type Channel,
	orgChannel,
	type PresenceMember,
	type PresenceMessage,
	userChannel,
} from "@better-auth-cloudflare-starter/sync";
import {
	createSyncQueryRegistry,
	useSyncEngine,
} from "@better-auth-cloudflare-starter/sync/react";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/utils/trpc";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

interface SyncContextValue {
	/** Latest presence roster per channel. */
	presence: Partial<Record<Channel, PresenceMember[]>>;
	/** The signed-in user's own channel, when connected. */
	userChannel: Channel | null;
	sendBroadcast: (channel: Channel, topic: string, payload: unknown) => void;
}

const SyncContext = createContext<SyncContextValue>({
	presence: {},
	userChannel: null,
	sendBroadcast: () => {},
});

export const useSync = () => useContext(SyncContext);

/**
 * Mounts the real-time sync engine: subscribes to the user's channel (and the
 * active organization's channel when present) and translates invalidation
 * events into TanStack Query invalidations. Presence rosters are exposed via
 * useSync().
 *
 * To sync a new entity: register it below, and have its repository extend
 * SyncedRepository on the server. That's the whole checklist.
 */
export function SyncProvider({ children }: { children: React.ReactNode }) {
	const trpc = useTRPC();
	const { data: session } = authClient.useSession();
	const { data: activeOrg } = authClient.useActiveOrganization();
	const [presence, setPresence] = useState<
		Partial<Record<Channel, PresenceMember[]>>
	>({});

	const registry = useMemo(
		() =>
			createSyncQueryRegistry().register("todo", {
				rootKeys: () => [trpc.todo.pathKey()],
				onEvent: () => [trpc.todo.list.queryKey(), trpc.todo.stats.queryKey()],
			}),
		[trpc],
	);

	const userId = session?.user.id;
	const orgId = activeOrg?.id;
	const ownChannel = userId ? userChannel(userId) : null;
	const channels = useMemo<Channel[]>(
		() =>
			ownChannel ? [ownChannel, ...(orgId ? [orgChannel(orgId)] : [])] : [],
		[ownChannel, orgId],
	);

	const onPresence = useCallback(
		(channel: Channel, message: PresenceMessage) => {
			setPresence((previous) => {
				const members = previous[channel] ?? [];
				switch (message.event) {
					case "snapshot":
						return { ...previous, [channel]: message.members };
					case "join":
						return members.some((m) => m.userId === message.userId)
							? previous
							: {
									...previous,
									[channel]: [
										...members,
										{ userId: message.userId, connections: 1 },
									],
								};
					case "leave":
						return {
							...previous,
							[channel]: members.filter((m) => m.userId !== message.userId),
						};
				}
			});
		},
		[],
	);

	const { sendBroadcast } = useSyncEngine({
		enabled: Boolean(userId),
		baseUrl: SERVER_URL,
		channels,
		registry,
		onPresence,
	});

	const value = useMemo<SyncContextValue>(
		() => ({ presence, userChannel: ownChannel, sendBroadcast }),
		[presence, ownChannel, sendBroadcast],
	);

	return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}
