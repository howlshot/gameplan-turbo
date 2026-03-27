import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CommandPalette } from "@/components/shared/CommandPalette";

let isCommandPaletteOpen = false;

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  setActiveTab: vi.fn(),
  setCommandPaletteOpen: vi.fn()
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.navigate
}));

vi.mock("@/hooks/useProjects", () => ({
  useProjects: () => ({
    projects: [],
    isLoading: false
  })
}));

vi.mock("@/hooks/useProject", () => ({
  useProject: () => ({
    project: {
      id: "project-1",
      title: "Night Watch"
    }
  })
}));

vi.mock("@/hooks/useArtifacts", () => ({
  useArtifacts: () => ({
    artifacts: [],
    getLatestByType: () => null
  })
}));

vi.mock("@/hooks/useBuildStages", () => ({
  useBuildStages: () => ({
    stages: []
  })
}));

vi.mock("@/hooks/useDialogAccessibility", () => ({
  useDialogAccessibility: () => ({ current: null })
}));

vi.mock("@/stores/projectStore", () => ({
  useProjectStore: (
    selector: (state: { selectedProjectId: string | null }) => unknown
  ) =>
    selector({
      selectedProjectId: "project-1"
    })
}));

vi.mock("@/stores/uiStore", () => ({
  useUIStore: (
    selector: (state: {
      isCommandPaletteOpen: boolean;
      setCommandPaletteOpen: typeof mocks.setCommandPaletteOpen;
      setActiveTab: typeof mocks.setActiveTab;
    }) => unknown
  ) =>
    selector({
      isCommandPaletteOpen,
      setCommandPaletteOpen: mocks.setCommandPaletteOpen,
      setActiveTab: mocks.setActiveTab
    })
}));

vi.mock("@/components/shared/command-palette/useCommandPaletteActions", () => ({
  useCommandPaletteActions: () => ({
    navigationItems: [],
    platformLinks: [],
    projectTabs: [],
    quickActions: []
  })
}));

vi.mock("@/components/shared/command-palette/CommandPaletteContent", () => ({
  CommandPaletteContent: () => <div>command-palette-content</div>
}));

vi.mock("@/components/hub/NewProjectModal", () => ({
  NewProjectModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div>new-project-modal</div> : null
}));

describe("CommandPalette", () => {
  beforeEach(() => {
    isCommandPaletteOpen = false;
    vi.clearAllMocks();
  });

  it("can open after an initially closed render without a hook-order crash", () => {
    const view = render(<CommandPalette />);

    expect(screen.queryByText("command-palette-content")).not.toBeInTheDocument();

    isCommandPaletteOpen = true;
    view.rerender(<CommandPalette />);

    expect(
      screen.getByRole("dialog", { name: /Global command palette/i })
    ).toBeInTheDocument();
    expect(screen.getByText("command-palette-content")).toBeInTheDocument();
  });
});
