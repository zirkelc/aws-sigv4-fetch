import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		name: "esm",
		typecheck: {
			enabled: true,
		},
	},
});
