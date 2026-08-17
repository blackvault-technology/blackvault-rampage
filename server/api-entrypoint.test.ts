import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import apiApp from "../api/index";

describe("Vercel API entrypoint", () => {
  it("loads the Express serverless application without throwing", () => {
    expect(typeof apiApp).toBe("function");
  });

  it("ships a bundled JavaScript artifact without extensionless local ESM imports", () => {
    const bundledApi = readFileSync(new URL("../api/index.js", import.meta.url), "utf8");
    expect(bundledApi).toContain("createExpressMiddleware");
    expect(bundledApi).not.toMatch(/from [\"']\.\.\/server\//);
  });
});
