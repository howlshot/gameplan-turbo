import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { app, BrowserWindow, shell } from "electron";
import { startManagedBridgeProcess, findAvailablePort, type ManagedBridgeProcess } from "./processManager.js";
import { startStaticServer, type StaticServerHandle } from "./staticServer.js";

const BRIDGE_HOST = "127.0.0.1";

interface DesktopRuntimeHandle {
  appOrigin: string;
  bridgeToken: string;
  claudeBridge: ManagedBridgeProcess;
  codexBridge: ManagedBridgeProcess;
  staticServer: StaticServerHandle | null;
}

let mainWindow: BrowserWindow | null = null;
let runtimeHandle: DesktopRuntimeHandle | null = null;

const __dirname = dirname(fileURLToPath(import.meta.url));

const isDevelopmentDesktop = (): boolean =>
  Boolean(process.env.GAMEPLAN_TURBO_ELECTRON_DEV_SERVER_URL);

const getProjectRoot = (): string => join(__dirname, "..");

const getStaticDistDir = (): string =>
  app.isPackaged ? join(app.getAppPath(), "dist") : join(getProjectRoot(), "dist");

const getBridgeScriptPath = (fileName: string): string =>
  app.isPackaged
    ? join(process.resourcesPath, "scripts", fileName)
    : join(getProjectRoot(), "scripts", fileName);

const createBridgeToken = (): string => randomBytes(32).toString("hex");

const configurePreloadEnvironment = (handle: DesktopRuntimeHandle): void => {
  process.env.GAMEPLAN_TURBO_DESKTOP_APP_VERSION = app.getVersion();
  process.env.GAMEPLAN_TURBO_DESKTOP_RELEASE_URL =
    "https://github.com/howlshot/gameplan-turbo/releases/latest";
  process.env.GAMEPLAN_TURBO_DESKTOP_CODEX_BRIDGE_URL = handle.codexBridge.url;
  process.env.GAMEPLAN_TURBO_DESKTOP_CLAUDE_BRIDGE_URL = handle.claudeBridge.url;
};

const getAppEntryUrl = (appOrigin: string, bridgeToken: string): string =>
  `${appOrigin}/#bridgeToken=${encodeURIComponent(bridgeToken)}`;

const createWindow = async (): Promise<void> => {
  if (!runtimeHandle) {
    throw new Error("Desktop runtime was not initialized.");
  }

  const preloadPath = join(__dirname, "preload.js");
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1180,
    minHeight: 760,
    title: "Gameplan Turbo",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: preloadPath
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  await mainWindow.loadURL(
    getAppEntryUrl(runtimeHandle.appOrigin, runtimeHandle.bridgeToken)
  );
};

const initializeDesktopRuntime = async (): Promise<DesktopRuntimeHandle> => {
  const logsDir = join(app.getPath("userData"), "logs");
  mkdirSync(logsDir, { recursive: true });

  const bridgeToken = createBridgeToken();
  const appOrigin = process.env.GAMEPLAN_TURBO_ELECTRON_DEV_SERVER_URL?.trim();

  const staticServer =
    appOrigin && appOrigin.length > 0
      ? null
      : await startStaticServer(getStaticDistDir());

  const resolvedOrigin = appOrigin || staticServer?.origin;

  if (!resolvedOrigin) {
    throw new Error("Desktop app origin could not be determined.");
  }

  const [codexPort, claudePort] = await Promise.all([
    findAvailablePort(),
    findAvailablePort()
  ]);

  const [codexBridge, claudeBridge] = await Promise.all([
    startManagedBridgeProcess({
      appOrigin: resolvedOrigin,
      bridgeHost: BRIDGE_HOST,
      bridgeToken,
      electronBinaryPath: process.execPath,
      logDir: logsDir,
      name: "codex",
      port: codexPort,
      scriptPath: getBridgeScriptPath("codex-bridge.mjs")
    }),
    startManagedBridgeProcess({
      appOrigin: resolvedOrigin,
      bridgeHost: BRIDGE_HOST,
      bridgeToken,
      electronBinaryPath: process.execPath,
      logDir: logsDir,
      name: "claude",
      port: claudePort,
      scriptPath: getBridgeScriptPath("claude-bridge.mjs")
    })
  ]);

  const handle: DesktopRuntimeHandle = {
    appOrigin: resolvedOrigin,
    bridgeToken,
    codexBridge,
    claudeBridge,
    staticServer
  };

  configurePreloadEnvironment(handle);
  process.env.GAMEPLAN_TURBO_BRIDGE_TOKEN = bridgeToken;

  return handle;
};

const closeDesktopRuntime = async (): Promise<void> => {
  if (!runtimeHandle) {
    return;
  }

  await Promise.allSettled([
    runtimeHandle.codexBridge.close(),
    runtimeHandle.claudeBridge.close(),
    runtimeHandle.staticServer?.close()
  ]);
  runtimeHandle = null;
};

app.on("window-all-closed", () => {
  app.quit();
});

app.on("will-quit", (event) => {
  if (!runtimeHandle) {
    return;
  }

  event.preventDefault();
  void closeDesktopRuntime().finally(() => {
    app.exit();
  });
});

app.whenReady()
  .then(async () => {
    if (!isDevelopmentDesktop() && !existsSync(getStaticDistDir())) {
      throw new Error(
        `Desktop bundle is missing the built frontend at ${getStaticDistDir()}. Run \`pnpm build\` first.`
      );
    }

    runtimeHandle = await initializeDesktopRuntime();
    await createWindow();
  })
  .catch((error) => {
    console.error("Failed to launch the Gameplan Turbo desktop app.", error);
    app.exit(1);
  });
