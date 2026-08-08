/**
 * Minimal PayPal REST (Orders v2) client.
 *
 * Uses your own PayPal Business app credentials:
 *   PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET / PAYPAL_ENV ("sandbox" | "live")
 */
export type PaypalEnv = "sandbox" | "live";

function env(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is not configured`);
  return value;
}

export function paypalEnvironment(): PaypalEnv {
  return process.env["PAYPAL_ENV"] === "live" ? "live" : "sandbox";
}

function apiBase(): string {
  return paypalEnvironment() === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) return cachedToken.value;

  const basic = btoa(`${env("PAYPAL_CLIENT_ID")}:${env("PAYPAL_CLIENT_SECRET")}`);
  const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const body = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!res.ok || !body.access_token) {
    throw new Error(`PayPal auth failed [${res.status}]: ${JSON.stringify(body)}`);
  }
  cachedToken = {
    value: body.access_token,
    expiresAt: Date.now() + (body.expires_in ?? 3000) * 1000,
  };
  return cachedToken.value;
}

export async function paypalRequest<T>(
  path: string,
  init: { method?: string; body?: unknown; requestId?: string } = {},
): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      "Content-Type": "application/json",
      ...(init.requestId ? { "PayPal-Request-Id": init.requestId } : {}),
    },
    ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
  });

  const text = await res.text();
  const json = text ? (JSON.parse(text) as unknown) : {};
  if (!res.ok) throw new Error(`PayPal request failed [${res.status}]: ${text}`);
  return json as T;
}

/** Human-readable message for a PayPal/API failure. */
export function getPaypalErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "PayPal request failed";
}

export interface PaypalCredentialCheck {
  ok: boolean;
  environment: PaypalEnv;
  hasClientId: boolean;
  hasClientSecret: boolean;
  clientIdPreview: string;
  sameValue: boolean;
  error: string | null;
}

/**
 * Verifies PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET / PAYPAL_ENV belong together by
 * requesting an access token from the configured environment. Never returns secrets.
 */
export async function verifyPaypalCredentials(): Promise<PaypalCredentialCheck> {
  const clientId = process.env["PAYPAL_CLIENT_ID"] ?? "";
  const clientSecret = process.env["PAYPAL_CLIENT_SECRET"] ?? "";
  const environment = paypalEnvironment();
  return testPaypalCredentials(clientId, clientSecret, environment);
}

/**
 * Tests a candidate PayPal client ID / secret pair against the chosen environment.
 * Safe to call with user-provided input: it only returns a status, never the secrets.
 */
export async function testPaypalCredentials(
  clientId: string,
  clientSecret: string,
  environment: PaypalEnv,
): Promise<PaypalCredentialCheck> {
  const base: PaypalCredentialCheck = {
    ok: false,
    environment,
    hasClientId: Boolean(clientId),
    hasClientSecret: Boolean(clientSecret),
    clientIdPreview: clientId ? `${clientId.slice(0, 8)}…${clientId.slice(-4)}` : "",
    sameValue: Boolean(clientId) && clientId === clientSecret,
    error: null,
  };

  if (!clientId || !clientSecret) {
    return { ...base, error: "Client ID and Client Secret are required." };
  }
  if (base.sameValue) {
    return {
      ...base,
      error: "Client Secret is the same value as Client ID — paste the app's secret.",
    };
  }

  const baseUrl = environment === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
  try {
    const basic = btoa(`${clientId}:${clientSecret}`);
    const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    if (res.ok) return { ...base, ok: true };
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.status === 401 || body.error === "invalid_client") {
      return {
        ...base,
        error: `PayPal rejected these credentials in ${environment} mode. Make sure the ID and secret come from the same app and that the environment matches that app's mode.`,
      };
    }
    return { ...base, error: `PayPal auth failed (${res.status}).` };
  } catch (error) {
    return { ...base, error: getPaypalErrorMessage(error) };
  }
}
