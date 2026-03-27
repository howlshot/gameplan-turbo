import { describe, expect, it } from "vitest";
import { parseImportedProjects } from "@/components/hub/projectHubConfig";

describe("parseImportedProjects", () => {
  it("preserves imported large scope values", () => {
    const parsed = parseImportedProjects({
      projects: [
        {
          id: "project-large",
          title: "Big Plan",
          oneLinePitch: "A broad tactical project.",
          scopeCategory: "large",
          templateId: "blank-game-project"
        }
      ],
      gameDesignDocs: [
        {
          id: "doc-large",
          projectId: "project-large",
          concept: {
            gameTitle: "Big Plan",
            oneLinePitch: "A broad tactical project.",
            scopeCategory: "large"
          }
        }
      ]
    });

    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.project.scopeCategory).toBe("large");
  });
});
