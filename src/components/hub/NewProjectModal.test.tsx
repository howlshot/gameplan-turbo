import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
  useProjectStore: (
    selector: (state: { selectProject: typeof mocks.selectProject }) => unknown
  ) =>
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
    render(<NewProjectModal isOpen onOpenChange={mocks.onOpenChange} />);

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
    render(<NewProjectModal isOpen onOpenChange={mocks.onOpenChange} />);

    fireEvent.click(
      screen.getByRole("button", { name: /Next: Production Setup/i })
    );

    expect(
      screen.getByText(/Game title is required before continuing/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 2/i)).toBeInTheDocument();
  });

  it("applies preset defaults when switching starter modes", async () => {
    render(<NewProjectModal isOpen onOpenChange={mocks.onOpenChange} />);

    const platformerCard = screen.getByText(/^Platformer$/).closest("button");
    expect(platformerCard).not.toBeNull();
    fireEvent.click(platformerCard!);

    expect(screen.getByLabelText(/^Genre$/i)).toHaveValue("Platformer");
    expect(screen.getByLabelText(/^Subgenre$/i)).toHaveValue("Action Platformer");

    fireEvent.change(screen.getByLabelText(/Game Title/i), {
      target: { value: "Skywire Sprint" }
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Next: Production Setup/i })
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Create Game Project/i })
    );

    await waitFor(() => {
      expect(mocks.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Skywire Sprint",
          templateId: "platformer",
          genre: "Platformer",
          subgenre: "Action Platformer",
          sessionLength: "10-20 minutes",
          platformTargets: ["pc", "web", "switch"],
          agentTargets: ["codex", "cursor"]
        })
      );
    });
  });

  it("reveals custom starter setup and preserves local values when toggling away", async () => {
    render(<NewProjectModal isOpen onOpenChange={mocks.onOpenChange} />);

    const customCard = screen.getByText(/^Custom$/).closest("button");
    expect(customCard).not.toBeNull();
    fireEvent.click(customCard!);

    const genreInput = screen.getByLabelText(/^Genre$/i);
    const fantasyInput = screen.getByLabelText(/Player Fantasy/i);
    expect(genreInput).toBeInTheDocument();

    fireEvent.change(genreInput, {
      target: { value: "Strategy" }
    });
    fireEvent.change(screen.getByLabelText(/^Subgenre$/i), {
      target: { value: "Deckbuilder Lite" }
    });
    fireEvent.change(fantasyInput, {
      target: { value: "Win by chaining clever card synergies." }
    });

    const platformerCard = screen.getByText(/^Platformer$/).closest("button");
    expect(platformerCard).not.toBeNull();
    fireEvent.click(platformerCard!);
    expect(screen.queryByLabelText(/Player Fantasy/i)).not.toBeInTheDocument();

    const customCardAgain = screen.getByText(/^Custom$/).closest("button");
    expect(customCardAgain).not.toBeNull();
    fireEvent.click(customCardAgain!);

    expect(screen.getByLabelText(/^Genre$/i)).toHaveValue("Strategy");
    expect(screen.getByLabelText(/^Subgenre$/i)).toHaveValue("Deckbuilder Lite");
    expect(screen.getByLabelText(/Player Fantasy/i)).toHaveValue(
      "Win by chaining clever card synergies."
    );
  });

  it("submits custom starter mode through the existing payload shape plus game design seeds", async () => {
    render(<NewProjectModal isOpen onOpenChange={mocks.onOpenChange} />);

    const customCard = screen.getByText(/^Custom$/).closest("button");
    expect(customCard).not.toBeNull();
    fireEvent.click(customCard!);

    fireEvent.change(screen.getByLabelText(/Game Title/i), {
      target: { value: "Cipher Vault" }
    });
    fireEvent.change(screen.getByLabelText(/^Genre$/i), {
      target: { value: "Puzzle" }
    });
    fireEvent.change(screen.getByLabelText(/^Subgenre$/i), {
      target: { value: "Logic Action" }
    });
    fireEvent.change(screen.getByLabelText(/Player Fantasy/i), {
      target: { value: "Outsmart escalating traps with clean chain reactions." }
    });
    fireEvent.change(screen.getByLabelText(/Primary Play Pattern/i), {
      target: {
        value:
          "Read the room, trigger one strong interaction, and reposition before the next twist."
      }
    });
    fireEvent.change(screen.getByLabelText(/Feel Keywords/i), {
      target: { value: "tense, readable, punchy" }
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Next: Production Setup/i })
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Create Game Project/i })
    );

    await waitFor(() => {
      expect(mocks.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Cipher Vault",
          templateId: "custom-guided",
          genre: "Puzzle",
          subgenre: "Logic Action",
          gameDesignDoc: {
            concept: {
              playerFantasy:
                "Outsmart escalating traps with clean chain reactions."
            },
            coreLoop: {
              secondToSecond:
                "Read the room, trigger one strong interaction, and reposition before the next twist."
            },
            designPillars: {
              feelStatement: "tense, readable, punchy"
            },
            artTone: {
              toneKeywords: ["tense", "readable", "punchy"]
            }
          }
        })
      );
    });
  });

  it("shows the large warning copy and submits the existing payload shape", async () => {
    render(<NewProjectModal isOpen onOpenChange={mocks.onOpenChange} />);

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
