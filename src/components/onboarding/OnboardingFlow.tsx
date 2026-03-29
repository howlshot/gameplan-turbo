import { useRef, useState } from "react";
import { OnboardingCompleteStep } from "@/components/onboarding/OnboardingCompleteStep";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { OnboardingProviderStep } from "@/components/onboarding/OnboardingProviderStep";
import { OnboardingTutorialStep } from "@/components/onboarding/OnboardingTutorialStep";
import { useAIProviders } from "@/hooks/useAIProviders";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import {
  getToolLoginProviderMeta
} from "@/lib/toolLoginProviders";
import { startOpenRouterOAuth } from "@/lib/ai/openRouterOAuth";
import { getSanitizedCustomApiKey } from "@/lib/ai/customProviderUtils";
import { getGenerationErrorState } from "@/lib/generationErrors";
import { PROVIDER_CATALOG } from "@/lib/ai/providerCatalog";
import { isDesktopRuntime, isHostedRuntime } from "@/lib/runtimeMode";
import { createProviderFromConfig } from "@/services/ai";
import { useToast } from "@/hooks/useToast";
import type { AIProvider } from "@/types";

interface OnboardingFlowProps {
  onComplete: () => Promise<void>;
}

type OnboardingStep = 1 | 2 | 3;

export const OnboardingFlow = ({
  onComplete
}: OnboardingFlowProps): JSX.Element => {
  const toast = useToast();
  const { saveProvider } = useAIProviders();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>("anthropic");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isStartingToolLogin, setIsStartingToolLogin] = useState(false);
  const [isStartingOAuth, setIsStartingOAuth] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [validationAttempts, setValidationAttempts] = useState(0);
  const hostedRuntime = isHostedRuntime();
  const desktopRuntime = isDesktopRuntime();
  const apiKeyRef = useRef<HTMLInputElement>(null);
  const baseUrlRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<HTMLInputElement>(null);
  const dialogRef = useDialogAccessibility<HTMLDivElement>(true, () => undefined);

  const handleSkipProvider = (): void => {
    setErrorMessage("");
    setValidationAttempts(0);
    setStep(2);
  };

  const handleVerifyProvider = async (): Promise<void> => {
    const apiKey = apiKeyRef.current?.value.trim() ?? "";
    const baseUrl = baseUrlRef.current?.value.trim() ?? "";
    const providerConfig = PROVIDER_CATALOG[selectedProvider];
    const model =
      modelRef.current?.value.trim() || providerConfig.defaultModel;
    const authMode = providerConfig.authMode ?? "api-key";
    const toolLoginProvider = getToolLoginProviderMeta(selectedProvider);
    const resolvedApiKey =
      selectedProvider === "custom"
        ? getSanitizedCustomApiKey(apiKey, baseUrl)
        : apiKey;

    if (toolLoginProvider) {
      if (hostedRuntime) {
        setErrorMessage(
          `${toolLoginProvider.label} is only available when Gameplan Turbo is running locally. Choose OpenRouter, an API-key provider, or skip for now in the hosted app.`
        );
        return;
      }

      setErrorMessage("");
      setIsVerifying(true);

      try {
        const status = await toolLoginProvider.fetchStatus();

        if (!status.cliAvailable) {
          setErrorMessage(`${toolLoginProvider.cliName} is not installed on this machine.`);
          return;
        }

        if (!status.loggedIn) {
          setErrorMessage(
            desktopRuntime
              ? `${toolLoginProvider.label} is not logged in yet. Use \`${toolLoginProvider.openLoginButtonLabel}\`, finish sign-in in your browser, then click \`${toolLoginProvider.continueButtonLabel}\`.`
              : `${toolLoginProvider.label} is not logged in. Run \`${toolLoginProvider.loginCommand}\`, then click \`${toolLoginProvider.continueButtonLabel}\`. If the bridge is unavailable, relaunch the desktop app or start it with \`${toolLoginProvider.startCommand}\`.`
          );
          return;
        }

        await saveProvider({
          provider: selectedProvider,
          apiKey: toolLoginProvider.sentinelApiKey,
          authMethod: authMode,
          isDefault: true,
          model: providerConfig.defaultModel
        });
        setValidationAttempts(0);
        toast.success(`${providerConfig.label} connected.`);
        setStep(2);
      } catch {
        setErrorMessage(
          desktopRuntime
            ? `${toolLoginProvider.connectionLabel} is offline. Relaunch the desktop app and try again.`
            : `${toolLoginProvider.connectionLabel} is offline. Relaunch the desktop app or start it with \`${toolLoginProvider.startCommand}\`, then try again.`
        );
      } finally {
        setIsVerifying(false);
      }

      return;
    }

    if (!resolvedApiKey) {
      setErrorMessage("Enter an API key to continue.");
      return;
    }

    if (selectedProvider === "custom" && !baseUrl) {
      setErrorMessage("Enter a base URL for the custom provider.");
      return;
    }

    setErrorMessage("");
    setIsVerifying(true);

    try {
      const provider = await createProviderFromConfig({
        id: "onboarding-provider",
        provider: selectedProvider,
        apiKey: resolvedApiKey,
        model,
        baseUrl: selectedProvider === "custom" ? baseUrl : undefined,
        authMethod: "api-key",
        isDefault: true,
        createdAt: Date.now()
      });

      await provider.validateKey(resolvedApiKey);
      await saveProvider({
        provider: selectedProvider,
        apiKey: resolvedApiKey,
        baseUrl: selectedProvider === "custom" ? baseUrl : undefined,
        authMethod: "api-key",
        isDefault: true,
        model
      });
      setValidationAttempts(0);
      toast.success(`${providerConfig.label} verified.`);
      setStep(2);
    } catch (error) {
      const errorState = getGenerationErrorState(error);
      const attempts = validationAttempts + 1;
      setValidationAttempts(attempts);
      setErrorMessage(
        attempts >= 3
          ? `${errorState.inlineMessage ?? errorState.toastMessage} Double-check the key source and provider selection.`
          : errorState.inlineMessage ?? errorState.toastMessage
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleStartToolLogin = async (): Promise<void> => {
    const toolLoginProvider = getToolLoginProviderMeta(selectedProvider);
    if (!toolLoginProvider) {
      return;
    }

    if (hostedRuntime) {
      setErrorMessage(
        `${toolLoginProvider.label} needs local desktop mode because it uses a local bridge. Choose a hosted provider here, or run Gameplan Turbo locally to use ${toolLoginProvider.label}.`
      );
      return;
    }

    setErrorMessage("");
    setIsStartingToolLogin(true);

    try {
      await toolLoginProvider.openLoginFlow();
      toast.success(
        desktopRuntime
          ? `Opened the ${toolLoginProvider.label} sign-in flow. Finish it in your browser, then return here.`
          : `Opened the ${toolLoginProvider.label} login flow in Terminal.`
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : desktopRuntime
            ? `Could not open the ${toolLoginProvider.label} login flow. Relaunch the desktop app and try again.`
            : `Could not open the ${toolLoginProvider.label} login flow. Run \`${toolLoginProvider.loginCommand}\` manually.`
      );
    } finally {
      setIsStartingToolLogin(false);
    }
  };

  const handleStartOpenRouterOAuth = async (): Promise<void> => {
    setErrorMessage("");
    setIsStartingOAuth(true);

    try {
      const apiKey = await startOpenRouterOAuth();
      const providerConfig = PROVIDER_CATALOG.openrouter;

      const provider = await createProviderFromConfig({
        id: "onboarding-provider",
        provider: "openrouter",
        apiKey,
        model: providerConfig.defaultModel,
        authMethod: "oauth-pkce",
        isDefault: true,
        createdAt: Date.now()
      });

      await provider.validateKey(apiKey);
      await saveProvider({
        provider: "openrouter",
        apiKey,
        authMethod: "oauth-pkce",
        isDefault: true,
        model: providerConfig.defaultModel
      });
      setValidationAttempts(0);
      toast.success("OpenRouter connected.");
      setSelectedProvider("openrouter");
      setStep(2);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not complete OpenRouter sign-in.";
      setErrorMessage(message);
    } finally {
      setIsStartingOAuth(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-dim/80 px-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Gameplan Turbo onboarding"
        className="glass-panel noise-texture relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-outline-variant/15 bg-surface-container"
      >
        <OnboardingProgress step={step} />

        {step === 1 ? (
          <OnboardingProviderStep
            apiKeyRef={apiKeyRef}
            baseUrlRef={baseUrlRef}
            modelRef={modelRef}
            errorMessage={errorMessage}
            isStartingOAuth={isStartingOAuth}
            isStartingToolLogin={isStartingToolLogin}
            isVerifying={isVerifying}
            onSkip={handleSkipProvider}
            onStartOAuth={() => void handleStartOpenRouterOAuth()}
            onStartToolLogin={() => void handleStartToolLogin()}
            onSelectProvider={setSelectedProvider}
            onToggleApiVisibility={() => setShowApiKey((current) => !current)}
            onVerify={() => void handleVerifyProvider()}
            selectedProvider={selectedProvider}
            showApiKey={showApiKey}
          />
        ) : null}

        {step === 2 ? (
          <OnboardingTutorialStep onComplete={() => setStep(3)} />
        ) : null}

        {step === 3 ? (
          <OnboardingCompleteStep onComplete={() => void onComplete()} />
        ) : null}
      </div>
    </div>
  );
};
