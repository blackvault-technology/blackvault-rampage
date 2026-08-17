import { describe, expect, it } from "vitest";
import apiApp from "../api/index";

describe("Vercel API entrypoint", () => {
  it("loads the Express serverless application without throwing", () => {
    expect(typeof apiApp).toBe("function");
  });
});
