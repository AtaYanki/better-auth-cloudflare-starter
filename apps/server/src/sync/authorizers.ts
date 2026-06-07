import { isOrgMember } from "@better-auth-cloudflare-starter/db/queries/membership";
import {
	ChannelAuthorizerRegistry,
	userChannelAuthorizer,
} from "@better-auth-cloudflare-starter/sync/server";

/**
 * Channel authorization rules for this app. The registry is DEFAULT DENY:
 * channel types without an entry here are unreachable. When adding a new
 * channel type (e.g. `doc:{id}`), register its rule here.
 */
export const syncAuthorizers = new ChannelAuthorizerRegistry()
	// `user:{id}` — only the user themself.
	.register("user", userChannelAuthorizer)
	// `org:{id}` — current members of the organization only.
	.register("org", ({ channelId, userId }) => isOrgMember(channelId, userId));
