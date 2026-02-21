export type {
	ProductInfo as PolarProduct,
	ProductSlug,
} from "@better-auth-cloudflare-starter/config/products";
export { PRODUCTS as POLAR_PRODUCTS } from "@better-auth-cloudflare-starter/config/products";

import {
	PRODUCTS,
	type ProductSlug,
} from "@better-auth-cloudflare-starter/config/products";

export function getProductBySlug(slug: ProductSlug) {
	return PRODUCTS[slug];
}
