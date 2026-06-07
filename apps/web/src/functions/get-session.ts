import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { authClient } from "@/lib/auth-client";

/**
 * Resolves the session on the server by forwarding the incoming request's
 * cookies — `authClient.getSession()` alone has no cookie jar during SSR, so
 * route guards calling it server-side would always see a signed-out user.
 */
export const getServerSession = createServerFn().handler(async () => {
	const { data } = await authClient.getSession({
		fetchOptions: {
			headers: getRequestHeaders(),
		},
	});
	return data;
});
