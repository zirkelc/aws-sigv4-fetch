import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		name: "iam",
		typecheck: {
			enabled: true,
		},
	},
});
