import {
	type Channel,
	noopSyncPublisher,
	type SyncEvent,
	type SyncOp,
	type SyncPublisher,
} from "@better-auth-cloudflare-starter/sync";

/**
 * Base class for repositories whose entities participate in the sync engine.
 *
 * Subclasses declare an entity name and how a row maps to broadcast channels;
 * in return, every write they report via emitSync() is fanned out to connected
 * clients as an invalidation event. Adding sync to a new entity means:
 *
 *   class PostRepository extends SyncedRepository<Post> {
 *     protected readonly entity = "post";
 *     protected channelsFor(row: Post): Channel[] {
 *       return [`org:${row.organizationId}`];
 *     }
 *     // call this.emitSync(op, row) after each write resolves
 *   }
 *
 * Events carry metadata only ({entity, op, id}) — never row data.
 */
export abstract class SyncedRepository<TRow extends { id: string }> {
	protected abstract readonly entity: string;
	protected abstract channelsFor(row: TRow): Channel[];

	constructor(
		protected readonly publisher: SyncPublisher = noopSyncPublisher,
	) {}

	/**
	 * Best-effort by design: never throws and never delays the mutation.
	 * Call after the write's `.returning()` resolves so the row is committed
	 * before any client refetches.
	 */
	protected emitSync(op: SyncOp, row: TRow): void {
		try {
			const channels = this.channelsFor(row);
			if (channels.length > 0) {
				this.publisher.publish(channels, {
					entity: this.entity,
					op,
					id: row.id,
				} satisfies SyncEvent);
			}
		} catch (error) {
			console.error(`[sync] failed to publish ${this.entity}.${op}`, error);
		}
	}
}
