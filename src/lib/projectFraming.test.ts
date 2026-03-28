import { describe, expect, it } from "vitest";
import { getScopeProfile, SCOPE_ORDER } from "@/lib/projectFraming";

describe("projectFraming", () => {
  it("keeps large as the last scope option", () => {
    expect(SCOPE_ORDER).toEqual(["tiny", "small", "medium", "large"]);
  });

  it("marks large as a warning-tier scope", () => {
    const profile = getScopeProfile("large");

    expect(profile.label).toBe("Large");
    expect(profile.tone).toBe("warning");
    expect(profile.warningMessage).toContain("optimized for finishable");
  });
});
