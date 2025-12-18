import { describe, expect, it } from "vitest";

import { getReflectionModule, getReflectionModuleBySlug, listReflectionModules } from "./modules";

describe("reflection modules registry", () => {
  it("renames Brokerage slug + copy to Capital Markets Brokerage", () => {
    const moduleConfig = getReflectionModule("brokerage");
    expect(moduleConfig.slug).toBe("capital-markets-brokerage");
    expect(moduleConfig.title).toContain("Capital Markets Brokerage");
    expect(moduleConfig.transcriptTitle).toContain("Capital Markets Brokerage");
    expect(moduleConfig.signedUrlEndpoint).toBe("/api/capital-markets-brokerage/coach/signed-url");
    expect(moduleConfig.sessionEndpoint).toBe("/api/capital-markets-brokerage/session");
  });

  it("resolves modules by slug", () => {
    const moduleConfig = getReflectionModuleBySlug("capital-markets-brokerage");
    expect(moduleConfig?.id).toBe("brokerage");
  });

  it("keeps endpoints consistent with module slug", () => {
    const modules = listReflectionModules();
    const slugs = modules.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const moduleConfig of modules) {
      expect(moduleConfig.signedUrlEndpoint).toBe(`/api/${moduleConfig.slug}/coach/signed-url`);
      expect(moduleConfig.sessionEndpoint).toBe(`/api/${moduleConfig.slug}/session`);
    }
  });
});

