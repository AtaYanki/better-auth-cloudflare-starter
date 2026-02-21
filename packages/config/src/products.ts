export type ProductSlug = "pro";

export interface ProductInfo {
	slug: ProductSlug;
	name: string;
	description: string;
}

export const PRODUCTS: Record<ProductSlug, ProductInfo> = {
	pro: {
		slug: "pro",
		name: "Pro",
		description: "Everything you need to ship faster with advanced features",
	},
} as const;

export const PRODUCT_SLUGS = Object.keys(PRODUCTS) as ProductSlug[];
