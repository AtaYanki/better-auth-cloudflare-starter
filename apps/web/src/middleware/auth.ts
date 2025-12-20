import { authClient } from "@/lib/auth-client";
import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const headers = getRequestHeaders();
  const session = await authClient.getSession({
    fetchOptions: {
      headers: headers,
      throw: true,
    },
  });

  return next({
    context: { session },
  });
});
