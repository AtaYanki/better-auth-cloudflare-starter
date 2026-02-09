import type { AppRouter } from "@better-auth-cloudflare-starter/api/routers/index";
import { createTRPCContext } from "@trpc/tanstack-react-query";

export const { TRPCProvider, useTRPC, useTRPCClient } =
	createTRPCContext<AppRouter>();
