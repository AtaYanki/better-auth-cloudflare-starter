import { authClient } from "@/lib/auth-client";
import { useQuery, useMutation } from "@tanstack/react-query";

/**
 * Query hook to fetch customer state from Polar
 */
export function useCustomerState({enabled = true}: {enabled?: boolean}) {
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
 * Mutation hook to open Polar checkout embed
 */
export function useCheckoutEmbed() {
  return useMutation({
    mutationFn: async (params: { productId: string; slug: string }) => {
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
