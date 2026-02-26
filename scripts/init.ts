import { copyFile, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";
import { Glob } from "bun";
import { removePolar } from "./remove-polar";

const ROOT = join(import.meta.dirname, "..");

function validateName(name: string): boolean {
	return /^[a-z][a-z0-9-]*$/.test(name);
}

function titleCase(str: string): string {
	return str
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

async function fileExists(path: string): Promise<boolean> {
	try {
		await stat(path);
		return true;
	} catch {
		return false;
	}
}

function parseArgs(): { name?: string; bundleId?: string } {
	const args = process.argv.slice(2);
	let name: string | undefined;
	let bundleId: string | undefined;

	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--name" && args[i + 1]) {
			name = args[i + 1];
			i++;
		} else if (args[i] === "--bundle-id" && args[i + 1]) {
			bundleId = args[i + 1];
			i++;
		}
	}

	return { name, bundleId };
}

async function main() {
	console.log("\n  Project Init\n");

	const cliArgs = parseArgs();
	let name = cliArgs.name ?? "";
	let bundleId = cliArgs.bundleId ?? "";

	// Interactive prompts if args not provided
	if (!name) {
		const rl = createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		while (!name) {
			const input = (
				await rl.question(
					"  Project name (lowercase, alphanumeric + hyphens): ",
				)
			).trim();
			if (!input) {
				console.log("  Name is required.\n");
				continue;
			}
			if (!validateName(input)) {
				console.log(
					"  Invalid name. Must be lowercase, start with a letter, and contain only alphanumeric characters and hyphens.\n",
				);
				continue;
			}
			name = input;
		}

		if (!bundleId) {
			bundleId = (
				await rl.question(
					"  Bundle ID (e.g. com.user.app, press Enter to skip): ",
				)
			).trim();
		}

		rl.close();
	} else {
		if (!validateName(name)) {
			console.error(
				`  Invalid name "${name}". Must be lowercase, start with a letter, and contain only alphanumeric characters and hyphens.`,
			);
			process.exit(1);
		}
		console.log(`  Name: ${name}`);
		if (bundleId) console.log(`  Bundle ID: ${bundleId}`);
	}

	console.log("");

	// --- Rename project ---
	const OLD_SCOPE = "@better-auth-cloudflare-starter";
	const OLD_NAME = "better-auth-cloudflare-starter";
	const NEW_SCOPE = `@${name}`;

	const glob = new Glob("**/*.{json,ts,tsx,js,jsx}");
	const files = glob.scanSync({ cwd: ROOT, absolute: true });

	let changedCount = 0;

	for (const filePath of files) {
		if (
			filePath.includes("node_modules") ||
			filePath.includes(".git/") ||
			filePath.includes("scripts/init.ts")
		)
			continue;

		const original = await readFile(filePath, "utf-8");
		let content = original;

		content = content.replaceAll(OLD_SCOPE, NEW_SCOPE);
		content = content.replaceAll(OLD_NAME, name);

		if (content !== original) {
			await writeFile(filePath, content);
			changedCount++;
			console.log(`  renamed: ${filePath.replace(`${ROOT}/`, "")}`);
		}
	}

	// Special handling for apps/native/app.json
	const appJsonPath = join(ROOT, "apps/native/app.json");
	try {
		const appJson = JSON.parse(await readFile(appJsonPath, "utf-8"));
		const expo = appJson.expo;

		expo.name = titleCase(name);
		expo.slug = name;
		expo.scheme = name;

		if (bundleId) {
			if (expo.android) expo.android.package = bundleId;
			if (expo.ios) expo.ios.bundleIdentifier = bundleId;
		}

		await writeFile(appJsonPath, `${JSON.stringify(appJson, null, "\t")}\n`);
		console.log("  renamed: apps/native/app.json (expo config)");
	} catch {
		console.warn("  warning: could not update apps/native/app.json");
	}

	// --- Optional Polar payment integration ---
	{
		const rl2 = createInterface({
			input: process.stdin,
			output: process.stdout,
		});
		const polarAnswer = (
			await rl2.question("  Include Polar payment integration? (Y/n): ")
		).trim();
		rl2.close();

		if (polarAnswer.toLowerCase() === "n") {
			await removePolar(ROOT);
			console.log("  Polar payment integration removed.\n");
		}
	}

	// --- Create .env files from .env.example ---
	console.log("");
	const envDirs = ["apps/server", "apps/web", "apps/native"];
	for (const dir of envDirs) {
		const examplePath = join(ROOT, dir, ".env.example");
		const envPath = join(ROOT, dir, ".env");

		if (!(await fileExists(examplePath))) continue;

		if (await fileExists(envPath)) {
			console.log(`  skipped: ${dir}/.env (already exists)`);
			continue;
		}

		await copyFile(examplePath, envPath);
		console.log(`  created: ${dir}/.env`);
	}

	// --- Reinstall dependencies ---
	const lockPath = join(ROOT, "bun.lock");
	try {
		await unlink(lockPath);
		console.log("\n  deleted: bun.lock");
	} catch {
		// lock file may not exist
	}

	console.log("\n  running: bun install...\n");
	const install = Bun.spawnSync(["bun", "install"], {
		cwd: ROOT,
		stdio: ["inherit", "inherit", "inherit"],
	});

	if (install.exitCode !== 0) {
		console.error("\nbun install failed.");
		process.exit(1);
	}

	console.log("\n  running: bun run check...\n");
	const check = Bun.spawnSync(["bun", "run", "check"], {
		cwd: ROOT,
		stdio: ["inherit", "inherit", "inherit"],
	});

	if (check.exitCode !== 0) {
		console.error("\nbun run check failed.");
		process.exit(1);
	}

	console.log(
		`\n  Done! Initialized "${name}" (${changedCount} files renamed, .env files created).\n`,
	);
}

main();
