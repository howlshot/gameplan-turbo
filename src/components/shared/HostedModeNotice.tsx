import { useEffect, useState } from "react";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { useWebSurface } from "@/hooks/useWebSurface";
import {
  APP_LATEST_DESKTOP_RELEASE_URL,
  APP_NAME
} from "@/lib/brand";
import { isHostedRuntime } from "@/lib/runtimeMode";

export const HOSTED_MODE_NOTICE_STORAGE_KEY =
  "gameplan-turbo:hosted-mode-notice-dismissed";

export const getHasDismissedHostedNotice = (): boolean =>
  localStorage.getItem(HOSTED_MODE_NOTICE_STORAGE_KEY) === "true";

export const dismissHostedNotice = (): void => {
  localStorage.setItem(HOSTED_MODE_NOTICE_STORAGE_KEY, "true");
};

export const HostedModeNotice = (): JSX.Element | null => {
  const [isOpen, setIsOpen] = useState(false);
  const surface = useWebSurface();
  const isMobileSurface = surface === "mobile-web";
  const dialogRef = useDialogAccessibility<HTMLDivElement>(isOpen, () => {
    dismissHostedNotice();
    setIsOpen(false);
  });

  useEffect(() => {
    if (!isHostedRuntime() || getHasDismissedHostedNotice()) {
      return;
    }

    setIsOpen(true);
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[110] bg-surface-dim/80 backdrop-blur-sm ${
        isMobileSurface ? "flex items-end px-0" : "flex items-center justify-center px-4"
      }`}
      onClick={() => {
        dismissHostedNotice();
        setIsOpen(false);
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hosted-mode-title"
        className={`glass-panel w-full border border-outline-variant/15 bg-surface-container ${
          isMobileSurface
            ? "max-h-[92vh] overflow-y-auto rounded-t-[28px] px-4 pb-6 pt-5"
            : "max-w-2xl rounded-2xl p-6"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              Hosted Mode
            </p>
            <h2
              id="hosted-mode-title"
              className={`mt-2 font-headline font-semibold text-on-surface ${
                isMobileSurface ? "text-xl" : "text-2xl"
              }`}
            >
              You are using the browser-hosted version
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              dismissHostedNotice();
              setIsOpen(false);
            }}
            className="rounded-full p-2 text-on-surface-variant transition hover:bg-surface hover:text-on-surface"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm leading-6 text-on-surface-variant">
          <p>
            This version is great for planning, roadmap generation, exports,
            OpenRouter, and API-key providers.
          </p>
          <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-4">
            <p className="font-semibold text-on-surface">Choose the path that matches what you want to do</p>
            <div className="mt-3 space-y-2">
              <p>
                <strong>Stay in browser</strong> if you want to map the game, generate the roadmap,
                export planning files, or connect OpenRouter / API-key providers.
              </p>
              <p>
                Hosted providers stay only for the current browser session unless you
                explicitly choose <strong>Remember on this device</strong>.
              </p>
              <p>
                <strong>Download Desktop</strong> if you want local bridge sign-in with Codex or Claude Code.
              </p>
              <p>
                <strong>Skip AI for now</strong> if you want to create a project and generate the roadmap first.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-outline-variant/10 bg-surface px-4 py-4">
            <p className="font-semibold text-on-surface">Why desktop is separate</p>
            <p className="mt-2">
              Those local bridge sign-ins are available when you download or run the
              local desktop version of {APP_NAME}. The hosted app keeps those flows
              off by default for safety.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={() => {
              dismissHostedNotice();
              setIsOpen(false);
            }}
            className="gradient-cta glow-primary rounded-xl px-4 py-3 text-sm font-semibold text-on-primary"
          >
            Stay in Browser
          </button>
          <a
            href={APP_LATEST_DESKTOP_RELEASE_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-outline-variant/15 bg-surface px-4 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high"
          >
            Download Desktop
          </a>
        </div>
      </div>
    </div>
  );
};
