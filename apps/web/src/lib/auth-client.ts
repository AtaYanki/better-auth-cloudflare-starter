import { polarClient } from "@polar-sh/better-auth";
import { createAuthClient } from "better-auth/react";
import { adminClient, emailOTPClient } from "better-auth/client/plugins";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: SERVER_URL,
  plugins: [polarClient(), adminClient(), emailOTPClient()],
});
