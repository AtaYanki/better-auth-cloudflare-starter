/** biome-ignore-all lint/suspicious/noTemplateCurlyInString: insertion payloads are source code containing template literals */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

/**
 * Adds the Polar payment integration to a polar-free tree.
 *
 * Polar-only source files are embedded below (POLAR_FILES) and written out;
 * everything else is an ANCHORED edit. When an anchor no longer matches
 * (because the project diverged from the starter), the step is skipped and
 * reported at the end with the manual instruction — nothing fails silently.
 */

const ROOT = join(import.meta.dirname, "..");

const warnings: string[] = [];

async function editFile(
	filePath: string,
	transform: (content: string) => string,
): Promise<void> {
	let content: string;
	try {
		content = await readFile(filePath, "utf-8");
	} catch {
		warnings.push(`file not found: ${filePath.replace(`${ROOT}/`, "")}`);
		return;
	}
	const updated = transform(content);
	if (updated !== content) {
		await writeFile(filePath, updated);
		console.log(`  modified: ${filePath.replace(`${ROOT}/`, "")}`);
	}
}

/** Insert `insertion` immediately after `anchor`. Warns if anchor missing or insertion already present. */
function insertAfter(
	content: string,
	anchor: string,
	insertion: string,
	manualHint: string,
): string {
	if (content.includes(insertion.trim())) {
		return content;
	}
	if (!content.includes(anchor)) {
		warnings.push(manualHint);
		return content;
	}
	return content.replace(anchor, anchor + insertion);
}

function insertBefore(
	content: string,
	anchor: string,
	insertion: string,
	manualHint: string,
): string {
	if (content.includes(insertion.trim())) {
		return content;
	}
	if (!content.includes(anchor)) {
		warnings.push(manualHint);
		return content;
	}
	return content.replace(anchor, insertion + anchor);
}

function replaceOnce(
	content: string,
	search: string,
	replacement: string,
	manualHint: string,
): string {
	if (content.includes(replacement.trim())) {
		return content;
	}
	if (!content.includes(search)) {
		warnings.push(manualHint);
		return content;
	}
	return content.replace(search, replacement);
}

/**
 * Regex variant for anchors that biome may have reflowed (collapsed
 * multi-line signatures, dropped blank lines). `alreadyApplied` is a probe
 * string proving the edit exists so reruns stay idempotent.
 */
function replacePattern(
	content: string,
	alreadyApplied: string,
	pattern: RegExp,
	replacement: string,
	manualHint: string,
): string {
	if (content.includes(alreadyApplied)) {
		return content;
	}
	if (!pattern.test(content)) {
		warnings.push(manualHint);
		return content;
	}
	return content.replace(pattern, replacement);
}

/**
 * The Polar-only source files, embedded so the polar-free tree carries no
 * visible integration code. Plain (JSON-escaped) text on purpose: init's
 * project rename must still reach the import paths inside these templates.
 */
