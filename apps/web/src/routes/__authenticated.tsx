import { getUser } from "@/functions/get-user";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/__authenticated")({
  beforeLoad: async () => {
    const session = await getUser();
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
