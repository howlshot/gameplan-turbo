import { mapLegacyBriefToGameDesignDoc } from "@/lib/appData";
import type {
  BuildStage,
  GameDesignDoc,
  GeneratedArtifact,
  Project,
  ProjectStatus,
  VaultFile
} from "@/types";

export type FilterValue = "all" | ProjectStatus;
export type SortValue = "updated" | "created" | "name";
export type ViewMode = "grid" | "list";

export const FILTER_OPTIONS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Concept", value: "concept" },
  { label: "Preproduction", value: "preproduction" },
  { label: "Production", value: "production" },
  { label: "Playtesting", value: "playtesting" },
  { label: "Release Prep", value: "release-prep" }
];

export interface ImportedProjectBundleShape {
  project: Partial<Project> &
    Pick<Project, "title" | "oneLinePitch" | "scopeCategory" | "templateId">;
  gameDesignDoc?: Partial<GameDesignDoc> | null;
  artifacts?: GeneratedArtifact[];
  buildStages?: BuildStage[];
  vaultFiles?: VaultFile[];
}

const isProjectStatus = (value: string): value is ProjectStatus =>
  [
    "concept",
    "preproduction",
    "production",
    "playtesting",
    "release-prep",
    "ideation",
    "researching",
    "designing",
    "building",
    "shipped"
  ].includes(value);

const normalizeProject = (item: Record<string, unknown>): ImportedProjectBundleShape["project"] => {
  const title =
    typeof item.title === "string"
      ? item.title
      : typeof item.name === "string"
        ? item.name
        : "Imported Game Project";
  const oneLinePitch =
    typeof item.oneLinePitch === "string"
      ? item.oneLinePitch
      : typeof item.description === "string"
        ? item.description
        : "";

  return {
    title,
    name: title,
    oneLinePitch,
    description: oneLinePitch,
    status:
      typeof item.status === "string" && isProjectStatus(item.status)
        ? item.status
        : "concept",
    scopeCategory:
      item.scopeCategory === "tiny" ||
      item.scopeCategory === "small" ||
      item.scopeCategory === "medium" ||
      item.scopeCategory === "large"
        ? item.scopeCategory
        : "small",
    genre: typeof item.genre === "string" ? item.genre : "",
    subgenre: typeof item.subgenre === "string" ? item.subgenre : "",
    platformTargets: Array.isArray(item.platformTargets)
      ? item.platformTargets.filter((value): value is Project["platformTargets"][number] => typeof value === "string")
      : ["pc", "web"],
    agentTargets: Array.isArray(item.agentTargets)
      ? item.agentTargets.filter((value): value is Project["agentTargets"][number] => typeof value === "string")
      : Array.isArray(item.targetPlatforms)
        ? item.targetPlatforms.filter((value): value is Project["agentTargets"][number] => typeof value === "string")
        : ["codex", "cursor"],
    targetPlatforms: Array.isArray(item.targetPlatforms)
      ? item.targetPlatforms.filter((value): value is Project["agentTargets"][number] => typeof value === "string")
      : Array.isArray(item.agentTargets)
        ? item.agentTargets.filter((value): value is Project["agentTargets"][number] => typeof value === "string")
        : ["codex", "cursor"],
    targetAudience: typeof item.targetAudience === "string" ? item.targetAudience : "",
    sessionLength: typeof item.sessionLength === "string" ? item.sessionLength : "",
    monetizationModel:
      typeof item.monetizationModel === "string" ? item.monetizationModel : "",
    comparableGames: Array.isArray(item.comparableGames)
      ? item.comparableGames.filter((value): value is string => typeof value === "string")
      : [],
    templateId:
      item.templateId === "arcade-action-rail-shooter"
        ? "arcade-action-rail-shooter"
        : "blank-game-project",
    enginePreference:
      typeof item.enginePreference === "string" ? item.enginePreference : "",
    techStack: Array.isArray(item.techStack)
      ? item.techStack.filter((value): value is string => typeof value === "string")
      : []
  };
};

export const parseImportedProjects = (
  payload: unknown
): ImportedProjectBundleShape[] => {
  const collection =
    Array.isArray(payload)
      ? payload
      : typeof payload === "object" &&
          payload !== null &&
          Array.isArray((payload as { projects?: unknown[] }).projects)
        ? (payload as { projects: unknown[] }).projects
        : null;

  if (!collection) {
    throw new Error("Expected an array of projects or a { projects: [] } payload.");
  }

  const gameDesignDocs =
    typeof payload === "object" && payload !== null && Array.isArray((payload as { gameDesignDocs?: unknown[] }).gameDesignDocs)
      ? ((payload as { gameDesignDocs: unknown[] }).gameDesignDocs.filter(
          (item): item is Record<string, unknown> => typeof item === "object" && item !== null
        ) as Array<Record<string, unknown>>)
      : [];
  const legacyBriefs =
    typeof payload === "object" && payload !== null && Array.isArray((payload as { briefs?: unknown[] }).briefs)
      ? ((payload as { briefs: unknown[] }).briefs.filter(
          (item): item is Record<string, unknown> => typeof item === "object" && item !== null
        ) as Array<Record<string, unknown>>)
      : [];
  const artifacts =
    typeof payload === "object" && payload !== null && Array.isArray((payload as { artifacts?: GeneratedArtifact[] }).artifacts)
      ? (payload as { artifacts: GeneratedArtifact[] }).artifacts
      : [];
  const buildStages =
    typeof payload === "object" && payload !== null && Array.isArray((payload as { buildStages?: BuildStage[] }).buildStages)
      ? (payload as { buildStages: BuildStage[] }).buildStages
      : [];
  const vaultFiles =
    typeof payload === "object" && payload !== null && Array.isArray((payload as { vaultFiles?: VaultFile[] }).vaultFiles)
      ? (payload as { vaultFiles: VaultFile[] }).vaultFiles
      : [];

  return collection
    .filter(
      (item): item is Record<string, unknown> => typeof item === "object" && item !== null
    )
    .map((item) => {
      const normalizedProject = normalizeProject(item);
      const projectId = typeof item.id === "string" ? item.id : "";
      const gameDesignDoc =
        gameDesignDocs.find((doc) => doc.projectId === projectId) ??
        mapLegacyBriefToGameDesignDoc(
          {
            ...(normalizedProject as Project),
            id: projectId || crypto.randomUUID(),
            createdAt: Date.now(),
            updatedAt: Date.now()
          },
          (legacyBriefs.find((brief) => brief.projectId === projectId) ?? null) as never
        );

      return {
        project: normalizedProject,
        gameDesignDoc,
        artifacts: artifacts.filter((artifact) => artifact.projectId === projectId),
        buildStages: buildStages.filter((stage) => stage.projectId === projectId),
        vaultFiles: vaultFiles
          .filter((file) => file.projectId === projectId)
          .map((file) => ({
            ...file,
            data: file.data ?? new ArrayBuffer(0)
          }))
      };
    });
};
