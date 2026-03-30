import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NewProjectModal } from "@/components/hub/NewProjectModal";

const mocks = vi.hoisted(() => ({
  createProject: vi.fn(),
  defaultProvider: null as { provider: string } | null,
  navigate: vi.fn(),
  onOpenChange: vi.fn(),
  selectProject: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  webSurface: "desktop-web" as "desktop-web" | "mobile-web"
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.navigate
}));

vi.mock("@/hooks/useProjects", () => ({
  useProjects: () => ({
    createProject: mocks.createProject
  })
}));

vi.mock("@/hooks/useAIProviders", () => ({
  useAIProviders: () => ({
    defaultProvider: mocks.defaultProvider
  })
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({
    error: mocks.toastError,
    success: mocks.toastSuccess
  })
}));

vi.mock("@/hooks/useWebSurface", () => ({
  useWebSurface: () => mocks.webSurface
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
    mocks.defaultProvider = null;
    mocks.webSurface = "desktop-web";
    mocks.createProject.mockResolvedValue({
      id: "project-123"
    });
  });

  const getGenreFamilySelect = (): HTMLElement =>
    screen.getByRole("combobox", { name: "Genre Family" });

  const getSubgenreSelect = (): HTMLElement =>
    screen.getByRole("combobox", { name: "Subgenre" });

  const renderModal = (): void => {
    render(<NewProjectModal isOpen onOpenChange={mocks.onOpenChange} />);
  };

  it("starts on step one with title focus and preserves values when moving back", async () => {
    renderModal();

    const titleInput = screen.getByLabelText(/Game Title/i);
    const pitchInput = screen.getByLabelText(/One-Line Pitch/i);

    await waitFor(() => {
      expect(titleInput).toHaveFocus();
    });

    expect(
      screen.queryByText(/Choose the game identity first/i)
    ).not.toBeInTheDocument();

    fireEvent.change(titleInput, { target: { value: "Nightline Zero" } });
    fireEvent.change(pitchInput, {
      target: { value: "A compact action prototype." }
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Next: Production Setup/i })
    );

    expect(screen.getByText(/Step 2 of 2/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Back$/i }));

    expect(screen.getByLabelText(/Game Title/i)).toHaveValue("Nightline Zero");
    expect(screen.getByLabelText(/One-Line Pitch/i)).toHaveValue(
      "A compact action prototype."
    );
  });

  it("requires a title before continuing", () => {
    renderModal();

    fireEvent.click(
      screen.getByRole("button", { name: /Next: Production Setup/i })
    );

    expect(
      screen.getByText(/Game title is required before continuing/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 2/i)).toBeInTheDocument();
  });

  it("starts from a neutral blank baseline when no genre path is chosen", async () => {
    renderModal();

    expect(screen.getByText(/Neutral baseline/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Choose a genre family and subgenre to load tailored recommendations/i)
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Game Title/i), {
      target: { value: "Untitled Prototype" }
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
          title: "Untitled Prototype",
          templateId: "blank-game-project",
          sessionLength: "10-20 minutes",
          platformTargets: ["pc", "web"],
          agentTargets: ["codex", "cursor"]
        })
      );
    });
  });

  it("maps genre and subgenre selections to hidden profile recommendations", async () => {
    renderModal();

    fireEvent.change(screen.getByLabelText(/Game Title/i), {
      target: { value: "Station Nine" }
    });
    fireEvent.change(getGenreFamilySelect(), {
      target: { value: "horror" }
    });
    fireEvent.change(getSubgenreSelect(), {
      target: { value: "survival-horror" }
    });

    expect(screen.getByText(/Horror -> Survival Horror/i)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /Next: Production Setup/i })
    );

    expect(screen.getByLabelText(/Typical Session/i)).toHaveValue(
      "20-40 minutes"
    );
    expect(screen.getByLabelText(/Target Audience/i)).toHaveValue(
      "Players who want tense exploration, scarce resources, and readable dread."
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Create Game Project/i })
    );

    await waitFor(() => {
      expect(mocks.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Station Nine",
          templateId: "survival-horror-lite",
          genre: "Horror",
          subgenre: "Survival Horror",
          sessionLength: "20-40 minutes",
          platformTargets: ["pc", "console"],
          agentTargets: ["codex", "claude-code", "cursor"]
        })
      );
    });
  });

  it("defaults to a single connected provider tool target when one maps cleanly", async () => {
    mocks.defaultProvider = { provider: "claude-code" };

    renderModal();

    fireEvent.change(screen.getByLabelText(/Game Title/i), {
      target: { value: "Station Nine" }
    });
    fireEvent.change(getGenreFamilySelect(), {
      target: { value: "horror" }
    });
    fireEvent.change(getSubgenreSelect(), {
      target: { value: "survival-horror" }
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Next: Production Setup/i })
    );

    expect(screen.getByText(/1 tool targets/i)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /Create Game Project/i })
    );

    await waitFor(() => {
      expect(mocks.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          agentTargets: ["claude-code"],
          targetPlatforms: ["claude-code"]
        })
      );
    });
  });

  it("surfaces the expanded genre families and maps new subgenres to hidden profiles", async () => {
    renderModal();

    fireEvent.change(screen.getByLabelText(/Game Title/i), {
      target: { value: "Wayfinder Drift" }
    });

    expect(
      screen.getByRole("option", { name: "Adventure" })
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "RPG" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Simulation" })
    ).toBeInTheDocument();

    fireEvent.change(getGenreFamilySelect(), {
      target: { value: "action" }
    });

    expect(
      screen.getByRole("option", { name: "Arena Shooter" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Character Action" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "First-Person Shooter" })
    ).toBeInTheDocument();

    fireEvent.change(getSubgenreSelect(), {
      target: { value: "arena-shooter" }
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Next: Production Setup/i })
    );

    expect(screen.getByText(/Action -> Arena Shooter/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Typical Session/i)).toHaveValue(
      "10-20 minutes"
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Create Game Project/i })
    );

    await waitFor(() => {
      expect(mocks.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Wayfinder Drift",
          templateId: "twin-stick-shooter",
          genre: "Action",
          subgenre: "Arena Shooter"
        })
      );
    });
  });

  it("maps FPS to the compact action recommendation profile", async () => {
    renderModal();

    fireEvent.change(screen.getByLabelText(/Game Title/i), {
      target: { value: "Mercury Line" }
    });
    fireEvent.change(getGenreFamilySelect(), {
      target: { value: "action" }
    });
    fireEvent.change(getSubgenreSelect(), {
      target: { value: "fps" }
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Next: Production Setup/i })
    );

    expect(screen.getByText(/Action -> First-Person Shooter/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Typical Session/i)).toHaveValue(
      "10-20 minutes"
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Create Game Project/i })
    );

    await waitFor(() => {
      expect(mocks.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Mercury Line",
          templateId: "action-lite",
          genre: "Action",
          subgenre: "First-Person Shooter"
        })
      );
    });
  });

  it("keeps manually edited production fields when the genre path changes and can reset them", async () => {
    renderModal();

    fireEvent.change(screen.getByLabelText(/Game Title/i), {
      target: { value: "Prototype Zero" }
    });
    fireEvent.change(getGenreFamilySelect(), {
      target: { value: "horror" }
    });
    fireEvent.change(getSubgenreSelect(), {
      target: { value: "survival-horror" }
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Next: Production Setup/i })
    );

    const largeScopeButton = screen.getByText("Large").closest("button");
    expect(largeScopeButton).not.toBeNull();
    fireEvent.click(largeScopeButton!);
    fireEvent.change(screen.getByLabelText(/Target Audience/i), {
      target: { value: "Custom horror audience" }
    });

    fireEvent.click(screen.getByRole("button", { name: /^Back$/i }));
    fireEvent.change(getGenreFamilySelect(), {
      target: { value: "action" }
    });
    fireEvent.change(getSubgenreSelect(), {
      target: { value: "rail-shooter" }
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Next: Production Setup/i })
    );

    expect(screen.getByText(/Action -> Rail Shooter/i)).toBeInTheDocument();
    expect(screen.getByText(/Large Scope Warning/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Target Audience/i)).toHaveValue(
      "Custom horror audience"
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Reset to recommendations/i })
    );

    await waitFor(() => {
      expect(screen.queryByText(/Large Scope Warning/i)).not.toBeInTheDocument();
      expect(screen.getByDisplayValue("3-10 minutes")).toBeInTheDocument();
      expect(screen.getByLabelText(/Target Audience/i)).toHaveValue(
        "Arcade action fans who want short, replayable sessions."
      );
    });
  });

  it("reveals the other path and submits guided custom seeds through the existing payload shape", async () => {
    renderModal();

    fireEvent.change(screen.getByLabelText(/Game Title/i), {
      target: { value: "Cipher Vault" }
    });
    fireEvent.change(getGenreFamilySelect(), {
      target: { value: "other" }
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

  it("uses a guided engine dropdown and reveals custom input when needed", async () => {
    renderModal();

    fireEvent.change(screen.getByLabelText(/Game Title/i), {
      target: { value: "Engine Check" }
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Next: Production Setup/i })
    );

    const engineSelect = screen.getByRole("combobox", {
      name: /Engine Preference/i
    });

    fireEvent.change(engineSelect, {
      target: { value: "Godot" }
    });

    expect(
      screen.queryByPlaceholderText(/Use a custom engine or runtime/i)
    ).not.toBeInTheDocument();

    fireEvent.change(engineSelect, {
      target: { value: "__custom__" }
    });

    const customEngineInput = screen.getByPlaceholderText(
      /Use a custom engine or runtime/i
    );
    fireEvent.change(customEngineInput, {
      target: { value: "Custom ECS Runtime" }
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Create Game Project/i })
    );

    await waitFor(() => {
      expect(mocks.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Engine Check",
          enginePreference: "Custom ECS Runtime"
        })
      );
    });
  });

  it("uses a compact progress header on mobile instead of the large step cards", () => {
    mocks.webSurface = "mobile-web";

    renderModal();

    expect(screen.getByText(/Step 1 of 2/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Core Identity/i })).toBeInTheDocument();
    expect(screen.queryAllByText(/Step 1 of 2/i)).toHaveLength(1);
    expect(screen.queryByText(/Title, pitch, genre\./i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Scope, platforms, tools\./i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Cancel$/i })).not.toBeInTheDocument();
  });

  it("keeps recommendation panels collapsed by default on mobile step one", () => {
    mocks.webSurface = "mobile-web";

    renderModal();

    expect(
      screen.getByRole("button", { name: /Recommendation Summary/i })
    ).toBeInTheDocument();
    expect(screen.queryByText(/Recommendation Rules/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Recommended Setup/i)).not.toBeInTheDocument();
  });

  it("keeps custom genre details collapsed by default on mobile", () => {
    mocks.webSurface = "mobile-web";

    renderModal();

    fireEvent.change(getGenreFamilySelect(), {
      target: { value: "other" }
    });

    expect(screen.getByLabelText(/^Genre$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Custom Details/i })
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Subgenre$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Player Fantasy/i)).not.toBeInTheDocument();
  });

  it("collapses the recommendation baseline and uses compact scope cards on mobile step two", () => {
    mocks.webSurface = "mobile-web";

    renderModal();

    fireEvent.change(screen.getByLabelText(/Game Title/i), {
      target: { value: "Pocket Build" }
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Next: Production Setup/i })
    );

    expect(
      screen.getByRole("button", { name: /Recommendation Baseline/i })
    ).toBeInTheDocument();
    expect(screen.queryByText(/Recommendation Profile/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/What This Workspace Optimizes For/i)).not.toBeInTheDocument();
    expect(
      screen
        .getByText("Small")
        .closest('[data-layout-variant="mobile-compact"]')
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Back$/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Step 2 of 2/i)).toHaveLength(1);
  });

  it("keeps the richer recommendation layout on desktop", () => {
    renderModal();

    expect(screen.getByText(/Recommended Setup/i)).toBeInTheDocument();
    expect(screen.getByText(/Recommendation Rules/i)).toBeInTheDocument();
  });
});
