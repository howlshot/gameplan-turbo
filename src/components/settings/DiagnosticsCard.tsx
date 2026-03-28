import { useCallback, useEffect, useState } from "react";
import {
  fetchCodexBridgeStatus,
  getCodexBridgeStartCommand,
  getCodexLoginCommand,
  openCodexLoginFlow,
  type CodexBridgeStatus
} from "@/lib/codexBridge";
import { APP_NAME } from "@/lib/brand";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

const REFRESH_INTERVAL_MS = 15000;

const statusTone = (
  status: CodexBridgeStatus | null,
  isLoading: boolean
): {
  dotClassName: string;
  label: string;
  labelClassName: string;
} => {
  if (isLoading) {
    return {
      dotClassName: "bg-outline",
      label: "Checking",
      labelClassName: "text-on-surface-variant"
    };
  }

  if (!status?.cliAvailable) {
    return {
      dotClassName: "bg-tertiary",
      label: "CLI Missing",
      labelClassName: "text-tertiary"
    };
  }

  if (!status.loggedIn) {
    return {
      dotClassName: "bg-tertiary",
      label: "Login Required",
      labelClassName: "text-tertiary"
    };
  }

  if (!status.ok) {
    return {
      dotClassName: "bg-tertiary",
      label: "Bridge Offline",
      labelClassName: "text-tertiary"
    };
  }

  return {
    dotClassName: "bg-secondary",
    label: "Bridge Ready",
    labelClassName: "text-secondary"
  };
};

export const DiagnosticsCard = (): JSX.Element => {
  const toast = useToast();
  const [status, setStatus] = useState<CodexBridgeStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOpeningLogin, setIsOpeningLogin] = useState(false);

  const loadStatus = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      const nextStatus = await fetchCodexBridgeStatus();
      setStatus(nextStatus);
      setErrorMessage(null);
    } catch (error) {
      setStatus(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not reach the local Codex bridge."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOpenLogin = useCallback(async (): Promise<void> => {
    setIsOpeningLogin(true);

    try {
      await openCodexLoginFlow();
      toast.success("Opened the Codex login flow in Terminal.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not open the Codex login flow.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsOpeningLogin(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadStatus();

    const timer = window.setInterval(() => {
      void loadStatus();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [loadStatus]);

  const tone = statusTone(status, isLoading);

  return (
    <section className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">terminal</span>
          <h2 className="font-headline text-lg font-semibold uppercase tracking-[0.14em] text-on-surface">
            Codex Bridge
          </h2>
        </div>
        <button
          type="button"
          onClick={() => void loadStatus()}
          className="rounded-xl bg-surface px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
        >
          Refresh
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className={cn("h-2.5 w-2.5 rounded-full", tone.dotClassName)} />
          <span className={cn("font-mono text-[10px] uppercase tracking-[0.2em]", tone.labelClassName)}>
            {tone.label}
          </span>
        </div>

        <div className="rounded-xl border border-outline-variant/10 bg-surface px-4 py-4">
          <p className="text-sm leading-6 text-on-surface-variant">
            {errorMessage ?? status?.message ?? "Checking Codex bridge status..."}
          </p>
        </div>

        <dl className="grid gap-3 text-sm text-on-surface-variant sm:grid-cols-2">
          <div className="rounded-xl bg-surface px-4 py-3">
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-outline">
              Codex CLI
            </dt>
            <dd className="mt-2 text-on-surface">
              {status?.codexVersion ?? "Not detected"}
            </dd>
          </div>
          <div className="rounded-xl bg-surface px-4 py-3">
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-outline">
              Login Method
            </dt>
            <dd className="mt-2 text-on-surface">
              {status?.loginMethod ?? (status?.loggedIn ? "Detected" : "Not logged in")}
            </dd>
          </div>
        </dl>

        <div className="space-y-2 rounded-xl border border-outline-variant/10 bg-surface px-4 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-outline">
            Local Commands
          </p>
          <p className="text-sm text-on-surface-variant">
            1. Login: <code>{getCodexLoginCommand()}</code>
          </p>
          <p className="text-sm text-on-surface-variant">
            2. Start bridge: <code>{getCodexBridgeStartCommand()}</code>
          </p>
          <p className="text-sm text-on-surface-variant">
            3. Keep that Terminal window open while using {APP_NAME}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => void handleOpenLogin()}
              disabled={isOpeningLogin}
              className="rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary transition hover:bg-primary/15 disabled:opacity-60"
            >
              {isOpeningLogin ? "Opening..." : "Open ChatGPT Sign-In"}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant/10 bg-surface px-4 py-4">
          <p className="font-semibold text-on-surface">What success looks like</p>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            This panel should show <strong>Bridge Ready</strong> and a login method of
            <strong> ChatGPT</strong> or another detected Codex auth method.
          </p>
        </div>
      </div>
    </section>
  );
};
