import { describe, expect, it } from "vitest";
import { resolveWebSurface } from "@/hooks/useWebSurface";

describe("resolveWebSurface", () => {
  it("returns mobile-web for phone-width layouts", () => {
    expect(
      resolveWebSurface({
        viewportWidth: 390
      })
    ).toBe("mobile-web");
  });

  it("returns desktop-web for tablet-width layouts", () => {
    expect(
      resolveWebSurface({
        viewportWidth: 1024
      })
    ).toBe("desktop-web");
  });

  it("returns mobile-web for narrow desktop browser windows too", () => {
    expect(
      resolveWebSurface({
        viewportWidth: 640
      })
    ).toBe("mobile-web");
  });
});
