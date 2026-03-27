import { create } from "zustand";
import db from "@/lib/db";
import { createEmptyGameDesignDoc, getTemplateDefinition } from "@/lib/templates/genreTemplates";
import type {
  AgentPlatform,
  GamePlatformTarget,
  Project,
  ProjectStatus,
  ScopeCategory,
  TemplateId
} from "@/types";

interface CreateProjectInput {
  title?: string;
  name?: string;
  oneLinePitch?: string;
  description?: string;
  status?: ProjectStatus;
  scopeCategory?: ScopeCategory;
  genre?: string;
  subgenre?: string;
  platformTargets?: GamePlatformTarget[];
  agentTargets?: AgentPlatform[];
  targetPlatforms?: AgentPlatform[];
  targetAudience?: string;
  sessionLength?: string;
  monetizationModel?: string;
  comparableGames?: string[];
  templateId?: TemplateId;
  enginePreference?: string;
  techStack?: string[];
}

interface ProjectStoreState {
  projects: Project[];
  selectedProjectId: string | null;
  loadProjects: () => Promise<void>;
  selectProject: (projectId: string | null) => void;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  updateProject: (
    projectId: string,
    updates: Partial<Omit<Project, "id" | "createdAt">>
  ) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
}

const buildProjectRecord = (input: CreateProjectInput): Project => {
  const templateId = input.templateId ?? "blank-game-project";
  const template = getTemplateDefinition(templateId);
  const now = Date.now();
  const title = input.title ?? input.name ?? "Untitled Game Project";
  const oneLinePitch = input.oneLinePitch ?? input.description ?? "";
  const agentTargets =
    input.agentTargets ?? input.targetPlatforms ?? template.defaultProject.agentTargets ?? [];

  return {
    id: crypto.randomUUID(),
    title,
    name: input.name ?? title,
    oneLinePitch,
    description: input.description ?? oneLinePitch,
    status: input.status ?? "concept",
    scopeCategory: input.scopeCategory ?? template.defaultProject.scopeCategory ?? "small",
    genre: input.genre ?? template.defaultProject.genre ?? "",
    subgenre: input.subgenre ?? template.defaultProject.subgenre ?? "",
    platformTargets:
      input.platformTargets ?? template.defaultProject.platformTargets ?? ["pc", "web"],
    agentTargets,
    targetPlatforms: input.targetPlatforms ?? agentTargets,
    targetAudience: input.targetAudience ?? template.defaultProject.targetAudience ?? "",
    sessionLength: input.sessionLength ?? template.defaultProject.sessionLength ?? "",
    monetizationModel:
      input.monetizationModel ?? template.defaultProject.monetizationModel ?? "",
    comparableGames:
      input.comparableGames ?? template.defaultProject.comparableGames ?? [],
    templateId,
    enginePreference:
      input.enginePreference ?? template.defaultProject.enginePreference ?? "",
    techStack: input.techStack ?? template.defaultProject.techStack ?? [],
    createdAt: now,
    updatedAt: now
  };
};

export const useProjectStore = create<ProjectStoreState>((set) => ({
  projects: [],
  selectedProjectId: null,
  loadProjects: async () => {
    const projects = await db.projects.orderBy("updatedAt").reverse().toArray();
    set({ projects });
  },
  selectProject: (projectId) => {
    set({ selectedProjectId: projectId });
  },
  createProject: async (input) => {
    const project = buildProjectRecord(input);
    const template = getTemplateDefinition(project.templateId);
    const templateConcept: Partial<ReturnType<typeof createEmptyGameDesignDoc>["concept"]> =
      template.defaultDoc.concept ?? {};
    const gameDesignDoc = createEmptyGameDesignDoc(project.id, {
      ...template.defaultDoc,
      concept: {
        ...templateConcept,
        gameTitle: project.title,
        oneLinePitch: project.oneLinePitch,
        genre: project.genre,
        subgenre: project.subgenre,
        platformTargets: project.platformTargets,
        targetAudience: project.targetAudience,
        sessionLength: project.sessionLength,
        monetizationModel: project.monetizationModel,
        comparableGames: project.comparableGames,
        scopeCategory: project.scopeCategory,
        playerFantasy: templateConcept.playerFantasy ?? "",
        differentiators: templateConcept.differentiators ?? ""
      }
    });

    await db.transaction("rw", [db.projects, db.gameDesignDocs], async () => {
      await db.projects.add(project);
      await db.gameDesignDocs.add(gameDesignDoc);
    });

    set((state) => ({
      projects: [project, ...state.projects],
      selectedProjectId: project.id
    }));

    return project;
  },
  updateProject: async (projectId, updates) => {
    const current = await db.projects.get(projectId);
    if (!current) {
      return;
    }

    const nextProject: Project = {
      ...current,
      ...updates,
      title: updates.title ?? updates.name ?? current.title,
      name: updates.name ?? updates.title ?? current.name,
      oneLinePitch:
        updates.oneLinePitch ?? updates.description ?? current.oneLinePitch,
      description:
        updates.description ?? updates.oneLinePitch ?? current.description,
      agentTargets:
        updates.agentTargets ?? updates.targetPlatforms ?? current.agentTargets,
      targetPlatforms:
        updates.targetPlatforms ?? updates.agentTargets ?? current.targetPlatforms,
      updatedAt: Date.now()
    };

    await db.projects.put(nextProject);
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === projectId ? nextProject : project
      )
    }));
  },
  deleteProject: async (projectId) => {
    await db.transaction(
      "rw",
      [db.projects, db.gameDesignDocs, db.artifacts, db.vaultFiles, db.buildStages],
      async () => {
        await db.projects.delete(projectId);
        await db.gameDesignDocs.where("projectId").equals(projectId).delete();
        await db.artifacts.where("projectId").equals(projectId).delete();
        await db.vaultFiles.where("projectId").equals(projectId).delete();
        await db.buildStages.where("projectId").equals(projectId).delete();
      }
    );

    set((state) => ({
      projects: state.projects.filter((project) => project.id !== projectId),
      selectedProjectId:
        state.selectedProjectId === projectId ? null : state.selectedProjectId
    }));
  }
}));
