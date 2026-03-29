import Dexie from "dexie";
import db from "@/lib/db";
import {
  APP_CHECKPOINT_STORAGE_KEY,
  LEGACY_APP_DATABASE_NAME,
  LEGACY_CHECKPOINT_STORAGE_KEY
} from "@/lib/brand";
import { clearSessionProviderConfigs } from "@/lib/providerStorage";
import { estimateTokens } from "@/lib/utils";
import {
  createEmptyGameDesignDoc,
  getTemplateDefinition
} from "@/lib/templates/genreTemplates";
import type {
  AgentSystemPrompt,
  AIProviderConfig,
  AppSettings,
  Brief,
  BuildStage,
  GameDesignDoc,
  GeneratedArtifact,
  Project,
  VaultFile
} from "@/types";

export interface ExportedAppData {
  exportedAt: number;
  version: string;
  projects: Project[];
  gameDesignDocs: GameDesignDoc[];
  artifacts: GeneratedArtifact[];
  buildStages: BuildStage[];
  vaultFiles: Array<
    Omit<VaultFile, "data"> & {
      hasData: boolean;
      dataSize?: number;
    }
  >;
  aiProviders: Array<Omit<AIProviderConfig, "apiKey"> & { apiKeyMasked: string }>;
  agentSystemPrompts: AgentSystemPrompt[];
  appSettings: AppSettings | null;
}

export interface UsageLogEntry {
  id: string;
  createdAt: number;
  label: string;
  meta: string;
}

const maskStoredKey = (apiKey: string): string => {
  if (!apiKey.trim()) {
    return "";
  }

  if (apiKey.length <= 10) {
    return `${apiKey.slice(0, 2)}...${apiKey.slice(-2)}`;
  }

  return `${apiKey.slice(0, 7)}...${apiKey.slice(-3)}`;
};

export const mapLegacyBriefToGameDesignDoc = (
  project: Project,
  brief?: Brief | null
): GameDesignDoc => {
  const template = getTemplateDefinition(project.templateId);
  const templatePillars: Partial<GameDesignDoc["designPillars"]> =
    template.defaultDoc.designPillars ?? {};
  const templateLoop: Partial<GameDesignDoc["coreLoop"]> =
    template.defaultDoc.coreLoop ?? {};
  const templateArt: Partial<GameDesignDoc["artTone"]> =
    template.defaultDoc.artTone ?? {};
  return createEmptyGameDesignDoc(project.id, {
    ...template.defaultDoc,
    concept: {
      ...(template.defaultDoc.concept ?? {}),
      gameTitle: project.title,
      oneLinePitch: project.oneLinePitch,
      playerFantasy: brief?.problem ?? "",
      genre: project.genre,
      subgenre: project.subgenre,
      platformTargets: project.platformTargets,
      targetAudience: brief?.targetUser ?? project.targetAudience,
      sessionLength: project.sessionLength,
      monetizationModel: project.monetizationModel,
      comparableGames: project.comparableGames,
      scopeCategory: project.scopeCategory,
      differentiators: brief?.notes ?? ""
    },
    designPillars: {
      ...templatePillars,
      pillars:
        brief?.coreFeatures.map((feature) => feature.text.trim()).filter(Boolean) ?? [],
      feelStatement: templatePillars.feelStatement ?? "",
      antiGoals: templatePillars.antiGoals ?? [],
      emotionalTargets: brief?.inspirations ?? [],
      readabilityPrinciples: templatePillars.readabilityPrinciples ?? ""
    },
    coreLoop: {
      ...templateLoop,
      secondToSecond: brief?.notes ?? "",
      minuteToMinute: templateLoop.minuteToMinute ?? "",
      sessionLoop: templateLoop.sessionLoop ?? "",
      longTermProgression: templateLoop.longTermProgression ?? "",
      failureStates: templateLoop.failureStates ?? "",
      rewardCadence: templateLoop.rewardCadence ?? ""
    },
    artTone: {
      ...templateArt,
      artDirection: templateArt.artDirection ?? "",
      toneKeywords: templateArt.toneKeywords ?? [],
      visualReferences: brief?.inspirations ?? [],
      negativeReferences: templateArt.negativeReferences ?? [],
      animationStyle: templateArt.animationStyle ?? "",
      vfxDirection: templateArt.vfxDirection ?? "",
      audioMusicDirection: templateArt.audioMusicDirection ?? ""
    }
  });
};

export const exportAppData = async (): Promise<ExportedAppData> => {
  const [
    projects,
    gameDesignDocs,
    artifacts,
    buildStages,
    vaultFiles,
    aiProviders,
    agentSystemPrompts,
    appSettings
  ] = await Promise.all([
    db.projects.toArray(),
    db.gameDesignDocs.toArray(),
    db.artifacts.toArray(),
    db.buildStages.toArray(),
    db.vaultFiles.toArray(),
    db.aiProviders.toArray(),
    db.agentSystemPrompts.toArray(),
    db.appSettings.get("app-settings")
  ]);

  return {
    exportedAt: Date.now(),
    version: "1.0.0-game-os-v1",
    projects,
    gameDesignDocs,
    artifacts,
    buildStages,
    vaultFiles: vaultFiles.map((file) => {
      const { data, ...metadata } = file;
      return {
        ...metadata,
        hasData: true,
        dataSize: file.size
      };
    }),
    aiProviders: aiProviders.map(({ apiKey, ...provider }) => ({
      ...provider,
      apiKeyMasked: maskStoredKey(apiKey)
    })),
    agentSystemPrompts,
    appSettings: appSettings ?? null
  };
};

export const getUsageLogs = async (): Promise<UsageLogEntry[]> => {
  const artifacts = await db.artifacts.orderBy("createdAt").reverse().toArray();

  return artifacts.map((artifact) => ({
    id: artifact.id,
    createdAt: artifact.createdAt,
    label: artifact.type.replace(/_/g, " "),
    meta: `${artifact.platform} • ${estimateTokens(artifact.content)} tokens`
  }));
};

export const clearAllAppData = async (): Promise<void> => {
  await db.delete();
  await Dexie.delete(LEGACY_APP_DATABASE_NAME);
  localStorage.removeItem(APP_CHECKPOINT_STORAGE_KEY);
  localStorage.removeItem(LEGACY_CHECKPOINT_STORAGE_KEY);
  clearSessionProviderConfigs();
};
