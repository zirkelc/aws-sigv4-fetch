import { defineProject, mergeConfig } from "vitest/config";
import base from "../../vitest.base";

export default mergeConfig(
  base,
  defineProject({
    test: {
      name: "unit/aws-sigv4-sign",
      include: ["src/**/*.test.{ts,js}"],
    },
  }),
);
