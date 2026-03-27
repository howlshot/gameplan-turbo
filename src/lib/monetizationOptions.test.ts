import { describe, expect, it } from "vitest";
import {
  CUSTOM_MONETIZATION_VALUE,
  getMonetizationOption,
  normalizeMonetizationValue
} from "@/lib/monetizationOptions";

describe("monetizationOptions", () => {
  it("normalizes premium variants into the guided premium option", () => {
    expect(
      normalizeMonetizationValue("Premium with leaderboard retention")
    ).toBe("Premium");
  });

  it("returns custom for monetization models outside the guided set", () => {
    expect(
      normalizeMonetizationValue("Revenue-share publishing advance")
    ).toBe(CUSTOM_MONETIZATION_VALUE);
  });

  it("exposes descriptions for known monetization options", () => {
    expect(getMonetizationOption("Premium")?.description).toMatch(
      /upfront purchase/i
    );
  });
});
