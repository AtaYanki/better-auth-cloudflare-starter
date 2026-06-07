import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
	test: {
		poolOptions: {
			workers: {
				wrangler: { configPath: "./wrangler.jsonc" },
				// Open (hibernating) WebSockets keep DOs alive across test
				// boundaries, which is incompatible with stacked isolated
				// storage. Tests use unique channel names instead.
				isolatedStorage: false,
				miniflare: {
					// Dummy values so module-scope initialization (better-auth,
					// Polar SDK, Neon client) succeeds inside the test runtime.
					// Nothing here talks to real services in unit tests.
					bindings: {
						DATABASE_URL: "postgres://test:test@localhost:5432/test",
						BETTER_AUTH_SECRET: "test-secret-test-secret-test-secret",
						BETTER_AUTH_URL: "http://localhost:3000",
						CORS_ORIGIN: "http://localhost:3001",
						RESEND_API_KEY: "re_test_dummy",
						BUCKET_URL: "http://localhost:3000/bucket",
						NODE_ENV: "development",
					},
				},
			},
		},
	},
});
