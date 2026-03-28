import type { AIProvider, AgentPlatform } from "@/types";
import { getProviderActionLabel } from "@/lib/ai/providerCatalog";
import { getAgentPlatformLabel } from "@/lib/gameProjectUtils";

interface AiActionCopyOptions {
  connectedProvider?: AIProvider | null;
  noProviderLabel?: string;
  selectedTargetPlatform?: AgentPlatform | string | null;
  stageRecommendedPlatform?: AgentPlatform | string | null;
}

export interface AiActionCopy {
  connectedToolLabel: string | null;
  connectAiLabel: string;
  planningAssistLabel: string;
  planningAssistResponseLabel: string;
  selectedTargetLabel: string | null;
  stageRecommendedLabel: string | null;
}

export const getAiActionCopy = ({
  connectedProvider,
  noProviderLabel = "Connect AI to generate",
  selectedTargetPlatform,
  stageRecommendedPlatform
}: AiActionCopyOptions): AiActionCopy => {
  const connectedToolLabel = connectedProvider
    ? getProviderActionLabel(connectedProvider)
    : null;

  return {
    connectedToolLabel,
    connectAiLabel: noProviderLabel,
    planningAssistLabel: connectedToolLabel
      ? `Ask planning questions with ${connectedToolLabel}`
      : noProviderLabel,
    planningAssistResponseLabel: connectedToolLabel
      ? `${connectedToolLabel} planning notes`
      : "Planning notes from connected tool",
    selectedTargetLabel: selectedTargetPlatform
      ? getAgentPlatformLabel(selectedTargetPlatform)
      : null,
    stageRecommendedLabel: stageRecommendedPlatform
      ? getAgentPlatformLabel(stageRecommendedPlatform)
      : null
  };
};
