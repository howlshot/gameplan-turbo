const BRIDGE_TOKEN_STORAGE_KEY = "gameplan-turbo:bridge-token";
const BRIDGE_TOKEN_HASH_PREFIX = "#bridgeToken=";

const buildCleanUrl = (url: URL): string => {
  const search = url.searchParams.toString();
  return `${url.pathname}${search ? `?${search}` : ""}${url.hash}`;
};

export const initializeBridgeTokenFromUrl = (): void => {
  const url = new URL(window.location.href);
  const token = url.hash.startsWith(BRIDGE_TOKEN_HASH_PREFIX)
    ? decodeURIComponent(url.hash.slice(BRIDGE_TOKEN_HASH_PREFIX.length)).trim()
    : "";

  if (!token) {
    return;
  }

  sessionStorage.setItem(BRIDGE_TOKEN_STORAGE_KEY, token);
  url.hash = "";
  window.history.replaceState(window.history.state, "", buildCleanUrl(url));
};

export const getBridgeSessionToken = (): string =>
  sessionStorage.getItem(BRIDGE_TOKEN_STORAGE_KEY)?.trim() ?? "";

export const getBridgeRequestHeaders = (
  headers: Record<string, string> = {}
): Record<string, string> => {
  const token = getBridgeSessionToken();

  if (!token) {
    return headers;
  }

  return {
    ...headers,
    "X-Gameplan-Bridge-Token": token
  };
};

export const parseBridgeErrorMessage = async (
  response: Response,
  fallback: string
): Promise<string> => {
  try {
    const payload = (await response.json()) as { error?: string; message?: string };
    return payload.error?.trim() || payload.message?.trim() || fallback;
  } catch {
    try {
      const text = (await response.text()).trim();
      return text || fallback;
    } catch {
      return fallback;
    }
  }
};
