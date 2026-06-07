import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

async function editFile(
	filePath: string,
	transform: (content: string) => string,
): Promise<void> {
	let content: string;
	try {
		content = await readFile(filePath, "utf-8");
	} catch {
		// File may not exist
		console.log(
			`  skipped: ${filePath.split("/").slice(-3).join("/")} (not found)`,
		);
		return;
	}
	const updated = transform(content);
	if (updated !== content) {
		await writeFile(filePath, updated);
		console.log(`  modified: ${filePath.split("/").slice(-3).join("/")}`);
	}
}

export async function removeNative(root: string): Promise<void> {
	console.log("\n  Removing mobile app (apps/native)...\n");

	// --- A. Delete the mobile app ---
	await rm(join(root, "apps/native"), { recursive: true, force: true });
	console.log("  deleted: apps/native/");

	// --- B. Modify package.json (root) - remove native script and catalog entry ---
	await editFile(join(root, "package.json"), (original) => {
		let content = original;
		content = content.replace(/\t\t"dev:native":\s*"[^"]*",?\n/, "");
		content = content.replace(/\t\t\t"@better-auth\/expo":\s*"[^"]*",?\n/, "");
		// Clean up potential trailing comma before closing brace
		content = content.replace(/,(\s*\})/g, "$1");
		return content;
	});

	// --- C. Modify apps/server/src/index.ts - remove native-only deep link route ---
	// (no-op if the Polar removal already deleted it)
	await editFile(join(root, "apps/server/src/index.ts"), (original) => {
		let content = original;
		content = content.replace(
			/\napp\.get\("\/api\/payments\/native-success"[\s\S]*?\}\);\n/,
			"\n",
		);
		return content;
	});

	console.log("");
}
