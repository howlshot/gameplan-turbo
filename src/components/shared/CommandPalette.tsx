import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjectTabPath } from "@/components/layout/sidebarConfig";
import { NewProjectModal } from "@/components/hub/NewProjectModal";
import {
  CommandPaletteContent,
} from "@/components/shared/command-palette/CommandPaletteContent";
import { useCommandPaletteActions } from "@/components/shared/command-palette/useCommandPaletteActions";
import { useArtifacts } from "@/hooks/useArtifacts";
import { useBuildStages } from "@/hooks/useBuildStages";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { useProject } from "@/hooks/useProject";
import { useProjects } from "@/hooks/useProjects";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";

export const CommandPalette = (): JSX.Element | null => {
  const isOpen = useUIStore((state) => state.isCommandPaletteOpen);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  if (!isOpen && !isNewProjectOpen) {
    return null;
  }

  return (
    <>
      {isOpen ? (
        <CommandPaletteDialog onOpenNewProject={() => setIsNewProjectOpen(true)} />
      ) : null}
      <NewProjectModal isOpen={isNewProjectOpen} onOpenChange={setIsNewProjectOpen} />
    </>
  );
};

interface CommandPaletteDialogProps {
  onOpenNewProject: () => void;
}

const CommandPaletteDialog = ({
  onOpenNewProject
}: CommandPaletteDialogProps): JSX.Element => {
  const navigate = useNavigate();
  const { projects, isLoading } = useProjects();
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const { project } = useProject(selectedProjectId ?? undefined);
  const { artifacts } = useArtifacts(selectedProjectId ?? undefined);
  const { stages } = useBuildStages(selectedProjectId ?? undefined);
  const setCommandPaletteOpen = useUIStore((state) => state.setCommandPaletteOpen);
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const [query, setQuery] = useState("");
  const dialogRef = useDialogAccessibility<HTMLDivElement>(true, () => {
    setQuery("");
    setCommandPaletteOpen(false);
  });

  const closePalette = (): void => {
    setQuery("");
    setCommandPaletteOpen(false);
  };

  const latestArtifact = artifacts[0] ?? null;
  const { navigationItems, platformLinks, projectTabs, quickActions } =
    useCommandPaletteActions({
      closePalette,
      latestArtifact,
      onOpenNewProject,
      project: project ?? undefined,
      selectedProjectId: selectedProjectId ?? undefined,
      stages
    });

  return (
    <div
      className="fixed inset-0 z-50 bg-surface-dim/80 backdrop-blur-sm"
      onClick={closePalette}
    >
      <div className="flex min-h-screen items-start justify-center px-4 pt-24">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Global command palette"
          className="glass-panel w-full max-w-2xl rounded-xl border border-outline-variant/15 bg-surface-container shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <CommandPaletteContent
            actions={quickActions}
            isLoading={isLoading}
            navigationItems={navigationItems}
            onProjectSelect={(projectId) => {
              setActiveTab("concept");
              navigate(getProjectTabPath(projectId, "concept"));
              closePalette();
            }}
            onQueryChange={setQuery}
            platformLinks={platformLinks}
            projectTabs={projectTabs}
            projects={projects}
            query={query}
          />
        </div>
      </div>
    </div>
  );
};
