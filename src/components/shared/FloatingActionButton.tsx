import { useUIStore } from "@/stores/uiStore";

const WORKSPACE_FLOW = [
  "concept",
  "design-pillars",
  "core-loop",
  "controls-feel",
  "content-bible",
  "art-tone",
  "technical-design",
  "vault",
  "prompt-lab"
] as const;

type WorkspaceStage = (typeof WORKSPACE_FLOW)[number];

interface FloatingActionButtonProps {
  onCompleteStage?: () => void;
}

const getStageLabel = (stage: WorkspaceStage): string =>
  stage
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const FloatingActionButton = ({
  onCompleteStage
}: FloatingActionButtonProps): JSX.Element | null => {
  const activeTab = useUIStore((state) => state.activeTab);
  const setActiveTab = useUIStore((state) => state.setActiveTab);

  const currentIndex = WORKSPACE_FLOW.indexOf(activeTab as WorkspaceStage);
  const isLastStage = currentIndex === WORKSPACE_FLOW.length - 1;
  const nextStage = WORKSPACE_FLOW[currentIndex + 1];

  const handleCompleteAndContinue = () => {
    onCompleteStage?.();

    if (nextStage) {
      setActiveTab(nextStage);
      window.scrollTo(0, 0);
    }
  };

  const handleJustContinue = () => {
    if (nextStage) {
      setActiveTab(nextStage);
      window.scrollTo(0, 0);
    }
  };

  if (currentIndex === -1 || currentIndex === 0 || isLastStage) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      <button
        type="button"
        onClick={handleCompleteAndContinue}
        className="gradient-cta glow-primary flex items-center gap-2 rounded-full px-6 py-3 font-mono text-sm font-semibold text-on-primary shadow-elevation-2 transition hover:shadow-elevation-3"
        title="Move to the next workspace stage"
      >
        <span className="material-symbols-outlined text-lg">check_circle</span>
        Continue Forward
      </button>

      <button
        type="button"
        onClick={handleJustContinue}
        className="flex items-center gap-2 rounded-full border border-outline-variant/15 bg-surface-container px-6 py-3 font-mono text-sm text-on-surface shadow-elevation-1 transition hover:bg-surface-bright hover:shadow-elevation-2"
        title="Go to the next workspace stage"
      >
        <span className="material-symbols-outlined text-lg">arrow_forward</span>
        Go to {nextStage ? getStageLabel(nextStage) : "Next"}
      </button>
    </div>
  );
};
