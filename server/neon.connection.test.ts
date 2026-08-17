import { describe, expect, it } from "vitest";

describe("Neon connection configuration", () => {
  it("has a secure PostgreSQL connection string configured", () => {
    const url = process.env.NEON_DATABASE_URL;
    expect(url).toBeTruthy();
    const parsed = new URL(url!);
    expect(["postgres:", "postgresql:"]).toContain(parsed.protocol);
    expect(parsed.searchParams.get("sslmode")).toBe("require");
    expect(parsed.hostname).toContain("neon.tech");
  });
});
