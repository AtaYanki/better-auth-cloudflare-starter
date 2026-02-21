import { PRODUCTS } from "@better-auth-cloudflare-starter/config/products";

export type ProductSlug = "pro";

export interface PolarProduct {
	id: string;
	slug: ProductSlug;
	name: string;
	description: string;
}

export function getPolarProducts(): Record<ProductSlug, PolarProduct> {
	const productId = process.env.POLAR_PRO_PRODUCT_ID;
	if (!productId) {
		throw new Error(
			"POLAR_PRO_PRODUCT_ID environment variable is required. Set it in your .env file.",
		);
	}
	return {
		pro: { ...PRODUCTS.pro, id: productId },
	} as const;
}

export const POLAR_PRODUCTS = getPolarProducts();

export function getProductBySlug(slug: ProductSlug): PolarProduct {
	return POLAR_PRODUCTS[slug];
}

export function getProductById(id: string): PolarProduct | undefined {
	return Object.values(POLAR_PRODUCTS).find((p) => p.id === id);
}

export function isProduct(productId: string, slug: ProductSlug): boolean {
	return POLAR_PRODUCTS[slug].id === productId;
}
