import { describe, expect, it } from "vitest";
import { getBuildStageSequence } from "@/lib/templates/genreTemplates";

describe("getBuildStageSequence", () => {
  it("keeps the standard 12-stage sequence for small projects", () => {
    const sequence = getBuildStageSequence("small");

    expect(sequence).toHaveLength(12);
    expect(sequence[0]?.key).toBe("foundation");
    expect(sequence[sequence.length - 1]?.key).toBe("packaging-release-prep");
  });

  it("returns the expanded 15-stage sequence for large projects", () => {
    const sequence = getBuildStageSequence("large");

    expect(sequence.map((stage) => stage.key)).toEqual([
      "scope-lock",
      "foundation",
      "first-playable",
      "core-controls",
      "camera-movement",
      "combat-feel",
      "systems-foundation",
      "enemy-behavior",
      "hud-feedback",
      "progression-meta",
      "content-pipeline",
      "content-production",
      "vertical-slice-integration",
      "polish",
      "qa-release-prep"
    ]);
  });
});
