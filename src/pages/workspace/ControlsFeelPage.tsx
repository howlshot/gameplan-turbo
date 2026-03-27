import { useParams } from "react-router-dom";
import {
  GameField,
  GameSectionLayout,
  GameTextarea
} from "@/components/workspace/game/GameSectionLayout";
import { WorkspacePageNavigation } from "@/components/workspace/WorkspacePageNavigation";
import { useGameDesignDoc } from "@/hooks/useGameDesignDoc";

const controlFields = [
  ["controlScheme", "Control Scheme"],
  ["cameraRules", "Camera Rules"],
  ["movementPhilosophy", "Movement Philosophy"],
  ["combatFeelGoals", "Combat Feel Goals"],
  ["responsivenessStandards", "Responsiveness Standards"],
  ["platformInputNotes", "Platform-Specific Input Notes"],
  ["accessibilityConsiderations", "Accessibility Considerations"]
] as const;

export const ControlsFeelPage = (): JSX.Element => {
  const { projectId } = useParams();
  const { gameDesignDoc, updateGameDesignDoc } = useGameDesignDoc(projectId);

  if (!gameDesignDoc) {
    return (
      <GameSectionLayout
        title="Controls & Feel"
        description="Loading controls and feel workspace."
      >
        <div className="h-64 animate-pulse rounded-3xl bg-surface-container-high" />
      </GameSectionLayout>
    );
  }

  return (
    <GameSectionLayout
      eyebrow="Feel Specification"
      title="Controls & Feel"
      description="This is where the project stops being abstract. Capture the input philosophy, camera rules, and feel constraints that agents need to respect during implementation."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {controlFields.map(([key, label]) => (
          <GameField key={key} label={label}>
            <GameTextarea
              value={gameDesignDoc.controlsFeel[key]}
              onChange={(event) => {
                void updateGameDesignDoc({
                  controlsFeel: {
                    [key]: event.target.value
                  }
                });
              }}
            />
          </GameField>
        ))}
      </div>

      <WorkspacePageNavigation currentTabId="controls-feel" />
    </GameSectionLayout>
  );
};
