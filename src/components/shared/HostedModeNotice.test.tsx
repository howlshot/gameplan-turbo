import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HostedModeNotice } from "@/components/shared/HostedModeNotice";

const mocks = vi.hoisted(() => ({
  hostedRuntime: true
}));

vi.mock("@/lib/runtimeMode", () => ({
  isHostedRuntime: () => mocks.hostedRuntime
}));

vi.mock("@/hooks/useDialogAccessibility", () => ({
  useDialogAccessibility: () => ({ current: null })
}));

describe("HostedModeNotice", () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.hostedRuntime = true;
  });

  it("shows a hosted-mode notice on first hosted visit", () => {
    render(<HostedModeNotice />);

    expect(
      screen.getByRole("heading", { name: /You are using the browser-hosted version/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue in Browser/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Download Desktop/i })).toHaveAttribute(
      "href",
      expect.stringContaining("github.com/howlshot/gameplan-turbo/releases/latest")
    );
  });

  it("does not show after dismissal", () => {
    render(<HostedModeNotice />);

    fireEvent.click(screen.getByRole("button", { name: /Continue in Browser/i }));

    expect(
      localStorage.getItem("gameplan-turbo:hosted-mode-notice-dismissed")
    ).toBe("true");
    expect(
      screen.queryByRole("heading", { name: /You are using the browser-hosted version/i })
    ).not.toBeInTheDocument();
  });

  it("does not show in local runtime", () => {
    mocks.hostedRuntime = false;

    render(<HostedModeNotice />);

    expect(
      screen.queryByRole("heading", { name: /You are using the browser-hosted version/i })
    ).not.toBeInTheDocument();
  });
});
