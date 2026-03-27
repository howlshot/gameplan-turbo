import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { NewProjectModal } from "@/components/hub/NewProjectModal";

const mocks = vi.hoisted(() => ({
  createProject: vi.fn(),
  navigate: vi.fn(),
  onOpenChange: vi.fn(),
  selectProject: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn()
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.navigate
}));

vi.mock("@/hooks/useProjects", () => ({
  useProjects: () => ({
    createProject: mocks.createProject
  })
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({
    error: mocks.toastError,
    success: mocks.toastSuccess
  })
}));

vi.mock("@/stores/projectStore", () => ({
  useProjectStore: (selector: (state: { selectProject: typeof mocks.selectProject }) => unknown) =>
    selector({
      selectProject: mocks.selectProject
    })
}));

describe("NewProjectModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createProject.mockResolvedValue({
      id: "project-123"
    });
  });

  it("starts on step one with title focus and preserves values when moving back", async () => {
    render(
      <NewProjectModal isOpen onOpenChange={mocks.onOpenChange} />
    );

    const titleInput = screen.getByLabelText(/Game Title/i);
    const pitchInput = screen.getByLabelText(/One-Line Pitch/i);

    await waitFor(() => {
      expect(titleInput).toHaveFocus();
    });

    fireEvent.change(titleInput, { target: { value: "Nightline Zero" } });
    fireEvent.change(pitchInput, {
      target: { value: "A compact action prototype." }
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Next: Production Setup/i })
    );

    expect(screen.getByText(/Step 2 of 2/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Back/i }));

    expect(screen.getByLabelText(/Game Title/i)).toHaveValue("Nightline Zero");
    expect(screen.getByLabelText(/One-Line Pitch/i)).toHaveValue(
      "A compact action prototype."
    );
  });

  it("requires a title before continuing", () => {
    render(
      <NewProjectModal isOpen onOpenChange={mocks.onOpenChange} />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Next: Production Setup/i })
    );

    expect(
      screen.getByText(/Game title is required before continuing/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 2/i)).toBeInTheDocument();
  });

  it("reveals the custom session field only when custom is selected", () => {
    render(
      <NewProjectModal isOpen onOpenChange={mocks.onOpenChange} />
    );

    fireEvent.change(screen.getByLabelText(/Game Title/i), {
      target: { value: "Nightline Zero" }
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Next: Production Setup/i })
    );

    expect(
      screen.getByPlaceholderText(/Use a custom session target/i)
    ).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "3-10 minutes" }
    });

    expect(
      screen.queryByPlaceholderText(/Use a custom session target/i)
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "__custom__" }
    });

    expect(
      screen.getByPlaceholderText(/Use a custom session target/i)
    ).toBeInTheDocument();
  });

  it("shows the large warning copy and submits the existing payload shape", async () => {
    render(
      <NewProjectModal isOpen onOpenChange={mocks.onOpenChange} />
    );

    fireEvent.change(screen.getByLabelText(/Game Title/i), {
      target: { value: "Nightline Zero" }
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Next: Production Setup/i })
    );

    const largeScopeButton = screen.getByText("Large").closest("button");
    expect(largeScopeButton).not.toBeNull();
    fireEvent.click(largeScopeButton!);

    expect(screen.getByText(/Large Scope Warning/i)).toBeInTheDocument();
    expect(
      screen.getByText(/optimized for finishable tiny-to-medium projects/i)
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /Create Game Project/i })
    );

    await waitFor(() => {
      expect(mocks.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Nightline Zero",
          name: "Nightline Zero",
          scopeCategory: "large",
          templateId: "arcade-action-rail-shooter",
          sessionLength: "5-12 minutes",
          platformTargets: ["ios", "android", "pc"],
          agentTargets: ["codex", "cursor", "claude-code"],
          targetPlatforms: ["codex", "cursor", "claude-code"]
        })
      );
    });

    expect(mocks.selectProject).toHaveBeenCalledWith("project-123");
    expect(mocks.navigate).toHaveBeenCalledWith("/project/project-123");
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Game project created.");
  });
});
