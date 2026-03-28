import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getProjectTabPath } from "@/components/layout/sidebarConfig";
import {
  NAVIGATION_ITEMS,
  PLATFORM_LINKS,
  PROJECT_TABS
} from "@/components/shared/command-palette/commandPaletteConfig";
import type { CommandPaletteAction } from "@/components/shared/command-palette/CommandPaletteContent";
import { useToast } from "@/hooks/useToast";
import { copyToClipboard } from "@/lib/utils";
import { exportAllPrompts } from "@/services/generation/buildGeneration";
import { useUIStore } from "@/stores/uiStore";
import type { BuildStage, GeneratedArtifact, Project } from "@/types";

interface UseCommandPaletteActionsInput {
  closePalette: () => void;
  latestArtifact: GeneratedArtifact | null;
  onOpenNewProject: () => void;
  project?: Project;
  selectedProjectId?: string;
  stages: BuildStage[];
}

export const useCommandPaletteActions = ({
  closePalette,
  latestArtifact,
  onOpenNewProject,
  selectedProjectId,
  stages
}: UseCommandPaletteActionsInput): {
  navigationItems: CommandPaletteAction[];
  platformLinks: CommandPaletteAction[];
  projectTabs: CommandPaletteAction[];
  quickActions: CommandPaletteAction[];
} => {
  const navigate = useNavigate();
  const toast = useToast();
  const setActiveTab = useUIStore((state) => state.setActiveTab);

  const handleNavigate = (path: string, tab?: string): void => {
    if (tab) setActiveTab(tab);
    navigate(path);
    closePalette();
  };

  const quickActions = useMemo<CommandPaletteAction[]>(
    () => [
      {
        id: "new-project",
        icon: "add_circle",
        label: "New Game Project",
        shortcut: "⌘N",
        onSelect: () => {
          closePalette();
          onOpenNewProject();
        }
      },
      {
        id: "open-prompt-lab",
        icon: "auto_awesome",
        label: "Open Prompt Lab",
        hidden: !selectedProjectId,
        onSelect: () =>
          handleNavigate(
            getProjectTabPath(selectedProjectId!, "prompt-lab", { view: "guided" }),
            "prompt-lab"
          )
      },
      {
        id: "export-build",
        icon: "download",
        label: "Export Roadmap Briefs",
        shortcut: "⌘E",
        hidden: stages.length === 0,
        onSelect: () => {
          exportAllPrompts(stages);
          closePalette();
          toast.success("Build prompts exported.");
        }
      },
      {
        id: "copy-last-artifact",
        icon: "content_copy",
        label: "Copy Last Output",
        shortcut: "⌘C",
        hidden: !latestArtifact,
        onSelect: async () => {
          if (!latestArtifact) return;
          const copied = await copyToClipboard(latestArtifact.content);
          closePalette();
          copied ? toast.success("Latest output copied.") : toast.error("Copy failed.");
        }
      }
    ],
    [closePalette, latestArtifact, onOpenNewProject, selectedProjectId, stages, toast]
  );

  return {
    navigationItems: NAVIGATION_ITEMS.map((item) => ({
      ...item,
      onSelect: () => handleNavigate(item.id === "settings" ? "/settings" : "/")
    })),
    platformLinks: PLATFORM_LINKS.map((item) => ({
      id: item.id,
      icon: item.icon,
      label: item.label,
      onSelect: () => {
        window.open(item.url, "_blank", "noopener,noreferrer");
        closePalette();
      }
    })),
    projectTabs: selectedProjectId
      ? PROJECT_TABS.map((tab) => ({
          ...tab,
          onSelect: () =>
            handleNavigate(getProjectTabPath(selectedProjectId, tab.id), tab.id)
        }))
      : [],
    quickActions
  };
};
