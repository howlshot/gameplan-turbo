import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

const mocks = vi.hoisted(() => ({
  selectedProjectId: null as string | null,
  navigate: vi.fn()
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => mocks.navigate
  };
});

vi.mock("@/stores/projectStore", () => ({
  useProjectStore: (
    selector: (state: { selectedProjectId: string | null }) => unknown
  ) => selector({ selectedProjectId: mocks.selectedProjectId })
}));

describe("MobileBottomNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.selectedProjectId = null;
  });

  const renderNav = (initialEntry = "/"): void => {
    render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <MobileBottomNav />
      </MemoryRouter>
    );
  };

  it("disables roadmap and outputs when no project is selected", () => {
    renderNav("/");

    const roadmapButton = screen.getByRole("button", { name: /Roadmap/i });
    const outputsButton = screen.getByRole("button", { name: /Outputs/i });

    expect(roadmapButton).toBeDisabled();
    expect(outputsButton).toBeDisabled();

    fireEvent.click(roadmapButton);
    fireEvent.click(outputsButton);

    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("enables roadmap and outputs when a project is selected", () => {
    mocks.selectedProjectId = "project-123";

    renderNav("/project/project-123?tab=concept");

    const roadmapButton = screen.getByRole("button", { name: /Roadmap/i });
    const outputsButton = screen.getByRole("button", { name: /Outputs/i });

    expect(roadmapButton).not.toBeDisabled();
    expect(outputsButton).not.toBeDisabled();

    fireEvent.click(roadmapButton);

    expect(mocks.navigate).toHaveBeenCalledWith(
      "/project/project-123?tab=prompt-lab"
    );
  });
});
