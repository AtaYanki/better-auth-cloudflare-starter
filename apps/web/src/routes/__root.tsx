import type { AppRouter } from "@better-auth-cloudflare-starter/api/routers/index";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import Footer from "../components/footer";
import Header from "../components/header";
import appCss from "../index.css?url";

export interface RouterAppContext {
	trpc: TRPCOptionsProxy<AppRouter>;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Better Auth Cloudflare Starter",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				href: "/favicon.png",
				type: "image/png",
			},
		],
	}),

	shellComponent: RootDocument,
});

function RootDocument() {
	return (
		<html lang="en" suppressHydrationWarning className="dark">
			<head>
				<HeadContent />
			</head>
			<body>
				<Providers>
					<div className="flex min-h-svh flex-col">
						<Header />
						<main className="flex-1">
							<Outlet />
						</main>
						<Footer />
					</div>
				</Providers>
				<Toaster richColors />
				<TanStackRouterDevtools position="bottom-left" />
				<ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
				<Scripts />
			</body>
		</html>
	);
}
