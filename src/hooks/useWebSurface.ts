import { useEffect, useState } from "react";

export type WebSurface = "desktop-web" | "mobile-web";

export const MOBILE_WEB_MAX_WIDTH = 767;

const MOBILE_USER_AGENT_PATTERN =
  /Android.+Mobile|iPhone|iPod|IEMobile|Opera Mini|Windows Phone|webOS/i;

export const resolveWebSurface = ({
  viewportWidth,
  maxTouchPoints = 0,
  prefersCoarsePointer = false,
  isMobileUserAgent
}: {
  viewportWidth: number;
  maxTouchPoints?: number;
  prefersCoarsePointer?: boolean;
  isMobileUserAgent?: boolean;
}): WebSurface => {
  if (viewportWidth > MOBILE_WEB_MAX_WIDTH) {
    return "desktop-web";
  }

  const mobileLikeDevice =
    maxTouchPoints > 0 || prefersCoarsePointer || Boolean(isMobileUserAgent);

  return mobileLikeDevice ? "mobile-web" : "desktop-web";
};

const getCurrentSurface = (): WebSurface => {
  if (typeof window === "undefined") {
    return "desktop-web";
  }

  const isMobileUserAgent = MOBILE_USER_AGENT_PATTERN.test(
    navigator.userAgent ?? ""
  );

  return resolveWebSurface({
    viewportWidth: window.innerWidth,
    maxTouchPoints: navigator.maxTouchPoints,
    prefersCoarsePointer:
      window.matchMedia?.("(pointer: coarse)").matches ??
      window.matchMedia?.("(any-pointer: coarse)").matches ??
      false,
    isMobileUserAgent
  });
};

export const useWebSurface = (): WebSurface => {
  const [surface, setSurface] = useState<WebSurface>(() => getCurrentSurface());

  useEffect(() => {
    const updateSurface = (): void => {
      setSurface(getCurrentSurface());
    };

    updateSurface();
    window.addEventListener("resize", updateSurface);

    return () => {
      window.removeEventListener("resize", updateSurface);
    };
  }, []);

  return surface;
};

export const isMobileWebSurface = (surface: WebSurface): boolean =>
  surface === "mobile-web";
