import { memo, useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/shared/CopyButton";
import { useToast } from "@/hooks/useToast";
import { getAgentPlatformLabel } from "@/lib/gameProjectUtils";
import { parsePlanningQuestions } from "@/lib/planningQuestions";
import { cn } from "@/lib/utils";
import type { BuildStage } from "@/types";

interface BuildStageCardProps {
  actionToolLabel?: string | null;
  connectAiLabel?: string;
  highlightPrimaryAction?: boolean;
  isNextRecommended?: boolean;
  isActionSpotlighted?: boolean;
  onConnectToAI?: () => void;
  onPlanningAssist?: (stage: BuildStage) => Promise<string>;
  onStatusChange: (stage: BuildStage) => void;
  planningAssistLabel?: string;
  planningAssistResponseLabel?: string;
  stage: BuildStage;
  totalStages: number;
}

const STATUS_LABELS: Record<BuildStage["status"], string> = {
  locked: "Locked",
  "not-started": "Not Started",
  "in-progress": "In Progress",
  complete: "Complete"
};

const STATUS_TONES: Record<BuildStage["status"], string> = {
  locked: "bg-outline/10 text-outline",
  "not-started": "bg-surface-container-high text-on-surface-variant",
  "in-progress": "bg-secondary/10 text-secondary",
  complete: "bg-secondary/20 text-secondary"
};

const BuildStageCardComponent = ({
  actionToolLabel,
  connectAiLabel = "Connect AI to generate",
  highlightPrimaryAction = false,
  isNextRecommended = false,
  isActionSpotlighted = false,
  onConnectToAI,
  onPlanningAssist,
  onStatusChange,
  planningAssistLabel,
  planningAssistResponseLabel = "Planning notes from connected tool",
  stage,
  totalStages
}: BuildStageCardProps): JSX.Element => {
  const [isExpanded, setIsExpanded] = useState(stage.status === "in-progress");
  const [isSending, setIsSending] = useState(false);
  const [toolResponse, setToolResponse] = useState("");
  const [planningAnswers, setPlanningAnswers] = useState<Record<string, string>>({});
  const isLocked = stage.status === "locked";
  const platformLabel = getAgentPlatformLabel(stage.platform);
  const planningToolLabel = actionToolLabel ?? platformLabel;
  const toast = useToast();
  const stageProgress = totalStages === 0 ? 0 : stage.stageNumber / totalStages;
  const parsedPlanningQuestions = useMemo(
    () =>
      toolResponse.trim().startsWith("[") || toolResponse.trim().startsWith("{")
        ? parsePlanningQuestions(toolResponse)
        : [],
    [toolResponse]
  );
  const answeredPlanningQuestions = parsedPlanningQuestions.filter((question) =>
    (planningAnswers[question.id] ?? "").trim().length > 0
  );
  const showsConnectAiAction = !onPlanningAssist && Boolean(onConnectToAI) && !isLocked;
  const stageBriefWithAnswers = useMemo(() => {
    if (answeredPlanningQuestions.length === 0) {
      return stage.promptContent;
    }

    const answeredQuestionSection = answeredPlanningQuestions
      .map((question, index) => {
        const answer = planningAnswers[question.id]?.trim() ?? "";
        return `Question ${index + 1}: ${question.question}\nRationale: ${question.rationale}\nAnswer: ${answer}`;
      })
      .join("\n\n");

    return `${stage.promptContent}\n\n## Stage Planning Answers\n${answeredQuestionSection}`;
  }, [answeredPlanningQuestions, planningAnswers, stage.promptContent]);
  const stageTone =
    stageProgress <= 0.33
      ? "bg-primary/20 text-primary"
      : stageProgress <= 0.66
        ? "bg-secondary/20 text-secondary"
        : "bg-outline-variant/20 text-on-surface";

  useEffect(() => {
    if (parsedPlanningQuestions.length === 0) {
      setPlanningAnswers({});
      return;
    }

    setPlanningAnswers(
      Object.fromEntries(parsedPlanningQuestions.map((question) => [question.id, ""]))
    );
  }, [toolResponse, parsedPlanningQuestions]);

  return (
    <article
      data-build-stage-id={stage.id}
      className={cn(
        "relative rounded-xl border border-outline-variant/10 bg-surface-container p-4 transition-all sm:p-5",
        stage.status === "in-progress" ? "border-l-[3px] border-l-primary" : "",
        stage.status === "complete" ? "opacity-80" : "",
        isActionSpotlighted
          ? "border-primary/35 shadow-[0_0_0_1px_rgba(194,185,255,0.18),0_18px_48px_rgba(116,88,255,0.14)]"
          : "",
        isLocked ? "opacity-40" : ""
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg font-mono text-sm font-bold sm:h-10 sm:w-10",
            stageTone
          )}
        >
          {stage.stageNumber.toString().padStart(2, "0")}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="font-headline text-lg font-semibold text-on-surface">
                {stage.name}
              </h3>
              <p className="mt-1 text-sm text-outline">{stage.description}</p>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em]",
                STATUS_TONES[stage.status]
              )}
            >
              {stage.status === "complete" ? (
                <span className="material-symbols-outlined text-xs">check</span>
              ) : stage.status === "in-progress" ? (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
              ) : null}
              {STATUS_LABELS[stage.status]}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
            <span className="rounded-full bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
              Recommended tool: {platformLabel}
            </span>
            {Array.from({ length: totalStages }).map((_, index) => (
              <span
                key={index}
                data-testid="stage-progress-dot"
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  index < stage.stageNumber
                    ? "bg-primary"
                    : "bg-surface-container-high"
                )}
              />
            ))}
            <span>
              {stage.status === "complete" ? "Stage complete" : "Stage queued"}
            </span>
          </div>

          {isNextRecommended && !isLocked ? (
            <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm leading-6 text-on-surface">
              Next:{" "}
              {onPlanningAssist ? (
                <>
                  click <span className="font-semibold">{planningAssistLabel}</span>{" "}
                  below to tighten this stage brief and surface project-specific questions with{" "}
                  <span className="font-semibold">{planningToolLabel}</span>, or
                  copy the prompt when you are ready to hand it off in your build environment.
                </>
              ) : showsConnectAiAction ? (
                <>
                  connect your AI to ask planning questions for this stage, or
                  copy the prompt when you are ready to hand it off in your build environment.
                </>
              ) : (
                <>
                  copy this prompt into{" "}
                  <span className="font-semibold">{platformLabel}</span>, start
                  the work there, then come back and mark this stage as started.
                </>
              )}
            </div>
          ) : null}

          <div className="mt-4 rounded-xl bg-surface-container-lowest">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/10 px-4 py-3">
              <span className="rounded-full bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
                {stage.name.replace(/\s+/g, "-").toUpperCase()}.txt
              </span>
              <div className="flex items-center gap-2">
                {!isLocked ? (
                  <CopyButton
                    text={stageBriefWithAnswers}
                    size="sm"
                    label="Copy Stage Brief"
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => setIsExpanded((current) => !current)}
                  className="rounded-full p-2 text-on-surface-variant transition hover:bg-surface hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-base">
                    {isExpanded ? "expand_less" : "expand_more"}
                  </span>
                </button>
              </div>
            </div>

            {isExpanded ? (
              <pre className="overflow-x-auto whitespace-pre-wrap px-4 py-4 font-mono text-sm text-secondary">
                {stage.promptContent}
              </pre>
            ) : null}
          </div>

          {toolResponse ? (
            <div className="mt-4 rounded-xl border border-outline-variant/10 bg-surface-container-lowest px-4 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                {planningAssistResponseLabel}
              </p>
              {parsedPlanningQuestions.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {parsedPlanningQuestions.map((question, index) => (
                    <div
                      key={question.id}
                      className="rounded-2xl border border-outline-variant/10 bg-surface px-4 py-4"
                    >
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                        Question {index + 1}
                      </p>
                      <p className="mt-2 text-base font-medium text-on-surface">
                        {question.question}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                        {question.rationale}
                      </p>
                      <textarea
                        value={planningAnswers[question.id] ?? ""}
                        onChange={(event) =>
                          setPlanningAnswers((current) => ({
                            ...current,
                            [question.id]: event.target.value
                          }))
                        }
                        placeholder="Type your answer here. It will be included when you copy the stage brief."
                        className="mt-3 min-h-28 w-full resize-y rounded-2xl border border-outline-variant/10 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary/40"
                      />
                    </div>
                  ))}
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-4 text-sm leading-6 text-on-surface-variant">
                    <p className="font-medium text-on-surface">
                      Answers stay on this stage card and do not need a separate submit.
                    </p>
                    <p className="mt-1">
                      They are included when you copy the stage brief, so you can hand off a more complete prompt when you are ready.
                    </p>
                  </div>
                </div>
              ) : (
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-sm text-on-surface">
                  {toolResponse}
                </pre>
              )}
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            {onPlanningAssist ? (
              <button
                type="button"
                data-build-stage-primary-action="true"
                disabled={isLocked || isSending}
                onClick={async () => {
                  try {
                    setIsSending(true);
                    const response = await onPlanningAssist(stage);
                    setToolResponse(response);
                    toast.success(`${planningToolLabel} returned planning notes for ${stage.name}.`);
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : `Could not review this stage with ${planningToolLabel}.`
                    );
                  } finally {
                    setIsSending(false);
                  }
                }}
                className={cn(
                  "w-full rounded-xl px-4 py-3 text-sm font-semibold transition disabled:opacity-50 sm:w-auto sm:py-2",
                  highlightPrimaryAction
                    ? "gradient-cta glow-primary text-on-primary ring-2 ring-primary/30"
                    : "border border-primary/25 bg-primary/10 text-primary hover:border-primary/35 hover:bg-primary/15"
                )}
              >
                {isSending
                  ? "Reviewing…"
                  : planningAssistLabel ?? `Polish with ${planningToolLabel}`}
              </button>
            ) : showsConnectAiAction ? (
              <button
                type="button"
                data-build-stage-primary-action="true"
                onClick={onConnectToAI}
                className={cn(
                  "w-full rounded-xl px-4 py-3 text-sm font-semibold transition sm:w-auto sm:py-2",
                  highlightPrimaryAction
                    ? "gradient-cta glow-primary text-on-primary ring-2 ring-primary/30"
                    : "border border-primary/25 bg-primary/10 text-primary hover:border-primary/35 hover:bg-primary/15"
                )}
              >
                {connectAiLabel}
              </button>
            ) : null}
            <button
              type="button"
              data-build-stage-primary-action={
                !onPlanningAssist && !showsConnectAiAction ? "true" : undefined
              }
              disabled={isLocked}
              onClick={() => onStatusChange(stage)}
              className={cn(
                "w-full rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50 sm:w-auto sm:py-2",
                onPlanningAssist || showsConnectAiAction
                  ? "border border-outline-variant/15 bg-surface-container text-on-surface hover:bg-surface-container-high"
                  : highlightPrimaryAction
                    ? "gradient-cta glow-primary text-on-primary ring-2 ring-primary/30"
                    : "gradient-cta glow-primary text-on-primary"
              )}
            >
              {stage.status === "not-started" && "Mark as Started"}
              {stage.status === "in-progress" && "Mark Complete"}
              {stage.status === "complete" && "Mark In Progress"}
              {stage.status === "locked" && "Locked"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export const BuildStageCard = memo(BuildStageCardComponent);
BuildStageCard.displayName = "BuildStageCard";
