import { polarClient } from "@polar-sh/better-auth";
import { createAuthClient } from "better-auth/react";
import { adminClient, emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL,
  plugins: [polarClient(), adminClient(), emailOTPClient()],
});
