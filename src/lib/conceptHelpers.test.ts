import { describe, expect, it } from "vitest";
import { getConceptFieldGuidance } from "@/lib/conceptHelpers";

describe("getConceptFieldGuidance", () => {
  it("returns action-horror guidance instead of rail-shooter wording", () => {
    const guidance = getConceptFieldGuidance({
      genre: "Horror",
      subgenre: "Action Horror",
      templateId: "survival-horror-lite"
    });

    expect(guidance.oneLinePitchPlaceholder).toMatch(/action-horror/i);
    expect(guidance.oneLinePitchPlaceholder).not.toMatch(/rail shooter/i);
    expect(guidance.playerFantasyDescription).toMatch(/Action Horror/i);
  });

  it("falls back to generic guidance when there is no genre framing", () => {
    const guidance = getConceptFieldGuidance({});

    expect(guidance.oneLinePitchPlaceholder).toMatch(/compact horror game/i);
    expect(guidance.playerFantasyPlaceholder).toMatch(/capable but pressured/i);
  });
});
