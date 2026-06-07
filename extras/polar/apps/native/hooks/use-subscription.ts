import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { Alert } from "react-native";
import { trpc } from "@/utils/trpc";

const APP_SCHEME = Constants.expoConfig?.scheme as string;

export function useSubscriptionStatus() {
	return useQuery(trpc.subscription.getStatus.queryOptions());
}

export function useCheckout() {
	const queryClient = useQueryClient();

	const createCheckoutMutation = useMutation(
		trpc.subscription.createCheckout.mutationOptions(),
	);

	async function checkout() {
		try {
			const result = await createCheckoutMutation.mutateAsync({
				slug: "pro",
			});

			const redirectUrl = `${APP_SCHEME}://checkout-success`;
			const browserResult = await WebBrowser.openAuthSessionAsync(
				result.checkoutUrl,
				redirectUrl,
			);

			if (browserResult.type === "success") {
				queryClient.invalidateQueries({
					queryKey: trpc.subscription.getStatus.queryOptions().queryKey,
				});
				return { success: true, checkoutId: result.checkoutId };
			}

			return { success: false, cancelled: browserResult.type === "cancel" };
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Failed to start checkout";
			Alert.alert("Checkout Error", message);
			return { success: false, error: message };
		}
	}

	return {
		checkout,
		isLoading: createCheckoutMutation.isPending,
	};
}
