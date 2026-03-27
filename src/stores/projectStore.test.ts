import { beforeEach, describe, expect, it, vi } from "vitest";
import db from "@/lib/db";
import { useProjectStore } from "@/stores/projectStore";
import type { Project } from "@/types";

vi.mock("@/lib/db", () => ({
  default: {
    projects: {
      orderBy: vi.fn().mockReturnThis(),
      reverse: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue([]),
      add: vi.fn().mockResolvedValue("test-id"),
      put: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue(null)
    },
    gameDesignDocs: {
      add: vi.fn().mockResolvedValue("test-doc-id"),
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      delete: vi.fn().mockResolvedValue(undefined)
    },
    artifacts: {
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      delete: vi.fn().mockResolvedValue(undefined)
    },
    vaultFiles: {
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      delete: vi.fn().mockResolvedValue(undefined)
    },
    buildStages: {
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      delete: vi.fn().mockResolvedValue(undefined)
    },
    transaction: vi.fn().mockImplementation(async (_mode, _tables, fn) => fn())
  }
}));

describe("projectStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProjectStore.setState({
      projects: [],
      selectedProjectId: null
    });
  });

  it("creates a game project with mirrored title fields", async () => {
    const project = await useProjectStore.getState().createProject({
      title: "Nightline Zero",
      oneLinePitch: "A compact rail shooter."
    });

    expect(project.title).toBe("Nightline Zero");
    expect(project.name).toBe("Nightline Zero");
    expect(project.oneLinePitch).toBe("A compact rail shooter.");
    expect(project.status).toBe("concept");
    expect(db.projects.add).toHaveBeenCalled();
    expect(db.gameDesignDocs.add).toHaveBeenCalled();
  });

  it("persists large scope into the mirrored game design doc", async () => {
    const project = await useProjectStore.getState().createProject({
      title: "Mega Ops",
      scopeCategory: "large"
    });

    expect(project.scopeCategory).toBe("large");
    expect(db.gameDesignDocs.add).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: project.id,
        concept: expect.objectContaining({
          scopeCategory: "large"
        })
      })
    );
  });

  it("loads projects from the database", async () => {
    const mockProjects: Project[] = [
      {
        id: "1",
        title: "Project 1",
        name: "Project 1",
        oneLinePitch: "",
        description: "",
        status: "concept",
        scopeCategory: "small",
        genre: "Action",
        subgenre: "",
        platformTargets: ["pc"],
        agentTargets: ["codex"],
        targetPlatforms: ["codex"],
        targetAudience: "",
        sessionLength: "",
        monetizationModel: "",
        comparableGames: [],
        templateId: "blank-game-project",
        enginePreference: "",
        techStack: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    (db.projects.orderBy as any).mockReturnValue({
      reverse: () => ({
        toArray: () => Promise.resolve(mockProjects)
      })
    });

    await useProjectStore.getState().loadProjects();

    expect(useProjectStore.getState().projects).toEqual(mockProjects);
  });

  it("deletes a project and related records", async () => {
    const project = await useProjectStore.getState().createProject({
      title: "To Delete"
    });

    await useProjectStore.getState().deleteProject(project.id);

    expect(db.projects.delete).toHaveBeenCalledWith(project.id);
    expect(db.gameDesignDocs.where).toHaveBeenCalledWith("projectId");
    expect(db.artifacts.where).toHaveBeenCalledWith("projectId");
  });
});
