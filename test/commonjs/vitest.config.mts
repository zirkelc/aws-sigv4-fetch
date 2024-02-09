import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		name: "commonjs",
		typecheck: {
			enabled: true,
		},
	},
});
