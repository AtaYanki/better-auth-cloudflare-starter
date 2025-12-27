import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@better-auth-cloudflare-starter/api/routers/index";

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();
