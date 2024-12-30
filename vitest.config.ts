import GithubActionsReporter from "vitest-github-actions-reporter";
import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "unit",
    include: ["src/**/*.test.{ts,js}"],

    // https://github.com/sapphi-red/vitest-github-actions-reporter
    reporters: process.env.GITHUB_ACTIONS ? ["default", new GithubActionsReporter()] : ["default", "html"],

    // https://vitest.dev/guide/coverage.html
    coverage: {
      ...coverageConfigDefaults,
      provider: "v8",
      // json-summary is required for https://github.com/davelosert/vitest-coverage-report-action
      reporter: ["json-summary", "json", "text-summary", "html"],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80,
      },
    },
  },
});
