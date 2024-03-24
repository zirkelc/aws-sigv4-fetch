import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
	// "vitest.config.ts",
	// "test/*",
	{
		// add "extends" to merge two configs together
		// extends: "./vite.config.js",
		test: {
			name: "unit",
			include: ["src/**/*.test.{ts,js}"],
		},
	},
	"test/*",
]);
