import { describe, expect, it } from "vitest";
import {
  getProjectTabFromSearch,
  getProjectTabPath,
  isProjectLinkId
} from "@/components/layout/sidebarConfig";

describe("sidebarConfig project tab helpers", () => {
  it("builds project routes with the tab encoded in the query string", () => {
    expect(getProjectTabPath("project-123", "technical-design")).toBe(
      "/project/project-123?tab=technical-design"
    );
  });

  it("extracts valid project tabs from the current URL search", () => {
    expect(getProjectTabFromSearch("?tab=build-plan")).toBe("prompt-lab");
    expect(getProjectTabFromSearch("?foo=bar&tab=prompt-lab")).toBe("prompt-lab");
    expect(getProjectTabFromSearch("?tab=output-library")).toBe("output-library");
  });

  it("rejects unknown or missing tab values", () => {
    expect(getProjectTabFromSearch("")).toBeNull();
    expect(getProjectTabFromSearch("?tab=unknown-tab")).toBeNull();
    expect(isProjectLinkId("concept")).toBe(true);
    expect(isProjectLinkId("unknown-tab")).toBe(false);
  });
});