const POLAR_FILES: Record<string, string> = {
	"packages/auth/src/lib/payments.ts":
		'import { env } from "cloudflare:workers";\nimport { Polar } from "@polar-sh/sdk";\n\nexport const polarClient = new Polar({\n\taccessToken: env.POLAR_ACCESS_TOKEN,\n\tserver: env.NODE_ENV === "production" ? "production" : "sandbox",\n});\n',
	"packages/auth/src/lib/polar-products.ts":
		'import { env } from "cloudflare:workers";\nimport { PRODUCTS } from "@better-auth-cloudflare-starter/config/products";\n\nexport type ProductSlug = "pro";\n\nexport interface PolarProduct {\n\tid: string;\n\tslug: ProductSlug;\n\tname: string;\n\tdescription: string;\n}\n\nexport function getPolarProducts(): Record<ProductSlug, PolarProduct> {\n\tconst productId =\n\t\tprocess.env.POLAR_PRO_PRODUCT_ID ||\n\t\t(env as unknown as Record<string, string>).POLAR_PRO_PRODUCT_ID;\n\tif (!productId) {\n\t\tthrow new Error(\n\t\t\t"POLAR_PRO_PRODUCT_ID environment variable is required. Set it in your .env file.",\n\t\t);\n\t}\n\treturn {\n\t\tpro: { ...PRODUCTS.pro, id: productId },\n\t} as const;\n}\n\nexport const POLAR_PRODUCTS = getPolarProducts();\n\nexport function getProductBySlug(slug: ProductSlug): PolarProduct {\n\treturn POLAR_PRODUCTS[slug];\n}\n\nexport function getProductById(id: string): PolarProduct | undefined {\n\treturn Object.values(POLAR_PRODUCTS).find((p) => p.id === id);\n}\n\nexport function isProduct(productId: string, slug: ProductSlug): boolean {\n\treturn POLAR_PRODUCTS[slug].id === productId;\n}\n',
	"packages/api/src/routers/subscription.ts":
		'import { env } from "cloudflare:workers";\nimport { polarClient } from "@better-auth-cloudflare-starter/auth/lib/payments";\nimport { POLAR_PRODUCTS } from "@better-auth-cloudflare-starter/auth/lib/polar-products";\nimport { TRPCError } from "@trpc/server";\nimport { z } from "zod";\nimport { protectedProcedure, router } from "../index";\n\nexport const subscriptionRouter = router({\n\tgetStatus: protectedProcedure.query(async ({ ctx }) => {\n\t\tconst activeSubscriptions = ctx.customerState?.activeSubscriptions ?? [];\n\n\t\tconst isProActive = activeSubscriptions.some(\n\t\t\t(sub) => sub.productId === POLAR_PRODUCTS.pro.id,\n\t\t);\n\n\t\treturn {\n\t\t\ttier: isProActive ? ("pro" as const) : ("free" as const),\n\t\t\tisProActive,\n\t\t};\n\t}),\n\n\tcreateCheckout: protectedProcedure\n\t\t.input(\n\t\t\tz.object({\n\t\t\t\tslug: z.enum(["pro"]).optional().default("pro"),\n\t\t\t}),\n\t\t)\n\t\t.mutation(async ({ ctx, input }) => {\n\t\t\tif (!ctx.session?.user) {\n\t\t\t\tthrow new TRPCError({\n\t\t\t\t\tcode: "UNAUTHORIZED",\n\t\t\t\t\tmessage: "User not found",\n\t\t\t\t});\n\t\t\t}\n\n\t\t\tconst isAlreadyPro = ctx.customerState?.activeSubscriptions?.some(\n\t\t\t\t(sub) => sub.productId === POLAR_PRODUCTS.pro.id,\n\t\t\t);\n\n\t\t\tif (isAlreadyPro) {\n\t\t\t\tthrow new TRPCError({\n\t\t\t\t\tcode: "FORBIDDEN",\n\t\t\t\t\tmessage: "You already have an active Pro subscription",\n\t\t\t\t});\n\t\t\t}\n\n\t\t\tconst product = POLAR_PRODUCTS[input.slug];\n\n\t\t\ttry {\n\t\t\t\tconst checkout = await polarClient.checkouts.create({\n\t\t\t\t\tproducts: [product.id],\n\t\t\t\t\texternalCustomerId: ctx.session.user.id,\n\t\t\t\t\tcustomerEmail: ctx.session.user.email,\n\t\t\t\t\tsuccessUrl: `${env.BETTER_AUTH_URL}/api/payments/native-success?checkout_id={CHECKOUT_ID}`,\n\t\t\t\t});\n\n\t\t\t\treturn {\n\t\t\t\t\tcheckoutUrl: checkout.url,\n\t\t\t\t\tcheckoutId: checkout.id,\n\t\t\t\t};\n\t\t\t} catch (error) {\n\t\t\t\tif (error instanceof Error) {\n\t\t\t\t\tconsole.error(`Polar checkout creation failed: ${error.message}`);\n\t\t\t\t}\n\t\t\t\tthrow new TRPCError({\n\t\t\t\t\tcode: "INTERNAL_SERVER_ERROR",\n\t\t\t\t\tmessage: "Failed to create checkout session",\n\t\t\t\t});\n\t\t\t}\n\t\t}),\n});\n',
	"apps/web/src/hooks/use-polar.ts":
		'import { useMutation, useQuery } from "@tanstack/react-query";\nimport { authClient } from "@/lib/auth-client";\nimport { useTRPC } from "@/utils/trpc";\n\n/**\n * Query hook to fetch customer state from Polar\n */\nexport function useCustomerState({ enabled = true }: { enabled?: boolean }) {\n\treturn useQuery({\n\t\tqueryKey: ["polar", "customer", "state"],\n\t\tqueryFn: async () => {\n\t\t\tconst { data } = await authClient.customer.state();\n\t\t\treturn data;\n\t\t},\n\t\tstaleTime: 1000 * 60 * 5, // 5 minutes\n\t\tenabled,\n\t});\n}\n\nexport function useSubscriptions() {\n\treturn useQuery({\n\t\tqueryKey: ["polar", "subscriptions"],\n\t\tqueryFn: async () => {\n\t\t\tconst { data } = await authClient.customer.subscriptions.list();\n\t\t\treturn data;\n\t\t},\n\t});\n}\n\nexport function useOrders() {\n\treturn useQuery({\n\t\tqueryKey: ["polar", "orders"],\n\t\tqueryFn: async () => {\n\t\t\tconst { data } = await authClient.customer.orders.list();\n\t\t\treturn data;\n\t\t},\n\t});\n}\n\n/**\n * Query hook to fetch subscription status (pro check resolved server-side)\n */\nexport function useSubscriptionStatus({\n\tenabled = true,\n}: {\n\tenabled?: boolean;\n}) {\n\tconst trpc = useTRPC();\n\treturn useQuery(\n\t\ttrpc.subscription.getStatus.queryOptions(undefined, { enabled }),\n\t);\n}\n\n/**\n * Mutation hook to open Polar checkout embed\n */\nexport function useCheckoutEmbed() {\n\treturn useMutation({\n\t\tmutationFn: async (params: { slug: string }) => {\n\t\t\treturn authClient.checkoutEmbed(params);\n\t\t},\n\t});\n}\n\n/**\n * Mutation hook to open Polar customer portal\n */\nexport function useCustomerPortal() {\n\treturn useMutation({\n\t\tmutationFn: async () => {\n\t\t\treturn authClient.customer.portal();\n\t\t},\n\t});\n}\n',
	"apps/web/src/lib/polar-products.ts":
		'export type {\n\tProductInfo as PolarProduct,\n\tProductSlug,\n} from "@better-auth-cloudflare-starter/config/products";\nexport { PRODUCTS as POLAR_PRODUCTS } from "@better-auth-cloudflare-starter/config/products";\n\nimport {\n\tPRODUCTS,\n\ttype ProductSlug,\n} from "@better-auth-cloudflare-starter/config/products";\n\nexport function getProductBySlug(slug: ProductSlug) {\n\treturn PRODUCTS[slug];\n}\n',
	"apps/web/src/routes/success.tsx":
		'import { createFileRoute, Link, useSearch } from "@tanstack/react-router";\nimport { ArrowRight, CheckCircle2, CreditCard, Home } from "lucide-react";\nimport { z } from "zod";\nimport { Button } from "@/components/ui/button";\nimport {\n\tCard,\n\tCardContent,\n\tCardDescription,\n\tCardHeader,\n\tCardTitle,\n} from "@/components/ui/card";\nimport { authClient } from "@/lib/auth-client";\n\nconst successSearchSchema = z.object({\n\tcheckout_id: z.string().optional().default(""),\n});\n\nexport const Route = createFileRoute("/success")({\n\tcomponent: SuccessPage,\n\tvalidateSearch: (search) => successSearchSchema.parse(search),\n});\n\nfunction SuccessPage() {\n\tconst { checkout_id } = useSearch({ from: "/success" });\n\tconst { data: session } = authClient.useSession();\n\n\treturn (\n\t\t<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">\n\t\t\t<div className="w-full max-w-2xl">\n\t\t\t\t<Card className="border-border/50 bg-card/50 backdrop-blur-sm">\n\t\t\t\t\t<CardHeader className="pb-8 text-center">\n\t\t\t\t\t\t<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">\n\t\t\t\t\t\t\t<CheckCircle2 className="h-12 w-12 text-primary" />\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<CardTitle className="font-bold text-3xl md:text-4xl">\n\t\t\t\t\t\t\tPayment Successful!\n\t\t\t\t\t\t</CardTitle>\n\t\t\t\t\t\t<CardDescription className="mt-4 text-base md:text-lg">\n\t\t\t\t\t\t\tThank you for your purchase. Your subscription is now active and\n\t\t\t\t\t\t\tyou have full access to all features.\n\t\t\t\t\t\t</CardDescription>\n\t\t\t\t\t</CardHeader>\n\t\t\t\t\t<CardContent className="space-y-6">\n\t\t\t\t\t\t{checkout_id && (\n\t\t\t\t\t\t\t<div className="rounded-lg bg-muted/50 p-4">\n\t\t\t\t\t\t\t\t<div className="flex items-center gap-2 text-muted-foreground text-sm">\n\t\t\t\t\t\t\t\t\t<CreditCard className="h-4 w-4" />\n\t\t\t\t\t\t\t\t\t<span>Checkout ID:</span>\n\t\t\t\t\t\t\t\t\t<code className="rounded bg-background px-2 py-1 font-mono text-xs">\n\t\t\t\t\t\t\t\t\t\t{checkout_id}\n\t\t\t\t\t\t\t\t\t</code>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t)}\n\t\t\t\t\t\t<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">\n\t\t\t\t\t\t\t{session ? (\n\t\t\t\t\t\t\t\t<Button asChild className="px-8 py-6 text-lg">\n\t\t\t\t\t\t\t\t\t<Link to="/dashboard">\n\t\t\t\t\t\t\t\t\t\tGo to Dashboard\n\t\t\t\t\t\t\t\t\t\t<ArrowRight className="ml-2 h-5 w-5" />\n\t\t\t\t\t\t\t\t\t</Link>\n\t\t\t\t\t\t\t\t</Button>\n\t\t\t\t\t\t\t) : (\n\t\t\t\t\t\t\t\t<Button asChild className="px-8 py-6 text-lg">\n\t\t\t\t\t\t\t\t\t<Link to="/">\n\t\t\t\t\t\t\t\t\t\t<Home className="mr-2 h-5 w-5" />\n\t\t\t\t\t\t\t\t\t\tGo to Home\n\t\t\t\t\t\t\t\t\t</Link>\n\t\t\t\t\t\t\t\t</Button>\n\t\t\t\t\t\t\t)}\n\t\t\t\t\t\t\t<Button\n\t\t\t\t\t\t\t\tvariant="outline"\n\t\t\t\t\t\t\t\tclassName="border-border/50 bg-background/50 px-8 py-6 text-lg backdrop-blur-sm hover:bg-background/80"\n\t\t\t\t\t\t\t\tasChild\n\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t<Link to="/">Back to Home</Link>\n\t\t\t\t\t\t\t</Button>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div className="pt-4 text-center">\n\t\t\t\t\t\t\t<p className="text-muted-foreground text-sm">\n\t\t\t\t\t\t\t\tA confirmation email has been sent to your email address.\n\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</CardContent>\n\t\t\t\t</Card>\n\t\t\t</div>\n\t\t</div>\n\t);\n}\n',
	"apps/native/hooks/use-subscription.ts":
		'import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";\nimport Constants from "expo-constants";\nimport * as WebBrowser from "expo-web-browser";\nimport { Alert } from "react-native";\nimport { trpc } from "@/utils/trpc";\n\nconst APP_SCHEME = Constants.expoConfig?.scheme as string;\n\nexport function useSubscriptionStatus() {\n\treturn useQuery(trpc.subscription.getStatus.queryOptions());\n}\n\nexport function useCheckout() {\n\tconst queryClient = useQueryClient();\n\n\tconst createCheckoutMutation = useMutation(\n\t\ttrpc.subscription.createCheckout.mutationOptions(),\n\t);\n\n\tasync function checkout() {\n\t\ttry {\n\t\t\tconst result = await createCheckoutMutation.mutateAsync({\n\t\t\t\tslug: "pro",\n\t\t\t});\n\n\t\t\tconst redirectUrl = `${APP_SCHEME}://checkout-success`;\n\t\t\tconst browserResult = await WebBrowser.openAuthSessionAsync(\n\t\t\t\tresult.checkoutUrl,\n\t\t\t\tredirectUrl,\n\t\t\t);\n\n\t\t\tif (browserResult.type === "success") {\n\t\t\t\tqueryClient.invalidateQueries({\n\t\t\t\t\tqueryKey: trpc.subscription.getStatus.queryOptions().queryKey,\n\t\t\t\t});\n\t\t\t\treturn { success: true, checkoutId: result.checkoutId };\n\t\t\t}\n\n\t\t\treturn { success: false, cancelled: browserResult.type === "cancel" };\n\t\t} catch (error: unknown) {\n\t\t\tconst message =\n\t\t\t\terror instanceof Error ? error.message : "Failed to start checkout";\n\t\t\tAlert.alert("Checkout Error", message);\n\t\t\treturn { success: false, error: message };\n\t\t}\n\t}\n\n\treturn {\n\t\tcheckout,\n\t\tisLoading: createCheckoutMutation.isPending,\n\t};\n}\n',
	"apps/web/src/components/landing/pricing.tsx":
		'import { useRouter } from "@tanstack/react-router";\nimport { Badge } from "@/components/ui/badge";\nimport { Button } from "@/components/ui/button";\nimport {\n\tCard,\n\tCardContent,\n\tCardDescription,\n\tCardHeader,\n\tCardTitle,\n} from "@/components/ui/card";\nimport { useCheckoutEmbed } from "@/hooks/use-polar";\n\nexport function Pricing() {\n\tconst router = useRouter();\n\tconst checkoutEmbed = useCheckoutEmbed();\n\n\tconst plans = [\n\t\t{\n\t\t\tname: "Free",\n\t\t\tprice: "$0",\n\t\t\tperiod: "forever",\n\t\t\tdescription:\n\t\t\t\t"Perfect for getting started and building your next project.",\n\t\t\tcta: "Get Started",\n\t\t\tctaAction: () => {\n\t\t\t\treturn router.navigate({\n\t\t\t\t\tto: "/auth/$path",\n\t\t\t\t\tparams: { path: "sign-up" },\n\t\t\t\t});\n\t\t\t},\n\t\t\thighlight: false,\n\t\t},\n\t\t{\n\t\t\tname: "Pro",\n\t\t\tprice: "$10",\n\t\t\tperiod: "monthly",\n\t\t\tdescription:\n\t\t\t\t"Everything you need to ship faster with advanced features. Cancel anytime.",\n\t\t\tcta: "Upgrade to Pro",\n\t\t\tctaAction: () => checkoutEmbed.mutate({ slug: "pro" }),\n\t\t\thighlight: true,\n\t\t},\n\t];\n\n\treturn (\n\t\t<section className="bg-background py-16 md:py-24">\n\t\t\t<div className="container mx-auto px-4">\n\t\t\t\t<div className="mx-auto max-w-6xl">\n\t\t\t\t\t<div className="mb-12 text-center">\n\t\t\t\t\t\t<h2 className="mb-4 font-bold text-3xl md:text-4xl">\n\t\t\t\t\t\t\tChoose Your Plan\n\t\t\t\t\t\t</h2>\n\t\t\t\t\t\t<p className="text-lg text-muted-foreground">\n\t\t\t\t\t\t\tStart free, upgrade to Pro for advanced features.\n\t\t\t\t\t\t</p>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">\n\t\t\t\t\t\t{plans.map((plan) => (\n\t\t\t\t\t\t\t<Card\n\t\t\t\t\t\t\t\tkey={plan.name}\n\t\t\t\t\t\t\t\tclassName={`relative border-border/50 bg-card/50 backdrop-blur-sm ${\n\t\t\t\t\t\t\t\t\tplan.highlight ? "scale-105 border-primary shadow-lg" : ""\n\t\t\t\t\t\t\t\t}`}\n\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t{plan.highlight && (\n\t\t\t\t\t\t\t\t\t<div className="absolute -top-4 left-1/2 -translate-x-1/2">\n\t\t\t\t\t\t\t\t\t\t<Badge className="bg-primary text-primary-foreground">\n\t\t\t\t\t\t\t\t\t\t\tPopular\n\t\t\t\t\t\t\t\t\t\t</Badge>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t)}\n\t\t\t\t\t\t\t\t<CardHeader>\n\t\t\t\t\t\t\t\t\t<CardTitle className="text-2xl">{plan.name}</CardTitle>\n\t\t\t\t\t\t\t\t\t<div className="mt-2 flex items-baseline gap-2">\n\t\t\t\t\t\t\t\t\t\t<span className="font-bold text-4xl">{plan.price}</span>\n\t\t\t\t\t\t\t\t\t\t<span className="text-muted-foreground">\n\t\t\t\t\t\t\t\t\t\t\t/{plan.period}\n\t\t\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<CardDescription className="mt-2">\n\t\t\t\t\t\t\t\t\t\t{plan.description}\n\t\t\t\t\t\t\t\t\t</CardDescription>\n\t\t\t\t\t\t\t\t</CardHeader>\n\t\t\t\t\t\t\t\t<CardContent className="space-y-4">\n\t\t\t\t\t\t\t\t\t<Button\n\t\t\t\t\t\t\t\t\t\tvariant={plan.highlight ? "default" : "outline"}\n\t\t\t\t\t\t\t\t\t\tclassName="w-full"\n\t\t\t\t\t\t\t\t\t\tsize="lg"\n\t\t\t\t\t\t\t\t\t\tonClick={plan.ctaAction}\n\t\t\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t\t\t{plan.cta}\n\t\t\t\t\t\t\t\t\t</Button>\n\t\t\t\t\t\t\t\t</CardContent>\n\t\t\t\t\t\t\t</Card>\n\t\t\t\t\t\t))}\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</section>\n\t);\n}\n',
};

