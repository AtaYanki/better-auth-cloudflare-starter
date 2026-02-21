import { useMutation, useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/utils/trpc";

/**
 * Query hook to fetch customer state from Polar
 */
export function useCustomerState({ enabled = true }: { enabled?: boolean }) {
	return useQuery({
		queryKey: ["polar", "customer", "state"],
		queryFn: async () => {
			const { data } = await authClient.customer.state();
			return data;
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		enabled,
	});
}

export function useSubscriptions() {
	return useQuery({
		queryKey: ["polar", "subscriptions"],
		queryFn: async () => {
			const { data } = await authClient.customer.subscriptions.list();
			return data;
		},
	});
}

export function useOrders() {
	return useQuery({
		queryKey: ["polar", "orders"],
		queryFn: async () => {
			const { data } = await authClient.customer.orders.list();
			return data;
		},
	});
}

/**
 * Query hook to fetch subscription status (pro check resolved server-side)
 */
export function useSubscriptionStatus({
	enabled = true,
}: {
	enabled?: boolean;
}) {
	const trpc = useTRPC();
	return useQuery(
		trpc.subscription.getStatus.queryOptions(undefined, { enabled }),
	);
}

/**
 * Mutation hook to open Polar checkout embed
 */
export function useCheckoutEmbed() {
	return useMutation({
		mutationFn: async (params: { slug: string }) => {
			return authClient.checkoutEmbed(params);
		},
	});
}

/**
 * Mutation hook to open Polar customer portal
 */
export function useCustomerPortal() {
	return useMutation({
		mutationFn: async () => {
			return authClient.customer.portal();
		},
	});
}
