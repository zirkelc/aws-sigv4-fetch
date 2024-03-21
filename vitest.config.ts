import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		name: "unit",
		include: ["src/**/*.test.{ts,js}"],
		typecheck: {
			enabled: true,
		},
	},
});