export async function addPolar(root: string): Promise<void> {
	console.log("\n  Adding Polar payment integration...\n");

	// The mobile app is optional; skip all its files when it was removed.
	let hasNative = true;
	try {
		await readFile(join(root, "apps/native/package.json"));
	} catch {
		hasNative = false;
	}

	// --- A. Write the embedded Polar-only files ---
	for (const [file, content] of Object.entries(POLAR_FILES)) {
		if (file.startsWith("apps/native/") && !hasNative) {
			console.log(`  skipped: ${file} (no mobile app)`);
			continue;
		}
		const target = join(root, file);
		await mkdir(dirname(target), { recursive: true });
		await writeFile(target, content);
		console.log(`  created: ${file}`);
	}

	// --- B. Root package.json: catalog entries ---
	await editFile(join(root, "package.json"), (original) => {
		const pkg = JSON.parse(original);
		pkg.workspaces.catalog["@polar-sh/better-auth"] = "1.8.1";
		pkg.workspaces.catalog["@polar-sh/sdk"] = "0.42.5";
		return `${JSON.stringify(pkg, null, "\t")}\n`;
	});

	// --- C. packages/auth/package.json: dependencies ---
	await editFile(join(root, "packages/auth/package.json"), (original) => {
		const pkg = JSON.parse(original);
		pkg.dependencies["@polar-sh/better-auth"] = "catalog:";
		pkg.dependencies["@polar-sh/sdk"] = "catalog:";
		return `${JSON.stringify(pkg, null, "\t")}\n`;
	});

	// --- D. apps/web/package.json: dependency ---
	await editFile(join(root, "apps/web/package.json"), (original) => {
		const pkg = JSON.parse(original);
		pkg.dependencies["@polar-sh/better-auth"] = "catalog:";
		return `${JSON.stringify(pkg, null, "\t")}\n`;
	});

	// --- E. packages/auth/src/index.ts: imports, afterDelete, polar plugin ---
	await editFile(join(root, "packages/auth/src/index.ts"), (original) => {
		let content = original;
		content = insertAfter(
			content,
			'import { env } from "cloudflare:workers";\n',
			'import { checkout, polar, portal } from "@polar-sh/better-auth";\nimport { polarClient } from "./lib/payments";\nimport { POLAR_PRODUCTS } from "./lib/polar-products";\n',
			"packages/auth/src/index.ts: add imports for @polar-sh/better-auth (checkout, polar, portal), ./lib/payments (polarClient), ./lib/polar-products (POLAR_PRODUCTS)",
		);
		content = replaceOnce(
			content,
			"deleteUser: {\n\t\t\tenabled: true,\n\t\t},",
			"deleteUser: {\n\t\t\tenabled: true,\n\t\t\tafterDelete: async (user) => {\n\t\t\t\tawait polarClient.customers.deleteExternal({\n\t\t\t\t\texternalId: user.id,\n\t\t\t\t});\n\t\t\t},\n\t\t},",
			"packages/auth/src/index.ts: add an afterDelete callback to user.deleteUser that calls polarClient.customers.deleteExternal({ externalId: user.id })",
		);
		content = insertBefore(
			content,
			"\t\torganization({",
			"\t\tpolar({\n\t\t\tclient: polarClient,\n\t\t\tcreateCustomerOnSignUp: true,\n\t\t\tenableCustomerPortal: true,\n\t\t\tuse: [\n\t\t\t\tcheckout({\n\t\t\t\t\tproducts: [\n\t\t\t\t\t\t{\n\t\t\t\t\t\t\tproductId: POLAR_PRODUCTS.pro.id,\n\t\t\t\t\t\t\tslug: POLAR_PRODUCTS.pro.slug,\n\t\t\t\t\t\t},\n\t\t\t\t\t],\n\t\t\t\t\tsuccessUrl: `${env.POLAR_SUCCESS_URL}?checkout_id={checkout_id}`,\n\t\t\t\t\tauthenticatedUsersOnly: true,\n\t\t\t\t}),\n\t\t\t\tportal(),\n\t\t\t],\n\t\t}),\n",
			"packages/auth/src/index.ts: add the polar({...}) plugin (client, createCustomerOnSignUp, checkout + portal) to the betterAuth plugins array",
		);
		return content;
	});

	// --- F. packages/api/src/routers/index.ts: subscription router ---
	await editFile(
		join(root, "packages/api/src/routers/index.ts"),
		(original) => {
			let content = original;
			content = insertAfter(
				content,
				'import { todoRouter } from "./todo";\n',
				'import { subscriptionRouter } from "./subscription";\n',
				'packages/api/src/routers/index.ts: import { subscriptionRouter } from "./subscription"',
			);
			content = insertAfter(
				content,
				"\ttodo: todoRouter,\n",
				"\tsubscription: subscriptionRouter,\n",
				"packages/api/src/routers/index.ts: register `subscription: subscriptionRouter` on appRouter",
			);
			return content;
		},
	);

	// --- G. packages/api/src/context.ts: customerState ---
	await editFile(join(root, "packages/api/src/context.ts"), (original) => {
		let content = original;
		content = insertAfter(
			content,
			"type SessionResult = Awaited<ReturnType<typeof auth.api.getSession>>;\n",
			"type CustomerStateResult = Awaited<ReturnType<typeof auth.api.state>>;\n",
			"packages/api/src/context.ts: add `type CustomerStateResult = Awaited<ReturnType<typeof auth.api.state>>`",
		);
		content = insertAfter(
			content,
			"\t\t\tsession?: SessionResult;\n",
			"\t\t\tcustomerState?: CustomerStateResult;\n",
			"packages/api/src/context.ts: add `customerState?: CustomerStateResult` to the context Variables type",
		);
		content = replaceOnce(
			content,
			'\t// Reuse session from Hono auth middleware to avoid redundant fetches\n\tconst session = context.get("session") ?? null;\n',
			'\t// Reuse session and customerState from Hono auth middleware to avoid redundant fetches\n\tconst session = context.get("session") ?? null;\n\tconst customerState = context.get("customerState") ?? null;\n',
			'packages/api/src/context.ts: read `const customerState = context.get("customerState") ?? null` in createContext',
		);
		content = insertAfter(
			content,
			"\treturn {\n\t\tsession,\n",
			"\t\tcustomerState,\n",
			"packages/api/src/context.ts: include `customerState` in the createContext return object",
		);
		return content;
	});

	// --- H. packages/api/src/services/todo-service.ts: tier limits ---
	await editFile(
		join(root, "packages/api/src/services/todo-service.ts"),
		(original) => {
			let content = original;
			content = insertBefore(
				content,
				'import type { TodoRepository } from "@better-auth-cloudflare-starter/db/repositories";\n',
				'import { POLAR_PRODUCTS } from "@better-auth-cloudflare-starter/auth/lib/polar-products";\n',
				"packages/api/src/services/todo-service.ts: import POLAR_PRODUCTS from @better-auth-cloudflare-starter/auth/lib/polar-products",
			);
			content = insertAfter(
				content,
				'import { TRPCError } from "@trpc/server";\n',
				'import type { Context } from "../context";\n',
				'packages/api/src/services/todo-service.ts: import type { Context } from "../context"',
			);
			content = insertBefore(
				content,
				"export class TodoService {",
				"const TIER_LIMITS = {\n\tfree: {\n\t\tmaxTodos: 10,\n\t},\n\tpro: {\n\t\tmaxTodos: Number.POSITIVE_INFINITY,\n\t},\n} as const;\n\n",
				"packages/api/src/services/todo-service.ts: add the TIER_LIMITS constant (free: 10, pro: Infinity)",
			);
			content = insertAfter(
				content,
				"constructor(private readonly todoRepository: TodoRepository) {}\n",
				'\n\tprivate async checkTodoLimit(\n\t\tuserId: string,\n\t\tcontext: Context,\n\t): Promise<void> {\n\t\tconst totalCount = await this.todoRepository.getTotalCount(userId);\n\n\t\tconst tier = await this.getUserTier(context);\n\t\tconst limit = TIER_LIMITS[tier].maxTodos;\n\n\t\tif (totalCount >= limit) {\n\t\t\tthrow new TRPCError({\n\t\t\t\tcode: "FORBIDDEN",\n\t\t\t\tmessage: `You\'ve reached your ${tier} plan limit of ${limit} todos. Upgrade to Pro for unlimited todos.`,\n\t\t\t});\n\t\t}\n\t}\n\n\tprivate async getUserTier(context: Context): Promise<"free" | "pro"> {\n\t\tconst customerState = context.customerState;\n\t\tif (\n\t\t\t(customerState?.activeSubscriptions ?? []).some(\n\t\t\t\t(subscription) => subscription.productId === POLAR_PRODUCTS.pro.id,\n\t\t\t)\n\t\t) {\n\t\t\treturn "pro";\n\t\t}\n\t\treturn "free";\n\t}\n',
				"packages/api/src/services/todo-service.ts: add the private checkTodoLimit/getUserTier methods (see extras docs)",
			);
			content = replacePattern(
				content,
				"await this.checkTodoLimit(userId, context);",
				/async create\(\s*userId: string,\s*data: \{ title: string; description\?: string \},?\s*\) \{(\s*)(const newTodo)/,
				"async create(\n\t\tuserId: string,\n\t\tdata: { title: string; description?: string },\n\t\tcontext: Context,\n\t) {\n\t\tawait this.checkTodoLimit(userId, context);\n$1$2",
				"packages/api/src/services/todo-service.ts: add a `context: Context` param to create() and call `await this.checkTodoLimit(userId, context)` first",
			);
			return content;
		},
	);

	// --- I. packages/api/src/routers/todo.ts: pass ctx to create ---
	await editFile(join(root, "packages/api/src/routers/todo.ts"), (original) =>
		replaceOnce(
			original,
			"ctx.services.todos.create(ctx.session.user.id, input)",
			"ctx.services.todos.create(ctx.session.user.id, input, ctx)",
			"packages/api/src/routers/todo.ts: pass `ctx` as the third argument to services.todos.create",
		),
	);

	// --- J. apps/server/src/index.ts: customerState type + native-success route ---
	await editFile(join(root, "apps/server/src/index.ts"), (original) => {
		let content = original;
		content = insertAfter(
			content,
			"\tsession?: Awaited<ReturnType<typeof auth.api.getSession>>;\n",
			"\tcustomerState?: Awaited<ReturnType<typeof auth.api.state>>;\n",
			"apps/server/src/index.ts: add `customerState?: Awaited<ReturnType<typeof auth.api.state>>` to AuthVariables",
		);
		content = insertAfter(
			content,
			'app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));\n',
			'\napp.get("/api/payments/native-success", (c) => {\n\tconst checkoutId = c.req.query("checkout_id") || "";\n\tif (!/^[a-zA-Z0-9_-]{0,200}$/.test(checkoutId)) {\n\t\treturn c.text("Invalid checkout ID", 400);\n\t}\n\tconst appScheme = "better-auth-cloudflare-starter";\n\tconst deepLink = `${appScheme}://checkout-success?checkout_id=${encodeURIComponent(checkoutId)}`;\n\n\treturn c.html(`<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>Payment Successful</title>\n<meta http-equiv="refresh" content="0;url=${deepLink}">\n</head>\n<body style="font-family:system-ui;text-align:center;padding:2rem;">\n<h1>Payment Successful!</h1>\n<p>Redirecting you back to the app...</p>\n<p><a href="${deepLink}">Tap here if you are not redirected automatically</a></p>\n<script>window.location.href="${deepLink}";</script>\n</body>\n</html>`);\n});\n',
			"apps/server/src/index.ts: add the GET /api/payments/native-success deep-link route (see git history)",
		);
		return content;
	});

	// --- K. apps/server/src/middleware/auth.ts: customerState fetch ---
	await editFile(
		join(root, "apps/server/src/middleware/auth.ts"),
		(original) => {
			let content = original;
			content = insertAfter(
				content,
				'\t\tc.set("session", session);\n',
				'\n\t\t// Get customer state if user is authenticated\n\t\tif (session?.user) {\n\t\t\tconst customerState = await auth.api.state({\n\t\t\t\theaders: c.req.raw.headers,\n\t\t\t});\n\t\t\tc.set("customerState", customerState);\n\t\t} else {\n\t\t\tc.set("customerState", undefined);\n\t\t}\n',
				'apps/server/src/middleware/auth.ts: after setting the session, fetch auth.api.state for authenticated users and c.set("customerState", ...)',
			);
			content = replaceOnce(
				content,
				'\t\tc.set("session", undefined);\n\t}',
				'\t\tc.set("session", undefined);\n\t\tc.set("customerState", undefined);\n\t}',
				'apps/server/src/middleware/auth.ts: also c.set("customerState", undefined) in the catch block',
			);
			return content;
		},
	);

	// --- L. apps/web/src/lib/auth-client.ts: polarClient plugin ---
	await editFile(join(root, "apps/web/src/lib/auth-client.ts"), (original) => {
		let content = original;
		content = insertBefore(
			content,
			'import { createAuthClient } from "better-auth/react";\n',
			'import { polarClient } from "@polar-sh/better-auth";\n',
			'apps/web/src/lib/auth-client.ts: import { polarClient } from "@polar-sh/better-auth"',
		);
		content = replacePattern(
			content,
			"polarClient(),",
			/plugins: \[\s*/,
			"plugins: [\n\t\tpolarClient(),\n\t\t",
			"apps/web/src/lib/auth-client.ts: add polarClient() to the auth client plugins array",
		);
		return content;
	});

	// --- M. apps/web/src/components/header.tsx: Upgrade to Pro ---
	await editFile(
		join(root, "apps/web/src/components/header.tsx"),
		(original) => {
			let content = original;
			content = replacePattern(
				content,
				"Sparkles",
				/import \{\s*([^}]*?),?\s*\} from "lucide-react";/,
				'import { $1, Sparkles } from "lucide-react";',
				"apps/web/src/components/header.tsx: add Sparkles to the lucide-react import",
			);
			content = insertBefore(
				content,
				'import { useScrollPosition } from "@/hooks/use-scroll-position";\n',
				'import { useCheckoutEmbed, useSubscriptionStatus } from "@/hooks/use-polar";\n',
				"apps/web/src/components/header.tsx: import useCheckoutEmbed/useSubscriptionStatus from @/hooks/use-polar",
			);
			content = insertAfter(
				content,
				"\tconst location = useLocation();\n",
				"\tconst checkoutEmbed = useCheckoutEmbed();\n",
				"apps/web/src/components/header.tsx: add `const checkoutEmbed = useCheckoutEmbed()`",
			);
			content = insertAfter(
				content,
				"\tconst { data: session } = authClient.useSession();\n",
				"\tconst { data: subscriptionStatus } = useSubscriptionStatus({\n\t\tenabled: !!session,\n\t});\n\n\tconst hasPro = subscriptionStatus?.isProActive ?? false;\n",
				"apps/web/src/components/header.tsx: derive subscriptionStatus/hasPro from useSubscriptionStatus",
			);
			content = insertBefore(
				content,
				'\t\t\t\t\t\t\t\t\t<Link to="/todos">',
				'\t\t\t\t\t\t\t\t\t{!hasPro && (\n\t\t\t\t\t\t\t\t\t\t<DropdownMenuItem\n\t\t\t\t\t\t\t\t\t\t\tonClick={() => checkoutEmbed.mutate({ slug: "pro" })}\n\t\t\t\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t\t\t\t<Sparkles />\n\t\t\t\t\t\t\t\t\t\t\tUpgrade to Pro\n\t\t\t\t\t\t\t\t\t\t</DropdownMenuItem>\n\t\t\t\t\t\t\t\t\t)}\n',
				'apps/web/src/components/header.tsx: add the "Upgrade to Pro" DropdownMenuItem before the /todos link',
			);
			return content;
		},
	);

	// --- N. apps/web/src/routes/__authenticated/todos.tsx: tier UI ---
	await editFile(
		join(root, "apps/web/src/routes/__authenticated/todos.tsx"),
		(original) => {
			let content = original;
			content = insertBefore(
				content,
				'import { useSync } from "@/lib/sync";\n',
				'import { useCheckoutEmbed, useSubscriptionStatus } from "@/hooks/use-polar";\nimport { authClient } from "@/lib/auth-client";\n',
				"apps/web/src/routes/__authenticated/todos.tsx: import use-polar hooks and authClient",
			);
			content = insertBefore(
				content,
				"function TodosPage() {",
				"const FREE_TIER_LIMIT = 10;\n\n",
				"apps/web/src/routes/__authenticated/todos.tsx: add `const FREE_TIER_LIMIT = 10`",
			);
			content = insertAfter(
				content,
				'\tconst [description, setDescription] = useState("");\n',
				"\tconst { data: session } = authClient.useSession();\n\tconst { data: subscriptionStatus } = useSubscriptionStatus({\n\t\tenabled: !!session,\n\t});\n\tconst checkoutEmbed = useCheckoutEmbed();\n\n\tconst hasPro = subscriptionStatus?.isProActive ?? false;\n",
				"apps/web/src/routes/__authenticated/todos.tsx: add session/subscriptionStatus/checkoutEmbed/hasPro state",
			);
			content = insertBefore(
				content,
				"\t// Live connection count for this user across tabs/devices (sync engine presence).",
				"\tconst todoCount = stats.data?.total || 0;\n\tconst isAtLimit = !hasPro && todoCount >= FREE_TIER_LIMIT;\n\n",
				"apps/web/src/routes/__authenticated/todos.tsx: derive todoCount/isAtLimit from stats",
			);
			content = insertBefore(
				content,
				"\t\t\t{/* Create Todo Form */}",
				'\t\t\t{/* Tier Limit Warning */}\n\t\t\t{!hasPro && (\n\t\t\t\t<Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20">\n\t\t\t\t\t<CardHeader>\n\t\t\t\t\t\t<CardTitle className="flex items-center gap-2 text-sm">\n\t\t\t\t\t\t\t<Badge variant="outline">Free Plan</Badge>\n\t\t\t\t\t\t\t{todoCount}/{FREE_TIER_LIMIT} todos used\n\t\t\t\t\t\t</CardTitle>\n\t\t\t\t\t\t<CardDescription>\n\t\t\t\t\t\t\t{isAtLimit\n\t\t\t\t\t\t\t\t? "You\'ve reached your free plan limit. Upgrade to Pro for unlimited todos!"\n\t\t\t\t\t\t\t\t: `You can create ${FREE_TIER_LIMIT - todoCount} more todos on the free plan.`}\n\t\t\t\t\t\t</CardDescription>\n\t\t\t\t\t</CardHeader>\n\t\t\t\t\t{isAtLimit && (\n\t\t\t\t\t\t<CardContent>\n\t\t\t\t\t\t\t<Button\n\t\t\t\t\t\t\t\tonClick={() => checkoutEmbed.mutate({ slug: "pro" })}\n\t\t\t\t\t\t\t\tsize="sm"\n\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\tUpgrade to Pro\n\t\t\t\t\t\t\t</Button>\n\t\t\t\t\t\t</CardContent>\n\t\t\t\t\t)}\n\t\t\t\t</Card>\n\t\t\t)}\n\n',
				"apps/web/src/routes/__authenticated/todos.tsx: add the Tier Limit Warning card before the Create Todo form",
			);
			content = replacePattern(
				content,
				"Create unlimited todos with Pro",
				/<CardDescription>\s*Create a new todo\s*<\/CardDescription>/,
				'<CardDescription>\n\t\t\t\t\t\t{hasPro\n\t\t\t\t\t\t\t? "Create unlimited todos with Pro"\n\t\t\t\t\t\t\t: `Free plan: ${FREE_TIER_LIMIT - todoCount} remaining`}\n\t\t\t\t\t</CardDescription>',
				"apps/web/src/routes/__authenticated/todos.tsx: show the remaining-quota copy in the Add New Todo card description",
			);
			content = content.replaceAll(
				"disabled={createTodo.isPending}",
				"disabled={createTodo.isPending || isAtLimit}",
			);
			content = content.replace(
				"disabled={createTodo.isPending || !title.trim()}",
				"disabled={createTodo.isPending || !title.trim() || isAtLimit}",
			);
			return content;
		},
	);

	// --- O. apps/web landing: Pricing section ---
	await editFile(
		join(root, "apps/web/src/components/landing/index.ts"),
		(original) =>
			insertAfter(
				original,
				'export { Hero } from "./hero";\n',
				'export { Pricing } from "./pricing";\n',
				'apps/web/src/components/landing/index.ts: export { Pricing } from "./pricing"',
			),
	);
	await editFile(join(root, "apps/web/src/routes/index.tsx"), (original) => {
		let content = original;
		content = replaceOnce(
			content,
			'import { Hero } from "@/components/landing";',
			'import { Hero, Pricing } from "@/components/landing";',
			"apps/web/src/routes/index.tsx: import Pricing from @/components/landing",
		);
		content = insertAfter(
			content,
			"\t\t\t<Hero />\n",
			"\t\t\t<Pricing />\n",
			"apps/web/src/routes/index.tsx: render <Pricing /> after <Hero />",
		);
		return content;
	});

	// --- P. apps/native: checkout deep link + subscription card ---
	if (!hasNative) {
		console.log("  skipped: apps/native edits (no mobile app)");
	}
	if (hasNative) {
		await editFile(join(root, "apps/native/app/_layout.tsx"), (original) => {
			let content = original;
			content = insertBefore(
				content,
				'import { Stack } from "expo-router";\n',
				'import * as Linking from "expo-linking";\n',
				"apps/native/app/_layout.tsx: import * as Linking from expo-linking",
			);
			content = replaceOnce(
				content,
				'import { useCallback } from "react";',
				'import { useCallback, useEffect } from "react";',
				"apps/native/app/_layout.tsx: add useEffect to the react import",
			);
			content = insertAfter(
				content,
				"export default function Layout() {\n",
				'\tconst url = Linking.useURL();\n\n\tuseEffect(() => {\n\t\tif (url) {\n\t\t\tconst parsed = Linking.parse(url);\n\t\t\tif (\n\t\t\t\tparsed.hostname === "checkout-success" ||\n\t\t\t\tparsed.path === "checkout-success"\n\t\t\t) {\n\t\t\t\tconst checkoutId = parsed.queryParams?.checkout_id;\n\t\t\t\tif (typeof checkoutId === "string" && checkoutId.length > 0) {\n\t\t\t\t\tqueryClient.invalidateQueries();\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}, [url]);\n',
				"apps/native/app/_layout.tsx: add the checkout-success deep-link useEffect (see extras docs)",
			);
			return content;
		});

		await editFile(
			join(root, "apps/native/app/(tabs)/profile.tsx"),
			(original) => {
				let content = original;
				content = replaceOnce(
					content,
					'import { Avatar, Button, Card, Chip, Switch } from "heroui-native";',
					'import { Avatar, Button, Card, Chip, Spinner, Switch } from "heroui-native";',
					"apps/native/app/(tabs)/profile.tsx: add Spinner to the heroui-native import",
				);
				content = insertBefore(
					content,
					"\tPressable,\n",
					"\tActivityIndicator,\n",
					"apps/native/app/(tabs)/profile.tsx: add ActivityIndicator to the react-native import",
				);
				content = insertAfter(
					content,
					'import { useAppTheme } from "@/contexts/app-theme-context";\n',
					'import { useCheckout, useSubscriptionStatus } from "@/hooks/use-subscription";\n',
					"apps/native/app/(tabs)/profile.tsx: import useCheckout/useSubscriptionStatus from @/hooks/use-subscription",
				);
				content = insertAfter(
					content,
					"\tconst { toggleTheme, isDark } = useAppTheme();\n",
					"\tconst { data: subscriptionStatus, isLoading: isSubLoading } =\n\t\tuseSubscriptionStatus();\n\tconst { checkout, isLoading: isCheckoutLoading } = useCheckout();\n",
					"apps/native/app/(tabs)/profile.tsx: add the subscription status + checkout hooks",
				);
				content = insertBefore(
					content,
					"\t\t\t\t{/* Settings */}",
					'\t\t\t\t{/* Subscription */}\n\t\t\t\t<Card variant="secondary" className="p-6">\n\t\t\t\t\t<Card.Title className="mb-4">Subscription</Card.Title>\n\t\t\t\t\t{isSubLoading ? (\n\t\t\t\t\t\t<View className="items-center py-4">\n\t\t\t\t\t\t\t<Spinner />\n\t\t\t\t\t\t</View>\n\t\t\t\t\t) : (\n\t\t\t\t\t\t<View className="gap-4">\n\t\t\t\t\t\t\t<View className="flex-row items-center justify-between">\n\t\t\t\t\t\t\t\t<Text className="text-foreground text-sm">Current Plan</Text>\n\t\t\t\t\t\t\t\t<Chip\n\t\t\t\t\t\t\t\t\tvariant="soft"\n\t\t\t\t\t\t\t\t\tcolor={\n\t\t\t\t\t\t\t\t\t\tsubscriptionStatus?.isProActive ? "success" : "default"\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t\t<Chip.Label>\n\t\t\t\t\t\t\t\t\t\t{subscriptionStatus?.isProActive ? "Pro" : "Free"}\n\t\t\t\t\t\t\t\t\t</Chip.Label>\n\t\t\t\t\t\t\t\t</Chip>\n\t\t\t\t\t\t\t</View>\n\n\t\t\t\t\t\t\t{subscriptionStatus?.isProActive ? (\n\t\t\t\t\t\t\t\t<Text className="text-muted text-sm">\n\t\t\t\t\t\t\t\t\tYou have access to all Pro features including unlimited todos.\n\t\t\t\t\t\t\t\t</Text>\n\t\t\t\t\t\t\t) : (\n\t\t\t\t\t\t\t\t<View className="gap-3">\n\t\t\t\t\t\t\t\t\t<Text className="text-muted text-sm">\n\t\t\t\t\t\t\t\t\t\tUpgrade to Pro for unlimited todos and advanced features.\n\t\t\t\t\t\t\t\t\t</Text>\n\t\t\t\t\t\t\t\t\t<Button\n\t\t\t\t\t\t\t\t\t\tonPress={() => checkout()}\n\t\t\t\t\t\t\t\t\t\tisDisabled={isCheckoutLoading}\n\t\t\t\t\t\t\t\t\t\tsize="lg"\n\t\t\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t\t\t{isCheckoutLoading ? (\n\t\t\t\t\t\t\t\t\t\t\t<ActivityIndicator color="white" size="small" />\n\t\t\t\t\t\t\t\t\t\t) : (\n\t\t\t\t\t\t\t\t\t\t\t<Button.Label>Upgrade to Pro</Button.Label>\n\t\t\t\t\t\t\t\t\t\t)}\n\t\t\t\t\t\t\t\t\t</Button>\n\t\t\t\t\t\t\t\t</View>\n\t\t\t\t\t\t\t)}\n\t\t\t\t\t\t</View>\n\t\t\t\t\t)}\n\t\t\t\t</Card>\n\n',
					"apps/native/app/(tabs)/profile.tsx: add the Subscription card before the Settings card",
				);
				return content;
			},
		);
	}

	// --- Q. Env files ---
	const envInsert = (original: string) =>
		insertBefore(
			original,
			"# R2 Storage",
			'# Payment Service (Polar.sh)\nPOLAR_ACCESS_TOKEN="polar_your-access-token"\nPOLAR_SUCCESS_URL="http://localhost:3001/success"\n\n# Polar Product ID\nPOLAR_PRO_PRODUCT_ID="your-product-id"\n\n',
			"apps/server/.env(.example): add POLAR_ACCESS_TOKEN, POLAR_SUCCESS_URL, POLAR_PRO_PRODUCT_ID",
		);
	await editFile(join(root, "apps/server/.env.example"), envInsert);
	await editFile(join(root, "apps/server/.env"), envInsert);

	// --- R. apps/server/wrangler.jsonc: POLAR_SUCCESS_URL vars ---
	await editFile(join(root, "apps/server/wrangler.jsonc"), (original) => {
		let content = original;
		if (!content.includes("POLAR_SUCCESS_URL")) {
			content = content.replace(
				/( *)"BETTER_AUTH_URL": "http:\/\/localhost:3000"/g,
				'$1"BETTER_AUTH_URL": "http://localhost:3000",\n$1"POLAR_SUCCESS_URL": "http://localhost:3001/success"',
			);
			content = content.replace(
				/( *)"BETTER_AUTH_URL": "https:\/\/your-api-domain\.com"/g,
				'$1"BETTER_AUTH_URL": "https://your-api-domain.com",\n$1"POLAR_SUCCESS_URL": "https://your-frontend-domain.com/success"',
			);
			if (!content.includes("POLAR_SUCCESS_URL")) {
				warnings.push(
					'apps/server/wrangler.jsonc: add "POLAR_SUCCESS_URL" to the vars of every environment block',
				);
			}
		}
		return content;
	});

	// --- S. apps/server/vitest.config.ts: dummy bindings ---
	await editFile(join(root, "apps/server/vitest.config.ts"), (original) =>
		insertAfter(
			original,
			'RESEND_API_KEY: "re_test_dummy",\n',
			'\t\t\t\t\t\tPOLAR_ACCESS_TOKEN: "polar_test_dummy",\n\t\t\t\t\t\tPOLAR_PRO_PRODUCT_ID: "00000000-0000-0000-0000-000000000000",\n\t\t\t\t\t\tPOLAR_SUCCESS_URL: "http://localhost:3001/success",\n',
			"apps/server/vitest.config.ts: add POLAR_ACCESS_TOKEN/POLAR_PRO_PRODUCT_ID/POLAR_SUCCESS_URL dummy bindings",
		),
	);

	// --- T. Restore tier-limit tests ---
	await editFile(
		join(root, "apps/server/src/__tests__/todo-service.test.ts"),
		() => `import { POLAR_PRODUCTS } from "@better-auth-cloudflare-starter/auth/lib/polar-products";
import type { Context } from "@better-auth-cloudflare-starter/api/context";
import { TodoService } from "@better-auth-cloudflare-starter/api/services/todo-service";
import type {
	Repositories,
	TodoRepository,
} from "@better-auth-cloudflare-starter/db/repositories";
import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";

type Todo = Awaited<ReturnType<TodoRepository["create"]>>;

function fakeTodo(overrides: Partial<Todo> = {}): Todo {
	return {
		id: "t1",
		userId: "u1",
		title: "test",
		description: null,
		completed: false,
		createdAt: new Date(),
		updatedAt: new Date(),
		...overrides,
	};
}

function fakeRepository(totalCount: number): TodoRepository {
	return {
		create: async (data: Partial<Todo>) => fakeTodo(data),
		findById: async () => null,
		findByUserId: async () => [],
		getCompletedCount: async () => 0,
		getTotalCount: async () => totalCount,
		update: async () => null,
		delete: async () => false,
		toggleComplete: async () => null,
	} as unknown as TodoRepository;
}

function contextWithTier(tier: "free" | "pro"): Context {
	return {
		session: null,
		customerState:
			tier === "pro"
				? { activeSubscriptions: [{ productId: POLAR_PRODUCTS.pro.id }] }
				: { activeSubscriptions: [] },
		services: { todos: {} } as unknown as Repositories,
	} as unknown as Context;
}

describe("TodoService tier limits", () => {
	it("allows free users below the limit", async () => {
		const service = new TodoService(fakeRepository(9));
		const todo = await service.create(
			"u1",
			{ title: "ok" },
			contextWithTier("free"),
		);
		expect(todo.title).toBe("ok");
	});

	it("blocks free users at the 10-todo limit with FORBIDDEN", async () => {
		const service = new TodoService(fakeRepository(10));
		await expect(
			service.create("u1", { title: "nope" }, contextWithTier("free")),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
	});

	it("lets pro users create past the free limit", async () => {
		const service = new TodoService(fakeRepository(10_000));
		const todo = await service.create(
			"u1",
			{ title: "unlimited" },
			contextWithTier("pro"),
		);
		expect(todo.title).toBe("unlimited");
	});

	it("throws NOT_FOUND when deleting a missing todo", async () => {
		const service = new TodoService(fakeRepository(0));
		await expect(service.delete("missing", "u1")).rejects.toBeInstanceOf(
			TRPCError,
		);
	});
});
`,
	);

	// --- U. Regenerate types, install, format ---
	console.log("\n  running: bun install...\n");
	const install = Bun.spawnSync(["bun", "install"], {
		cwd: root,
		stdio: ["inherit", "inherit", "inherit"],
	});
	if (install.exitCode !== 0) {
		warnings.push("bun install failed — run it manually");
	}

	console.log("\n  running: bun run cf-typegen...\n");
	const cfTypegen = Bun.spawnSync(["bun", "run", "cf-typegen"], {
		cwd: join(root, "apps/server"),
		stdio: ["inherit", "inherit", "inherit"],
	});
	if (cfTypegen.exitCode !== 0) {
		warnings.push(
			"cf-typegen failed — run `bun run cf-typegen` in apps/server",
		);
	}

	console.log("\n  running: bun run check (formatting + import order)...\n");
	Bun.spawnSync(["bun", "run", "check"], {
		cwd: root,
		stdio: ["inherit", "inherit", "inherit"],
	});

	// --- Report ---
	if (warnings.length > 0) {
		console.log("\n  ⚠ Some steps could not be applied automatically");
		console.log("    (the file diverged from the starter). Apply manually:\n");
		for (const warning of warnings) {
			console.log(`    - ${warning}`);
		}
	}

	console.log(`
  Polar integration added. Next steps:
    1. Create a product at https://polar.sh and copy its product id
    2. Set POLAR_ACCESS_TOKEN and POLAR_PRO_PRODUCT_ID in apps/server/.env
    3. For production: wrangler secret put POLAR_ACCESS_TOKEN / POLAR_PRO_PRODUCT_ID,
       and update POLAR_SUCCESS_URL in apps/server/wrangler.jsonc
`);
}

if (import.meta.main) {
	await addPolar(ROOT);
}
