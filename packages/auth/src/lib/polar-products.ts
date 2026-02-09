export type ProductSlug = "pro";

export interface PolarProduct {
	id: string;
	slug: ProductSlug;
	name: string;
	description?: string;
}

export function getPolarProducts(env?: {
	POLAR_PRO_PRODUCT_ID?: string;
}): Record<ProductSlug, PolarProduct> {
	return {
		pro: {
			id: env?.POLAR_PRO_PRODUCT_ID || "808493dd-7db3-41b4-ba29-c62baa9dda3b",
			slug: "pro",
			name: "Pro",
			description: "Everything you need to ship faster with advanced features",
		},
	} as const;
}

export const POLAR_PRODUCTS = getPolarProducts();

export function getProductBySlug(slug: ProductSlug): PolarProduct {
	return POLAR_PRODUCTS[slug];
}

export function getProductById(id: string): PolarProduct | undefined {
	return Object.values(POLAR_PRODUCTS).find((product) => product.id === id);
}

export function isProduct(productId: string, slug: ProductSlug): boolean {
	return POLAR_PRODUCTS[slug].id === productId;
}
