/**
 * Polar Products Configuration for Auth Package (Server)
 * 
 * NOTE: This must match the product configuration in apps/web/src/lib/polar-products.ts
 * If you change product IDs here, ensure they match in the web app.
 * 
 * In production, product IDs should come from environment variables.
 */

export type ProductSlug = "pro";

export interface PolarProduct {
  id: string;
  slug: ProductSlug;
  name: string;
  description?: string;
}

/**
 * Get Polar products configuration
 * Product IDs can be overridden via environment variables
 */
export function getPolarProducts(env?: { POLAR_PRO_PRODUCT_ID?: string }): Record<ProductSlug, PolarProduct> {
  return {
    pro: {
      id: env?.POLAR_PRO_PRODUCT_ID || "808493dd-7db3-41b4-ba29-c62baa9dda3b",
      slug: "pro",
      name: "Pro",
      description: "Everything you need to ship faster with advanced features",
    },
  } as const;
}

/**
 * Default products (for backwards compatibility)
 * Use getPolarProducts(env) in production to support environment variables
 */
export const POLAR_PRODUCTS = getPolarProducts();

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

