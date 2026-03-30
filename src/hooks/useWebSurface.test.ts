import { describe, expect, it } from "vitest";
import { resolveWebSurface } from "@/hooks/useWebSurface";

describe("resolveWebSurface", () => {
  it("returns mobile-web for phone-width layouts on mobile-like devices", () => {
    expect(
      resolveWebSurface({
        viewportWidth: 390,
        maxTouchPoints: 5,
        prefersCoarsePointer: true,
        isMobileUserAgent: true
      })
    ).toBe("mobile-web");
  });

  it("returns desktop-web for tablet-width layouts", () => {
    expect(
      resolveWebSurface({
        viewportWidth: 1024,
        maxTouchPoints: 5,
        prefersCoarsePointer: true,
        isMobileUserAgent: true
      })
    ).toBe("desktop-web");
  });

  it("returns desktop-web for narrow desktop browser windows without mobile hints", () => {
    expect(
      resolveWebSurface({
        viewportWidth: 640,
        maxTouchPoints: 0,
        prefersCoarsePointer: false,
        isMobileUserAgent: false
      })
    ).toBe("desktop-web");
  });
});
