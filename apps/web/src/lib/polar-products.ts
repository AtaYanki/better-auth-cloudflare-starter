/**
 * Polar Products Configuration for Web App
 *
 * NOTE: This must match the product configuration in packages/auth/src/index.ts
 * If you change product IDs here, ensure they match in the auth package.
 */

export type ProductSlug = "pro";

export interface PolarProduct {
	id: string;
	slug: ProductSlug;
	name: string;
	description?: string;
}

/**
 * Dictionary of all Polar products
 * Product IDs should come from environment variables in production
 */
export const POLAR_PRODUCTS: Record<ProductSlug, PolarProduct> = {
	pro: {
		id:
			import.meta.env.VITE_POLAR_PRO_PRODUCT_ID ||
			"808493dd-7db3-41b4-ba29-c62baa9dda3b",
		slug: "pro",
		name: "Pro",
		description: "Everything you need to ship faster with advanced features",
	},
} as const;

/**
 * Get a product by slug
 */
export function getProductBySlug(slug: ProductSlug): PolarProduct {
	return POLAR_PRODUCTS[slug];
}

/**
 * Get a product by ID
 */
export function getProductById(id: string): PolarProduct | undefined {
	return Object.values(POLAR_PRODUCTS).find((product) => product.id === id);
}

/**
 * Check if a product ID matches a specific product slug
 */
export function isProduct(productId: string, slug: ProductSlug): boolean {
	return POLAR_PRODUCTS[slug].id === productId;
}
