import Dexie from "dexie";
import {
  APP_DATABASE_NAME,
  LEGACY_APP_DATABASE_NAME
} from "@/lib/brand";
import { GameplanTurboDatabase } from "@/lib/db-schema";
import { initializeDatabaseDefaults } from "@/lib/db-defaults";
import {
  DEFAULT_AGENT_PROMPTS,
  DEFAULT_PLATFORM_LAUNCHERS
} from "@/lib/db-seeds";

class LegacyPreflightGameOsDatabase extends Dexie {
  constructor() {
    super(LEGACY_APP_DATABASE_NAME);

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
  }
}

const hasCurrentWorkspaceData = async (
  db: GameplanTurboDatabase
): Promise<boolean> => {
  const counts = await Promise.all([
    db.projects.count(),
    db.gameDesignDocs.count(),
    db.artifacts.count(),
    db.vaultFiles.count(),
    db.buildStages.count(),
    db.aiProviders.count(),
    db.projectVersions.count(),
    db.credentials.count()
  ]);

  return counts.some((count) => count > 0);
};

const migrateLegacyDatabaseIfNeeded = async (
  db: GameplanTurboDatabase
): Promise<void> => {
  if (await hasCurrentWorkspaceData(db)) {
    return;
  }

  if (!(await Dexie.exists(LEGACY_APP_DATABASE_NAME))) {
    return;
  }

  const legacyDb = new LegacyPreflightGameOsDatabase();

  try {
    await legacyDb.open();

    const [
      projects,
      gameDesignDocs,
      artifacts,
      vaultFiles,
      buildStages,
      aiProviders,
      agentSystemPrompts,
      appSettings,
      projectVersions,
      credentials
    ] = await Promise.all([
      legacyDb.table("projects").toArray(),
      legacyDb.table("gameDesignDocs").toArray(),
      legacyDb.table("artifacts").toArray(),
      legacyDb.table("vaultFiles").toArray(),
      legacyDb.table("buildStages").toArray(),
      legacyDb.table("aiProviders").toArray(),
      legacyDb.table("agentSystemPrompts").toArray(),
      legacyDb.table("appSettings").toArray(),
      legacyDb.table("projectVersions").toArray(),
      legacyDb.table("credentials").toArray()
    ]);

    if (
      ![
        projects,
        gameDesignDocs,
        artifacts,
        vaultFiles,
        buildStages,
        aiProviders,
        agentSystemPrompts,
        appSettings,
        projectVersions,
        credentials
      ].some((rows) => rows.length > 0)
    ) {
      return;
    }

    await db.transaction(
      "rw",
      [
        db.projects,
        db.gameDesignDocs,
        db.artifacts,
        db.vaultFiles,
        db.buildStages,
        db.aiProviders,
        db.agentSystemPrompts,
        db.appSettings,
        db.projectVersions,
        db.credentials
      ],
      async () => {
        if (projects.length > 0) {
          await db.projects.bulkPut(projects);
        }
        if (gameDesignDocs.length > 0) {
          await db.gameDesignDocs.bulkPut(gameDesignDocs);
        }
        if (artifacts.length > 0) {
          await db.artifacts.bulkPut(artifacts);
        }
        if (vaultFiles.length > 0) {
          await db.vaultFiles.bulkPut(vaultFiles);
        }
        if (buildStages.length > 0) {
          await db.buildStages.bulkPut(buildStages);
        }
        if (aiProviders.length > 0) {
          await db.aiProviders.bulkPut(aiProviders);
        }
        if (agentSystemPrompts.length > 0) {
          await db.agentSystemPrompts.bulkPut(agentSystemPrompts);
        }
        if (appSettings.length > 0) {
          await db.appSettings.bulkPut(appSettings);
        }
        if (projectVersions.length > 0) {
          await db.projectVersions.bulkPut(projectVersions);
        }
        if (credentials.length > 0) {
          await db.credentials.bulkPut(credentials);
        }
      }
    );
  } catch (error) {
    console.warn(
      `Failed to import legacy ${LEGACY_APP_DATABASE_NAME} data into ${APP_DATABASE_NAME}.`,
      error
    );
  } finally {
    legacyDb.close();
  }
};

interface GameplanTurboDatabaseWithDefaults extends GameplanTurboDatabase {
  initializeDefaults: () => Promise<void>;
}

const db = new GameplanTurboDatabase() as GameplanTurboDatabaseWithDefaults;

db.initializeDefaults = async () => {
  await migrateLegacyDatabaseIfNeeded(db);
  await initializeDatabaseDefaults(db);
};

export default db;
export {
  DEFAULT_AGENT_PROMPTS,
  DEFAULT_PLATFORM_LAUNCHERS,
  initializeDatabaseDefaults,
  GameplanTurboDatabase
};
