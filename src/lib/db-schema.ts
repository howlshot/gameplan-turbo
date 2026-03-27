import Dexie, { type Table } from "dexie";
import type {
  AgentSystemPrompt,
  AIProviderConfig,
  AppSettings,
  Brief,
  BuildStage,
  Credential,
  GameDesignDoc,
  GeneratedArtifact,
  Project,
  ProjectVersion,
  VaultFile
} from "@/types";

export class PreflightDatabase extends Dexie {
  projects!: Table<Project, string>;
  gameDesignDocs!: Table<GameDesignDoc, string>;
  briefs!: Table<Brief | GameDesignDoc, string>;
  artifacts!: Table<GeneratedArtifact, string>;
  vaultFiles!: Table<VaultFile, string>;
  buildStages!: Table<BuildStage, string>;
  aiProviders!: Table<AIProviderConfig, string>;
  agentSystemPrompts!: Table<AgentSystemPrompt, string>;
  appSettings!: Table<AppSettings, string>;
  projectVersions!: Table<ProjectVersion, string>;
  credentials!: Table<Credential, string>;

  constructor() {
    super("preflight-game-os");

    this.version(1).stores({
      projects: "id, status, updatedAt, templateId",
      gameDesignDocs: "id, projectId, updatedAt",
      artifacts: "id, projectId, type, createdAt",
      vaultFiles: "id, projectId, category, isActiveContext",
      buildStages: "id, projectId, stageNumber, stageKey",
      aiProviders: "id, provider, isDefault",
      agentSystemPrompts: "id, agentType, isDefault",
      appSettings: "id",
      projectVersions: "id, projectId, createdAt",
      credentials: "id, projectId, category"
    });

    // Legacy alias so old hooks/components still type-check while the visible app
    // uses gameDesignDocs.
    this.briefs = this.table("gameDesignDocs") as unknown as Table<
      Brief | GameDesignDoc,
      string
    >;
  }
}
