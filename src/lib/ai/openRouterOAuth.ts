const OPENROUTER_AUTH_URL = "https://openrouter.ai/auth";
const OPENROUTER_EXCHANGE_URL = "https://openrouter.ai/api/v1/auth/keys";
const OPENROUTER_OAUTH_CALLBACK_PATH = "/oauth/openrouter/callback";
const OPENROUTER_OAUTH_MESSAGE_TYPE = "gameplan-turbo:openrouter-oauth";
const OPENROUTER_CODE_VERIFIER_KEY = "gameplan-turbo:openrouter-code-verifier";
const OPENROUTER_STATE_KEY = "gameplan-turbo:openrouter-state";

interface OpenRouterOAuthMessage {
  type: typeof OPENROUTER_OAUTH_MESSAGE_TYPE;
  code?: string;
  error?: string;
  state?: string;
}

const toBase64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const createCodeVerifier = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return toBase64Url(bytes);
};

const createCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier)
  );
  return toBase64Url(new Uint8Array(digest));
};

const getCallbackUrl = (): string =>
  `${window.location.origin}${OPENROUTER_OAUTH_CALLBACK_PATH}`;

const createState = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return toBase64Url(bytes);
};

const clearOpenRouterOAuthSession = (): void => {
  sessionStorage.removeItem(OPENROUTER_CODE_VERIFIER_KEY);
  sessionStorage.removeItem(OPENROUTER_STATE_KEY);
};

const exchangeCodeForApiKey = async (code: string): Promise<string> => {
  const codeVerifier = sessionStorage.getItem(OPENROUTER_CODE_VERIFIER_KEY);

  if (!codeVerifier) {
    throw new Error(
      "OpenRouter sign-in could not be completed because the PKCE verifier was missing. Start sign-in again."
    );
  }

  const response = await fetch(OPENROUTER_EXCHANGE_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      code,
      code_verifier: codeVerifier,
      code_challenge_method: "S256"
    })
  });

  try {
    if (!response.ok) {
      let message = "OpenRouter sign-in could not be completed.";

      try {
        const payload = (await response.json()) as { error?: { message?: string }; message?: string };
        message =
          payload.error?.message ??
          payload.message ??
          message;
      } catch {
        // Ignore JSON parse issues and keep the fallback message.
      }

      throw new Error(message);
    }

    const payload = (await response.json()) as { key?: string };
    if (!payload.key) {
      throw new Error("OpenRouter sign-in completed, but no API key was returned.");
    }

    return payload.key;
  } finally {
    clearOpenRouterOAuthSession();
  }
};

export const startOpenRouterOAuth = async (): Promise<string> => {
  const codeVerifier = createCodeVerifier();
  const codeChallenge = await createCodeChallenge(codeVerifier);
  const state = createState();
  sessionStorage.setItem(OPENROUTER_CODE_VERIFIER_KEY, codeVerifier);
  sessionStorage.setItem(OPENROUTER_STATE_KEY, state);

  const authUrl = new URL(OPENROUTER_AUTH_URL);
  authUrl.searchParams.set("callback_url", getCallbackUrl());
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("state", state);

  const popup = window.open(
    authUrl.toString(),
    "openrouter-oauth",
    "popup=yes,width=560,height=720"
  );

  if (!popup) {
    throw new Error(
      "Your browser blocked the OpenRouter sign-in popup. Allow popups for this app and try again."
    );
  }

  return new Promise((resolve, reject) => {
    let settled = false;

    const cleanup = (): void => {
      if (settled) {
        return;
      }
      settled = true;
      window.removeEventListener("message", handleMessage);
      window.clearInterval(pollClosed);
    };

    const finishError = (message: string): void => {
      clearOpenRouterOAuthSession();
      cleanup();
      reject(new Error(message));
    };

    const handleMessage = async (event: MessageEvent<OpenRouterOAuthMessage>) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data?.type !== OPENROUTER_OAUTH_MESSAGE_TYPE) {
        return;
      }

      const expectedState = sessionStorage.getItem(OPENROUTER_STATE_KEY);
      if (!expectedState || event.data.state !== expectedState) {
        finishError("OpenRouter sign-in returned an invalid state. Start sign-in again.");
        return;
      }

      if (event.data.error) {
        finishError(event.data.error);
        return;
      }

      if (!event.data.code) {
        finishError("OpenRouter did not return an authorization code.");
        return;
      }

      cleanup();

      try {
        const apiKey = await exchangeCodeForApiKey(event.data.code);
        resolve(apiKey);
      } catch (error) {
        reject(error);
      }
    };

    const pollClosed = window.setInterval(() => {
      if (popup.closed && !settled) {
        finishError("OpenRouter sign-in was closed before it finished.");
      }
    }, 500);

    window.addEventListener("message", handleMessage);
  });
};

export const completeOpenRouterOAuthInPopup = (): void => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code") ?? undefined;
  const state = params.get("state") ?? undefined;
  const error =
    params.get("error_description") ??
    params.get("error") ??
    undefined;

  if (window.opener && !window.opener.closed) {
    const payload: OpenRouterOAuthMessage = {
      type: OPENROUTER_OAUTH_MESSAGE_TYPE,
      code,
      error,
      state
    };
    window.opener.postMessage(payload, window.location.origin);
  }

  window.close();
};
