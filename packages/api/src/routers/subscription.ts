import { env } from "cloudflare:workers";
import { polarClient } from "@better-auth-cloudflare-starter/auth/lib/payments";
import { POLAR_PRODUCTS } from "@better-auth-cloudflare-starter/auth/lib/polar-products";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

export const subscriptionRouter = router({
	getStatus: protectedProcedure.query(async ({ ctx }) => {
		const activeSubscriptions = ctx.customerState?.activeSubscriptions ?? [];

		const isProActive = activeSubscriptions.some(
			(sub) => sub.productId === POLAR_PRODUCTS.pro.id,
		);

		return {
			tier: isProActive ? ("pro" as const) : ("free" as const),
			isProActive,
		};
	}),

	createCheckout: protectedProcedure
		.input(
			z.object({
				slug: z.enum(["pro"]).optional().default("pro"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not found",
				});
			}

			const isAlreadyPro = ctx.customerState?.activeSubscriptions?.some(
				(sub) => sub.productId === POLAR_PRODUCTS.pro.id,
			);

			if (isAlreadyPro) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You already have an active Pro subscription",
				});
			}

			const product = POLAR_PRODUCTS[input.slug];

			try {
				const checkout = await polarClient.checkouts.create({
					products: [product.id],
					externalCustomerId: ctx.session.user.id,
					customerEmail: ctx.session.user.email,
					successUrl: `${env.BETTER_AUTH_URL}/api/payments/native-success?checkout_id={CHECKOUT_ID}`,
				});

				return {
					checkoutUrl: checkout.url,
					checkoutId: checkout.id,
				};
			} catch (error) {
				if (error instanceof Error) {
					console.error(`Polar checkout creation failed: ${error.message}`);
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create checkout session",
				});
			}
		}),
});
