import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "client",
          globals: true,
          clearMocks: true,
          environment: "jsdom",
          setupFiles: ["./src/client/setupTests.ts"],
          include: ["src/client/**/*.test.{ts,tsx}"],
        },
      },
      {
        test: {
          name: "server",
          globals: true,
          clearMocks: true,
          environment: "node",
          setupFiles: ["./src/server/setupTests.ts"],
          include: ["src/server/**/*.test.ts"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.mock.{ts,tsx}",
        "src/**/*.test.{ts,tsx}",
        "src/**/*.types.ts",
        "src/**/setupTests.ts",
        "src/client/test-utils/**",
        "src/client/index.tsx",
        "src/server/index.ts",
      ],
    },
  },
});
