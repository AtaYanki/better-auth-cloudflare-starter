import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/__authenticated")({
	beforeLoad: async () => {
		const session = await authClient.getSession();
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
