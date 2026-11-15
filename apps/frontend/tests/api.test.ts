import { afterEach, describe, expect, it, vi } from "vitest";
import { checkReadiness } from "@/lib/api";

afterEach(() => vi.unstubAllGlobals());

describe("readiness client", () => {
  it("requires both infrastructure services to be healthy", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: "ok", checks: { postgresql: "ok", redis: "ok" } }) }));
    expect(await checkReadiness(new AbortController().signal)).toBe(true);
  });
  it.each([{ status: "ok" }, { status: "degraded" }, null, { status: "ok", checks: {} }])("rejects malformed health payload %j", async (payload) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => payload }));
    expect(await checkReadiness(new AbortController().signal)).toBe(false);
  });
  it("handles dependency failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    expect(await checkReadiness(new AbortController().signal)).toBe(false);
  });
});
