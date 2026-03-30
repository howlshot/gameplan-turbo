import { useEffect, useState } from "react";

export type WebSurface = "desktop-web" | "mobile-web";

export const MOBILE_WEB_MAX_WIDTH = 767;

export const resolveWebSurface = ({
  viewportWidth
}: {
  viewportWidth: number;
}): WebSurface => {
  return viewportWidth <= MOBILE_WEB_MAX_WIDTH
    ? "mobile-web"
    : "desktop-web";
};

const getCurrentSurface = (): WebSurface => {
  if (typeof window === "undefined") {
    return "desktop-web";
  }

  return resolveWebSurface({
    viewportWidth: window.innerWidth
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
