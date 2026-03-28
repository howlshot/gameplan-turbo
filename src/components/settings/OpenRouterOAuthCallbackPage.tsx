import { useEffect } from "react";
import { completeOpenRouterOAuthInPopup } from "@/lib/ai/openRouterOAuth";

export const OpenRouterOAuthCallbackPage = (): JSX.Element => {
  useEffect(() => {
    completeOpenRouterOAuthInPopup();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-container-lowest px-6 text-on-surface">
      <div className="max-w-md rounded-3xl border border-outline-variant/10 bg-surface-container p-8 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
          OpenRouter Sign-In
        </p>
        <h1 className="mt-4 font-headline text-2xl font-semibold">
          Finishing sign-in
        </h1>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">
          This window should close automatically. If it stays open, you can close
          it and return to Gameplan Turbo.
        </p>
      </div>
    </div>
  );
};
