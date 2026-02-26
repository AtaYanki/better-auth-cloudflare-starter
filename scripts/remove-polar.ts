import { readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

async function deleteFile(filePath: string): Promise<void> {
	try {
		await unlink(filePath);
		console.log(`  deleted: ${filePath.split("/").slice(-3).join("/")}`);
	} catch {
		// File may not exist
	}
}

async function editFile(
	filePath: string,
	transform: (content: string) => string,
): Promise<void> {
	const content = await readFile(filePath, "utf-8");
	const updated = transform(content);
	if (updated !== content) {
		await writeFile(filePath, updated);
		console.log(`  modified: ${filePath.split("/").slice(-3).join("/")}`);
	}
}

export async function removePolar(root: string): Promise<void> {
	console.log("\n  Removing Polar payment integration...\n");

	// --- A. Delete Polar-only files ---
	const filesToDelete = [
		"packages/auth/src/lib/payments.ts",
		"packages/auth/src/lib/polar-products.ts",
		"packages/api/src/routers/subscription.ts",
		"apps/web/src/hooks/use-polar.ts",
		"apps/web/src/lib/polar-products.ts",
		"apps/web/src/routes/success.tsx",
		"apps/native/hooks/use-subscription.ts",
		"apps/web/src/components/landing/pricing.tsx",
	];

	for (const file of filesToDelete) {
		await deleteFile(join(root, file));
	}

	// --- B. Modify packages/auth/src/index.ts ---
	await editFile(join(root, "packages/auth/src/index.ts"), (content) => {
		// Remove polar imports
		content = content.replace(
			/import\s*\{[^}]*\}\s*from\s*"@polar-sh\/better-auth";\n/,
			"",
		);
		content = content.replace(
			/import\s*\{[^}]*\}\s*from\s*"\.\/lib\/payments";\n/,
			"",
		);
		content = content.replace(
			/import\s*\{[^}]*\}\s*from\s*"\.\/lib\/polar-products";\n/,
			"",
		);

		// Replace deleteUser block (remove afterDelete callback, keep enabled: true)
		content = content.replace(
			/deleteUser:\s*\{[\s\S]*?\n\t\t\},/s,
			"deleteUser: {\n\t\t\tenabled: true,\n\t\t},",
		);

		// Remove the entire polar({...}) plugin block
		content = content.replace(
			/\t\tpolar\(\{[\s\S]*?\n\t\t\}\),\n/,
			"",
		);

		return content;
	});

	// --- C. Modify packages/auth/package.json ---
	await editFile(join(root, "packages/auth/package.json"), (content) => {
		content = content.replace(/\s*"@polar-sh\/better-auth":\s*"catalog:",?\n/, "\n");
		content = content.replace(/\s*"@polar-sh\/sdk":\s*"catalog:",?\n/, "\n");
		// Clean up potential trailing comma before closing brace
		content = content.replace(/,(\s*\})/g, "$1");
		return content;
	});

	// --- D. Modify packages/api/src/routers/index.ts ---
	await editFile(
		join(root, "packages/api/src/routers/index.ts"),
		(content) => {
			content = content.replace(
				/import\s*\{\s*subscriptionRouter\s*\}\s*from\s*"\.\/subscription";\n/,
				"",
			);
			content = content.replace(/\tsubscription:\s*subscriptionRouter,\n/, "");
			return content;
		},
	);

	// --- E. Modify packages/api/src/services/todo-service.ts ---
	await editFile(
		join(root, "packages/api/src/services/todo-service.ts"),
		(content) => {
			// Remove POLAR_PRODUCTS import
			content = content.replace(
				/import\s*\{[^}]*\}\s*from\s*"[^"]*polar-products";\n/,
				"",
			);
			// Remove Context import
			content = content.replace(
				/import\s*type\s*\{\s*Context\s*\}\s*from\s*"\.\.\/context";\n/,
				"",
			);
			// Remove TIER_LIMITS constant
			content = content.replace(
				/const TIER_LIMITS\s*=\s*\{[\s\S]*?\}\s*as\s*const;\n\n/,
				"",
			);
			// Remove checkTodoLimit method
			content = content.replace(
				/\tprivate async checkTodoLimit\([\s\S]*?\n\t\}\n\n/,
				"",
			);
			// Remove getUserTier method
			content = content.replace(
				/\tprivate async getUserTier\([\s\S]*?\n\t\}\n\n/,
				"",
			);
			// Remove checkTodoLimit call in create
			content = content.replace(
				/\t\tawait this\.checkTodoLimit\(userId, context\);\n\n/,
				"",
			);
			// Simplify create signature: remove context parameter
			content = content.replace(
				/async create\(\n\t\tuserId: string,\n\t\tdata: \{ title: string; description\?: string \},\n\t\tcontext: Context,\n\t\)/,
				"async create(\n\t\tuserId: string,\n\t\tdata: { title: string; description?: string },\n\t)",
			);
			return content;
		},
	);

	// --- F. Modify packages/api/src/routers/todo.ts ---
	await editFile(
		join(root, "packages/api/src/routers/todo.ts"),
		(content) => {
			content = content.replace(
				"ctx.services.todos.create(ctx.session.user.id, input, ctx)",
				"ctx.services.todos.create(ctx.session.user.id, input)",
			);
			return content;
		},
	);

	// --- G. Modify packages/api/src/context.ts ---
	await editFile(join(root, "packages/api/src/context.ts"), (content) => {
		// Remove CustomerStateResult type alias
		content = content.replace(
			/type CustomerStateResult = Awaited<ReturnType<typeof auth\.api\.state>>;\n/,
			"",
		);
		// Remove customerState from Variables type
		content = content.replace(/\t\t\tcustomerState\?: CustomerStateResult;\n/, "");
		// Remove customerState variable declaration
		content = content.replace(
			/\tconst customerState = context\.get\("customerState"\) \?\? null;\n/,
			"",
		);
		// Remove customerState from return object
		content = content.replace(/\t\tcustomerState,\n/, "");
		// Remove the comment mentioning customerState
		content = content.replace(
			/\t\/\/ Reuse session and customerState from Hono auth middleware to avoid redundant fetches\n/,
			"\t// Reuse session from Hono auth middleware to avoid redundant fetches\n",
		);
		return content;
	});

	// --- H. Modify apps/server/src/index.ts ---
	await editFile(join(root, "apps/server/src/index.ts"), (content) => {
		// Remove the entire /api/payments/native-success route
		content = content.replace(
			/\napp\.get\("\/api\/payments\/native-success"[\s\S]*?\}\);\n/,
			"\n",
		);
		// Remove customerState from AuthVariables type
		content = content.replace(
			/\tcustomerState\?: Awaited<ReturnType<typeof auth\.api\.state>>;\n/,
			"",
		);
		return content;
	});

	// --- I. Modify apps/server/src/middleware/auth.ts ---
	await editFile(
		join(root, "apps/server/src/middleware/auth.ts"),
		(content) => {
			// Remove the if (session?.user) block that fetches customerState
			content = content.replace(
				/\n\t\t\/\/ Get customer state if user is authenticated\n\t\tif \(session\?\.user\) \{[\s\S]*?\} else \{\n\t\t\tc\.set\("customerState", undefined\);\n\t\t\}/,
				"",
			);
			// Remove c.set("customerState", undefined) from catch block
			content = content.replace(
				/\t\tc\.set\("customerState", undefined\);\n/,
				"",
			);
			return content;
		},
	);

	// --- J. Modify apps/web/src/lib/auth-client.ts ---
	await editFile(
		join(root, "apps/web/src/lib/auth-client.ts"),
		(content) => {
			content = content.replace(
				/import\s*\{\s*polarClient\s*\}\s*from\s*"@polar-sh\/better-auth";\n/,
				"",
			);
			content = content.replace(/\t\tpolarClient\(\),\n/, "");
			return content;
		},
	);

	// --- K. Modify apps/web/src/components/header.tsx ---
	await editFile(
		join(root, "apps/web/src/components/header.tsx"),
		(content) => {
			// Remove use-polar import
			content = content.replace(
				/import\s*\{\s*useCheckoutEmbed,\s*useSubscriptionStatus\s*\}\s*from\s*"@\/hooks\/use-polar";\n/,
				"",
			);
			// Remove Sparkles from lucide-react import
			content = content.replace(
				/\tSparkles,\n/,
				"",
			);
			// Remove checkoutEmbed, subscriptionStatus, hasPro declarations
			content = content.replace(
				/\tconst checkoutEmbed = useCheckoutEmbed\(\);\n/,
				"",
			);
			content = content.replace(
				/\tconst \{ data: subscriptionStatus \} = useSubscriptionStatus\(\{[\s\S]*?\}\);\n/,
				"",
			);
			content = content.replace(
				/\tconst hasPro = subscriptionStatus\?\.isProActive \?\? false;\n/,
				"",
			);
			// Remove the "Upgrade to Pro" DropdownMenuItem block
			content = content.replace(
				/\t\t\t\t\t\t\t\t\t\{!hasPro && \(\n\t\t\t\t\t\t\t\t\t\t<DropdownMenuItem[\s\S]*?\t\t\t\t\t\t\t\t\t\t<\/DropdownMenuItem>\n\t\t\t\t\t\t\t\t\t\)\}\n/,
				"",
			);
			return content;
		},
	);

	// --- L. Modify apps/web/src/routes/__authenticated/todos.tsx ---
	await editFile(
		join(root, "apps/web/src/routes/__authenticated/todos.tsx"),
		(content) => {
			// Remove use-polar import
			content = content.replace(
				/import\s*\{\s*useCheckoutEmbed,\s*useSubscriptionStatus\s*\}\s*from\s*"@\/hooks\/use-polar";\n/,
				"",
			);
			// Remove Badge import
			content = content.replace(
				/import\s*\{\s*Badge\s*\}\s*from\s*"@\/components\/ui\/badge";\n/,
				"",
			);
			// Remove FREE_TIER_LIMIT constant
			content = content.replace(
				/const FREE_TIER_LIMIT = 10;\n\n/,
				"",
			);
			// Remove subscription hooks and variables
			content = content.replace(
				/\tconst \{ data: subscriptionStatus \} = useSubscriptionStatus\(\{[\s\S]*?\}\);\n/,
				"",
			);
			content = content.replace(
				/\tconst checkoutEmbed = useCheckoutEmbed\(\);\n\n/,
				"",
			);
			content = content.replace(
				/\tconst hasPro = subscriptionStatus\?\.isProActive \?\? false;\n\n/,
				"",
			);
			// Remove isAtLimit variable
			content = content.replace(
				/\tconst isAtLimit = !hasPro && todoCount >= FREE_TIER_LIMIT;\n/,
				"",
			);
			// Remove todoCount variable (only used for isAtLimit and tier warning)
			content = content.replace(
				/\tconst todoCount = stats\.data\?\.total \|\| 0;\n/,
				"",
			);

			// Remove entire "Tier Limit Warning" card
			content = content.replace(
				/\t\t\t\{\/\*\s*Tier Limit Warning\s*\*\/\}\n\t\t\t\{!hasPro && \([\s\S]*?\t\t\t\)\}\n\n/,
				"",
			);

			// Simplify "Add New Todo" card description
			content = content.replace(
				/\t\t\t\t\t<CardDescription>\n\t\t\t\t\t\t\{hasPro[\s\S]*?remaining`\}\n\t\t\t\t\t<\/CardDescription>/,
				"\t\t\t\t\t<CardDescription>\n\t\t\t\t\t\tCreate a new todo\n\t\t\t\t\t</CardDescription>",
			);

			// Remove isAtLimit from disabled checks
			content = content.replace(
				/disabled=\{createTodo\.isPending \|\| isAtLimit\}/g,
				"disabled={createTodo.isPending}",
			);
			content = content.replace(
				/disabled=\{createTodo\.isPending \|\| !title\.trim\(\) \|\| isAtLimit\}/,
				"disabled={createTodo.isPending || !title.trim()}",
			);

			return content;
		},
	);

	// --- M. Modify apps/web/src/routes/index.tsx ---
	await editFile(
		join(root, "apps/web/src/routes/index.tsx"),
		(content) => {
			content = content.replace(
				/import\s*\{\s*Hero,\s*Pricing\s*\}\s*from\s*"@\/components\/landing";/,
				'import { Hero } from "@/components/landing";',
			);
			content = content.replace(/\t\t\t<Pricing \/>\n/, "");
			return content;
		},
	);

	// --- N. Modify apps/web/src/components/landing/index.ts ---
	await editFile(
		join(root, "apps/web/src/components/landing/index.ts"),
		(content) => {
			content = content.replace(
				/export\s*\{\s*Pricing\s*\}\s*from\s*"\.\/pricing";\n/,
				"",
			);
			return content;
		},
	);

	// --- O. Modify apps/native/app/_layout.tsx ---
	await editFile(join(root, "apps/native/app/_layout.tsx"), (content) => {
		// Remove the entire useEffect block for deep link checkout-success
		content = content.replace(
			/\n\tuseEffect\(\(\) => \{\n\t\tif \(url\) \{[\s\S]*?\n\t\}, \[url\]\);\n/,
			"\n",
		);
		// Remove url variable
		content = content.replace(
			/\tconst url = Linking\.useURL\(\);\n/,
			"",
		);
		// Remove useEffect from import (useCallback remains)
		content = content.replace(
			/import\s*\{\s*useCallback,\s*useEffect\s*\}\s*from\s*"react";/,
			'import { useCallback } from "react";',
		);
		// Remove Linking import
		content = content.replace(
			/import\s*\*\s*as\s*Linking\s*from\s*"expo-linking";\n/,
			"",
		);
		return content;
	});

	// --- P. Modify apps/native/app/(tabs)/profile.tsx ---
	await editFile(
		join(root, "apps/native/app/(tabs)/profile.tsx"),
		(content) => {
			// Remove use-subscription import
			content = content.replace(
				/import\s*\{\s*useCheckout,\s*useSubscriptionStatus\s*\}\s*from\s*"@\/hooks\/use-subscription";\n/,
				"",
			);
			// Remove subscription hooks
			content = content.replace(
				/\tconst \{ data: subscriptionStatus, isLoading: isSubLoading \} =\n\t\tuseSubscriptionStatus\(\);\n/,
				"",
			);
			content = content.replace(
				/\tconst \{ checkout, isLoading: isCheckoutLoading \} = useCheckout\(\);\n/,
				"",
			);
			// Remove entire Subscription Card
			content = content.replace(
				/\n\t\t\t\t\{\/\*\s*Subscription\s*\*\/\}\n\t\t\t\t<Card variant="secondary" className="p-6">[\s\S]*?\t\t\t\t<\/Card>\n/,
				"\n",
			);
			// Remove Spinner from heroui-native import if only used for subscription loading
			// Check: Spinner is only used in the subscription card
			content = content.replace(
				/import\s*\{\s*Avatar,\s*Button,\s*Card,\s*Chip,\s*Spinner,\s*Switch\s*\}\s*from\s*"heroui-native";/,
				'import { Avatar, Button, Card, Chip, Switch } from "heroui-native";',
			);
			// Remove ActivityIndicator from react-native import (only used in checkout button)
			content = content.replace(
				/\tActivityIndicator,\n/,
				"",
			);
			return content;
		},
	);

	// --- Q. Modify env files ---
	const envTransform = (content: string) => {
		// Remove Polar comment headers and entries
		content = content.replace(
			/\n# Payment Service \(Polar\.sh\)\n/,
			"\n",
		);
		content = content.replace(
			/POLAR_ACCESS_TOKEN="[^"]*"\n/,
			"",
		);
		content = content.replace(
			/POLAR_SUCCESS_URL="[^"]*"\n/,
			"",
		);
		content = content.replace(
			/\n# Polar Product ID\n/,
			"",
		);
		content = content.replace(
			/POLAR_PRO_PRODUCT_ID="[^"]*"\n/,
			"",
		);
		// Clean up double blank lines
		content = content.replace(/\n{3,}/g, "\n\n");
		return content;
	};

	await editFile(join(root, "apps/server/.env.example"), envTransform);
	try {
		await editFile(join(root, "apps/server/.env"), envTransform);
	} catch {
		// .env may not exist
	}

	// --- R. Modify apps/server/wrangler.jsonc ---
	await editFile(join(root, "apps/server/wrangler.jsonc"), (content) => {
		// Remove POLAR_SUCCESS_URL lines from all vars blocks
		content = content.replace(
			/,?\n\s*"POLAR_SUCCESS_URL":\s*"[^"]*"/g,
			"",
		);
		return content;
	});

	// --- T. Modify package.json (root) - remove catalog entries ---
	await editFile(join(root, "package.json"), (content) => {
		content = content.replace(/\t\t\t"@polar-sh\/better-auth":\s*"[^"]*",?\n/, "");
		content = content.replace(/\t\t\t"@polar-sh\/sdk":\s*"[^"]*",?\n/, "");
		// Clean up potential trailing comma
		content = content.replace(/,(\s*\})/g, "$1");
		return content;
	});

	// --- S. Regenerate worker types ---
	console.log("\n  running: bun run cf-typegen (regenerating worker types)...\n");
	const cfTypegen = Bun.spawnSync(["bun", "run", "cf-typegen"], {
		cwd: join(root, "apps/server"),
		stdio: ["inherit", "inherit", "inherit"],
	});

	if (cfTypegen.exitCode !== 0) {
		console.warn(
			"  warning: cf-typegen failed. You may need to run it manually after bun install.",
		);
	}

	console.log("");
}
