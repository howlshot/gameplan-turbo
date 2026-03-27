import { describe, expect, it } from "vitest";
import {
  GAME_TEMPLATES,
  getGenreFamilyDefinitions,
  getStarterModeDefinitions,
  inferTemplateIdFromGenreSelection,
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

  it("defines a genre taxonomy that maps curated subgenres to hidden templates", () => {
    expect(getGenreFamilyDefinitions().map((family) => family.id)).toEqual([
      "action",
      "platformer",
      "horror",
      "strategy",
      "puzzle",
      "other"
    ]);

    expect(
      inferTemplateIdFromGenreSelection({
        genreFamilyId: "horror",
        subgenreId: "survival-horror"
      })
    ).toBe("survival-horror-lite");
  });

  it("falls back to blank and custom-guided templates appropriately for the other path", () => {
    expect(
      inferTemplateIdFromGenreSelection({
        genreFamilyId: "other"
      })
    ).toBe("blank-game-project");

    expect(
      inferTemplateIdFromGenreSelection({
        genreFamilyId: "other",
        customGenre: "Immersive Sim"
      })
    ).toBe("custom-guided");
  });
});
