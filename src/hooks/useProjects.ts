import { useLiveQuery } from "dexie-react-hooks";
import db from "@/lib/db";
import {
  createEmptyGameDesignDoc,
  getTemplateDefinition
} from "@/lib/templates/genreTemplates";
import type {
  AgentPlatform,
  BuildStage,
  GameDesignDoc,
  GameDesignDocSeed,
  GamePlatformTarget,
  GeneratedArtifact,
  Project,
  ProjectStatus,
  ScopeCategory,
  TemplateId,
  VaultFile
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
  gameDesignDoc?: GameDesignDocSeed;
}

export interface ImportProjectBundleInput {
  project: Partial<Project> &
    Pick<Project, "title" | "oneLinePitch" | "scopeCategory" | "templateId">;
  gameDesignDoc?: GameDesignDocSeed | null;
  artifacts?: GeneratedArtifact[];
  buildStages?: BuildStage[];
  vaultFiles?: VaultFile[];
}

interface UpdateProjectInput {
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

const buildProjectRecord = (input: CreateProjectInput, id?: string): Project => {
  const templateId = input.templateId ?? "blank-game-project";
  const template = getTemplateDefinition(templateId);
  const now = Date.now();
  const title = input.title ?? input.name ?? "Untitled Game Project";
  const oneLinePitch = input.oneLinePitch ?? input.description ?? "";
  const scopeCategory = input.scopeCategory ?? template.defaultProject.scopeCategory ?? "small";
  const agentTargets =
    input.agentTargets ??
    input.targetPlatforms ??
    template.defaultProject.agentTargets ??
    [];

  return {
    id: id ?? crypto.randomUUID(),
    title,
    name: input.name ?? title,
    oneLinePitch,
    description: input.description ?? oneLinePitch,
    status: input.status ?? "concept",
    scopeCategory,
    genre: input.genre ?? template.defaultProject.genre ?? "",
    subgenre: input.subgenre ?? template.defaultProject.subgenre ?? "",
    platformTargets:
      input.platformTargets ?? template.defaultProject.platformTargets ?? ["pc", "web"],
    agentTargets,
    targetPlatforms: input.targetPlatforms ?? agentTargets,
    targetAudience:
      input.targetAudience ?? template.defaultProject.targetAudience ?? "",
    sessionLength:
      input.sessionLength ?? template.defaultProject.sessionLength ?? "",
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

const syncProjectIntoGameDesignDoc = (
  project: Project,
  seed?: GameDesignDocSeed | null
): GameDesignDoc => {
  const template = getTemplateDefinition(project.templateId);
  const seedConcept: Partial<GameDesignDoc["concept"]> = seed?.concept ?? {};
  const seedTechnical: Partial<GameDesignDoc["technicalDesign"]> =
    seed?.technicalDesign ?? {};
  return createEmptyGameDesignDoc(project.id, {
    ...template.defaultDoc,
    ...seed,
    projectId: project.id,
    concept: {
      ...(template.defaultDoc.concept ?? {}),
      ...seedConcept,
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
      playerFantasy: seedConcept.playerFantasy ?? "",
      differentiators: seedConcept.differentiators ?? ""
    },
    technicalDesign: {
      ...(template.defaultDoc.technicalDesign ?? {}),
      ...seedTechnical,
      engine: seedTechnical.engine ?? project.enginePreference,
      renderingConstraints: seedTechnical.renderingConstraints ?? "",
      targetFramerate: seedTechnical.targetFramerate ?? "",
      memoryPerformanceBudget: seedTechnical.memoryPerformanceBudget ?? "",
      saveSystem: seedTechnical.saveSystem ?? "",
      contentPipeline: seedTechnical.contentPipeline ?? "",
      namingConventions: seedTechnical.namingConventions ?? "",
      folderStructure: seedTechnical.folderStructure ?? "",
      platformConstraints: seedTechnical.platformConstraints ?? ""
    }
  });
};

export const useProjects = () => {
  const projectsQuery = useLiveQuery(
    async () => db.projects.orderBy("updatedAt").reverse().toArray(),
    []
  );

  const projects = projectsQuery ?? [];
  const isLoading = projectsQuery === undefined;

  const createProject = async (
    input: CreateProjectInput
  ): Promise<Project | null> => {
    try {
      const project = buildProjectRecord(input);
      const gameDesignDoc = syncProjectIntoGameDesignDoc(project, input.gameDesignDoc);

      await db.transaction("rw", [db.projects, db.gameDesignDocs], async () => {
        await db.projects.add(project);
        await db.gameDesignDocs.add(gameDesignDoc);
      });

      return project;
    } catch (error) {
      console.error("Failed to create project.", error);
      return null;
    }
  };

  const importProjectBundle = async (
    input: ImportProjectBundleInput
  ): Promise<Project | null> => {
    try {
      const project = buildProjectRecord(input.project);
      const gameDesignDoc = syncProjectIntoGameDesignDoc(project, input.gameDesignDoc);
      const now = Date.now();
      const artifacts = (input.artifacts ?? []).map((artifact) => ({
        ...artifact,
        id: crypto.randomUUID(),
        projectId: project.id,
        createdAt: artifact.createdAt ?? now
      }));
      const buildStages = (input.buildStages ?? []).map((stage, index) => ({
        ...stage,
        id: crypto.randomUUID(),
        projectId: project.id,
        stageNumber: stage.stageNumber ?? index + 1,
        createdAt: stage.createdAt ?? now,
        updatedAt: stage.updatedAt ?? now
      }));
      const vaultFiles = (input.vaultFiles ?? []).map((file) => ({
        ...file,
        id: crypto.randomUUID(),
        projectId: project.id,
        uploadedAt: file.uploadedAt ?? now
      }));

      await db.transaction(
        "rw",
        [db.projects, db.gameDesignDocs, db.artifacts, db.buildStages, db.vaultFiles],
        async () => {
          await db.projects.add(project);
          await db.gameDesignDocs.add(gameDesignDoc);
          if (artifacts.length > 0) {
            await db.artifacts.bulkAdd(artifacts);
          }
          if (buildStages.length > 0) {
            await db.buildStages.bulkAdd(buildStages);
          }
          if (vaultFiles.length > 0) {
            await db.vaultFiles.bulkAdd(vaultFiles);
          }
        }
      );

      return project;
    } catch (error) {
      console.error("Failed to import project bundle.", error);
      return null;
    }
  };

  const updateProject = async (
    projectId: string,
    updates: UpdateProjectInput
  ): Promise<void> => {
    try {
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

      await db.transaction("rw", [db.projects, db.gameDesignDocs], async () => {
        await db.projects.put(nextProject);

        const existingDoc = await db.gameDesignDocs
          .where("projectId")
          .equals(projectId)
          .first();

        if (existingDoc) {
          await db.gameDesignDocs.put({
            ...existingDoc,
            concept: {
              ...existingDoc.concept,
              gameTitle: nextProject.title,
              oneLinePitch: nextProject.oneLinePitch,
              genre: nextProject.genre,
              subgenre: nextProject.subgenre,
              platformTargets: nextProject.platformTargets,
              targetAudience: nextProject.targetAudience,
              sessionLength: nextProject.sessionLength,
              monetizationModel: nextProject.monetizationModel,
              comparableGames: nextProject.comparableGames,
              scopeCategory: nextProject.scopeCategory
            },
            technicalDesign: {
              ...existingDoc.technicalDesign,
              engine:
                existingDoc.technicalDesign.engine || nextProject.enginePreference
            },
            updatedAt: Date.now()
          });
        }
      });
    } catch (error) {
      console.error("Failed to update project.", error);
    }
  };

  const deleteProject = async (projectId: string): Promise<void> => {
    try {
      await db.transaction(
        "rw",
        [
          db.projects,
          db.gameDesignDocs,
          db.artifacts,
          db.vaultFiles,
          db.buildStages
        ],
        async () => {
          await db.projects.delete(projectId);
          await db.gameDesignDocs.where("projectId").equals(projectId).delete();
          await db.artifacts.where("projectId").equals(projectId).delete();
          await db.vaultFiles.where("projectId").equals(projectId).delete();
          await db.buildStages.where("projectId").equals(projectId).delete();
        }
      );
    } catch (error) {
      console.error("Failed to delete project.", error);
    }
  };

  return {
    projects,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    importProjectBundle
  };
};
