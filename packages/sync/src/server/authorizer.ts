import { type Channel, parseChannel } from "../channels";

export interface AuthorizeInput {
	channelType: string;
	channelId: string;
	userId: string;
}

export type ChannelAuthorizer = (
	input: AuthorizeInput,
) => boolean | Promise<boolean>;

export type AuthorizeResult =
	| { ok: true; channel: Channel }
	| { ok: false; status: 400 | 403; reason: string };

/**
 * Maps channel types to authorization rules. DEFAULT DENY: an unparseable
 * channel, an unregistered channel type, or an authorizer that returns false
 * or throws all result in denial. New projects add channel types by
 * registering an authorizer — nothing is accessible until they do.
 */
export class ChannelAuthorizerRegistry {
	private authorizers = new Map<string, ChannelAuthorizer>();

	register(channelType: string, authorizer: ChannelAuthorizer): this {
		this.authorizers.set(channelType, authorizer);
		return this;
	}

	async authorize(
		rawChannel: string,
		userId: string,
	): Promise<AuthorizeResult> {
		const parsed = parseChannel(rawChannel);
		if (!parsed) {
			return { ok: false, status: 400, reason: "Invalid channel" };
		}
		const authorizer = this.authorizers.get(parsed.type);
		if (!authorizer) {
			return { ok: false, status: 403, reason: "Unknown channel type" };
		}
		try {
			const allowed = await authorizer({
				channelType: parsed.type,
				channelId: parsed.id,
				userId,
			});
			if (!allowed) {
				return { ok: false, status: 403, reason: "Forbidden" };
			}
		} catch (error) {
			console.error(`[sync] authorizer for "${parsed.type}" threw`, error);
			return { ok: false, status: 403, reason: "Forbidden" };
		}
		return { ok: true, channel: rawChannel as Channel };
	}
}

/** Built-in rule for `user:{id}` channels: only the user themself. */
export const userChannelAuthorizer: ChannelAuthorizer = ({
	channelId,
	userId,
}) => channelId === userId;
