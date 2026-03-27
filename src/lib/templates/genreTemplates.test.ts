import { describe, expect, it } from "vitest";
import {
  GAME_TEMPLATES,
  getStarterModeDefinitions,
  isTemplateId,
  STARTER_MODE_ORDER
} from "@/lib/templates/genreTemplates";

describe("genreTemplates", () => {
  it("returns the curated starter modes in stable order", () => {
    expect(getStarterModeDefinitions().map((template) => template.id)).toEqual(
      STARTER_MODE_ORDER
    );
  });

  it("defines the new preset defaults with the intended bias", () => {
    expect(GAME_TEMPLATES.platformer.defaultProject.scopeCategory).toBe("small");
    expect(GAME_TEMPLATES.platformer.defaultProject.platformTargets).toEqual([
      "pc",
      "web",
      "switch"
    ]);
    expect(GAME_TEMPLATES["survival-horror-lite"].defaultProject.sessionLength).toBe(
      "20-40 minutes"
    );
    expect(GAME_TEMPLATES["tactics-lite"].defaultProject.scopeCategory).toBe(
      "medium"
    );
  });

  it("marks guided custom separately from curated presets", () => {
    expect(GAME_TEMPLATES["custom-guided"].kind).toBe("custom");
    expect(GAME_TEMPLATES["custom-guided"].defaultProject.platformTargets).toEqual([
      "pc",
      "web"
    ]);
  });

  it("recognizes all supported template ids", () => {
    expect(isTemplateId("puzzle-action")).toBe(true);
    expect(isTemplateId("custom-guided")).toBe(true);
    expect(isTemplateId("unknown-template")).toBe(false);
  });
});
