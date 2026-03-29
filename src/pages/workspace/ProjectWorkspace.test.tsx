import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectWorkspace } from "@/pages/workspace/ProjectWorkspace";

const navigate = vi.fn();
let locationSearch = "?tab=prompt-lab&view=library&output=risk_register";
const updateProject = vi.fn();
const successToast = vi.fn();
let projectStatus = "concept";

vi.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: "/project/project-1", search: locationSearch }),
  useNavigate: () => navigate,
  useParams: () => ({ projectId: "project-1" })
}));

vi.mock("@/hooks/useProject", () => ({
  useProject: () => ({
    project: {
      id: "project-1",
      title: "Nightline",
      oneLinePitch: "Escape one haunted floor.",
      status: projectStatus
    },
    isLoading: false
  })
}));

vi.mock("@/hooks/useGameDesignDoc", () => ({
  useGameDesignDoc: () => ({
    gameDesignDoc: {
      designPillars: {
        pillars: ["Readable fear"],
        feelStatement: "",
        antiGoals: [],
        emotionalTargets: [],
        readabilityPrinciples: ""
      },
      coreLoop: {
        secondToSecond: "",
        minuteToMinute: "",
        sessionLoop: "",
        longTermProgression: "",
        failureStates: "",
        rewardCadence: ""
      },
      controlsFeel: {
        controlScheme: "",
        cameraRules: "",
        movementPhilosophy: "",
        combatFeelGoals: "",
        responsivenessStandards: "",
        platformInputNotes: "",
        accessibilityConsiderations: ""
      }
    }
  })
}));

vi.mock("@/hooks/useBuildStages", () => ({
  useBuildStages: () => ({
    stages: [
      {
        id: "stage-1",
        projectId: "project-1",
        stageKey: "foundation",
        stageNumber: 1,
        name: "Foundation",
        description: "desc",
        status: "in-progress",
        promptContent: "prompt",
        platform: "codex",
        createdAt: 1,
        updatedAt: 1
      }
    ]
  })
}));

vi.mock("@/hooks/useProjects", () => ({
  useProjects: () => ({
    updateProject
  })
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({
    success: successToast
  })
}));

vi.mock("@/stores/uiStore", () => ({
  useUIStore: (selector: (state: unknown) => unknown) =>
    selector({
      activeTab: "prompt-lab",
      setActiveTab: vi.fn(),
      sidebarCollapsed: false
    })
}));

vi.mock("@/components/workspace/ContextNodeSelector", () => ({
  ContextNodeSelector: () => null
}));

vi.mock("@/pages/workspace/ConceptPage", () => ({
  ConceptPage: () => <div>concept-page</div>
}));

vi.mock("@/pages/workspace/DesignPillarsPage", () => ({
  DesignPillarsPage: () => <div>design-pillars-page</div>
}));

vi.mock("@/pages/workspace/CoreLoopPage", () => ({
  CoreLoopPage: () => <div>core-loop-page</div>
}));

vi.mock("@/pages/workspace/ControlsFeelPage", () => ({
  ControlsFeelPage: () => <div>controls-feel-page</div>
}));

vi.mock("@/pages/workspace/ContentBiblePage", () => ({
  ContentBiblePage: () => <div>content-bible-page</div>
}));

vi.mock("@/pages/workspace/ArtTonePage", () => ({
  ArtTonePage: () => <div>art-tone-page</div>
}));

vi.mock("@/pages/workspace/TechnicalDesignPage", () => ({
  TechnicalDesignPage: () => <div>technical-design-page</div>
}));

vi.mock("@/pages/workspace/VaultPage", () => ({
  VaultPage: () => <div>vault-page</div>
}));

vi.mock("@/pages/workspace/PromptLabPage", () => ({
  PromptLabPage: () => <div>prompt-lab-page</div>
}));

vi.mock("@/pages/workspace/OutputLibraryPage", () => ({
  OutputLibraryPage: () => <div>output-library-page</div>
}));

vi.mock("@/pages/workspace/VisualRoadmapPage", () => ({
  VisualRoadmapPage: () => <div>visual-roadmap-page</div>
}));

describe("ProjectWorkspace", () => {
  it("redirects old prompt-lab library links to the output-library tab", async () => {
    locationSearch = "?tab=prompt-lab&view=library&output=risk_register";
    render(<ProjectWorkspace />);

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith(
        "/project/project-1?tab=output-library&output=risk_register",
        { replace: true }
      );
    });
  });

  it("shows the current lifecycle suggestion and applies it", async () => {
    locationSearch = "?tab=prompt-lab";
    projectStatus = "preproduction";

    render(<ProjectWorkspace />);

    expect(screen.getByText("Suggested: Production")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Use Suggestion" }));

    await waitFor(() => {
      expect(updateProject).toHaveBeenCalledWith("project-1", {
        status: "production"
      });
    });
  });
});
