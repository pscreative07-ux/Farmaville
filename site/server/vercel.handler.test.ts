import { describe, expect, it } from "vitest";

describe("Vercel tRPC handler", () => {
  it("loads the serverless adapter without directory-import resolution errors", async () => {
    const module = await import("../api/trpc/[...trpc]");

    expect(module.default).toBeTypeOf("function");
  });
});
