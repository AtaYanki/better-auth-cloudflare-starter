import { authClient } from "@/lib/auth-client";
import { authMiddleware } from "@/middleware/auth";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const getUserList = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { data: users } = await authClient.admin.listUsers({
      query: {
        limit: 100,
        offset: 0,
      },
      fetchOptions: {
        headers: getRequestHeaders(),
      },
    });
    return users?.users;
  });
