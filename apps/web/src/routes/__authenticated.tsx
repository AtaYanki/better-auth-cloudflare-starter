import { createFileRoute, redirect } from "@tanstack/react-router";
import { getServerSession } from "@/functions/get-session";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/__authenticated")({
	beforeLoad: async () => {
		// getSession() resolves to a `{ data, error }` wrapper — unwrap it, and
		// on the server forward the request cookies (SSR has no cookie jar).
		const session =
			typeof window === "undefined"
				? await getServerSession()
				: (await authClient.getSession()).data;
		return { session };
	},
	loader: async ({ context }) => {
		if (!context.session) {
			throw redirect({
				to: "/auth/$path",
				params: { path: "sign-in" },
			});
		}
	},
});
