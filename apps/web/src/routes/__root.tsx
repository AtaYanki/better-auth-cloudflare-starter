import type { AppRouter } from "@better-auth-cloudflare-starter/api/routers/index";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	ErrorComponent,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { lazy } from "react";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import Footer from "../components/footer";
import Header from "../components/header";
import appCss from "../index.css?url";

const TanStackRouterDevtools =
	process.env.NODE_ENV === "production"
		? () => null
		: lazy(() =>
				import("@tanstack/react-router-devtools").then((res) => ({
					default: res.TanStackRouterDevtools,
				})),
			);

const ReactQueryDevtools =
	process.env.NODE_ENV === "production"
		? () => null
		: lazy(() =>
				import("@tanstack/react-query-devtools").then((res) => ({
					default: res.ReactQueryDevtools,
				})),
			);

export interface RouterAppContext {
	trpc: TRPCOptionsProxy<AppRouter>;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	errorComponent: ({ error }) => {
		return (
			<div className="flex min-h-svh items-center justify-center p-8">
				<div className="max-w-md text-center">
					<h1 className="mb-4 font-bold text-2xl">Something went wrong</h1>
					<p className="mb-6 text-muted-foreground">
						{error instanceof Error
							? error.message
							: "An unexpected error occurred"}
					</p>
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
					>
						Reload Page
					</button>
				</div>
			</div>
		);
	},
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
