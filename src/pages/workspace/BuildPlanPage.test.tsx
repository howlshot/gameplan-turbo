import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BuildPlanPage } from "@/pages/workspace/BuildPlanPage";

vi.mock("@/pages/workspace/PromptLabPage", () => ({
  PromptLabPage: () => <div>prompt-lab-compat</div>
}));

describe("BuildPlanPage", () => {
  it("reuses Prompt Lab as the legacy build-plan compatibility surface", () => {
    render(<BuildPlanPage />);

    expect(screen.getByText("prompt-lab-compat")).toBeInTheDocument();
  });
});
