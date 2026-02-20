import type {
	PolarProduct,
	ProductSlug,
} from "@better-auth-cloudflare-starter/auth/lib/polar-products";

export type { PolarProduct, ProductSlug };

export const POLAR_PRODUCTS: Record<ProductSlug, PolarProduct> = {
	pro: {
		id: import.meta.env.VITE_POLAR_PRO_PRODUCT_ID,
		slug: "pro",
		name: "Pro",
		description: "Everything you need to ship faster with advanced features",
	},
} as const;

export function getProductBySlug(slug: ProductSlug): PolarProduct {
	return POLAR_PRODUCTS[slug];
}

export function getProductById(id: string): PolarProduct | undefined {
	return Object.values(POLAR_PRODUCTS).find((product) => product.id === id);
}

export function isProduct(productId: string, slug: ProductSlug): boolean {
	return POLAR_PRODUCTS[slug].id === productId;
}
