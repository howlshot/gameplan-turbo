import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectWorkspace } from "@/pages/workspace/ProjectWorkspace";

const navigate = vi.fn();
let locationSearch = "?tab=prompt-lab&view=library&output=risk_register";

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
      status: "concept"
    },
    isLoading: false
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

describe("ProjectWorkspace", () => {
  it("redirects old prompt-lab library links to the output-library tab", async () => {
    render(<ProjectWorkspace />);

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith(
        "/project/project-1?tab=output-library&output=risk_register",
        { replace: true }
      );
    });
  });
});
