/**
 * Minimal Stripe REST client routed through Lovable's managed payments
 * gateway. The keys in this project are gateway connection identifiers, not
 * real Stripe secret keys, so we must never call api.stripe.com directly.
 */
export type StripeEnv = "sandbox" | "live";

const GATEWAY = "https://connector-gateway.lovable.dev/stripe";

function connectionKey(env: StripeEnv): string {
  const key =
    env === "live"
      ? process.env["STRIPE_LIVE_API_KEY"]
      : process.env["STRIPE_SANDBOX_API_KEY"];
  if (!key) {
    throw new Error(
      `Stripe is not configured for the ${env} environment. Complete Stripe setup in your Lovable project.`,
    );
  }
  return key;
}

/** Stripe expects PHP-style bracket form encoding for nested params. */
function encode(params: unknown, prefix = "", out: string[] = []): string[] {
  if (params === undefined || params === null) return out;
  if (Array.isArray(params)) {
    params.forEach((v, i) => encode(v, `${prefix}[${i}]`, out));
    return out;
  }
  if (typeof params === "object") {
    for (const [k, v] of Object.entries(params as Record<string, unknown>)) {
      encode(v, prefix ? `${prefix}[${k}]` : k, out);
    }
    return out;
  }
  out.push(`${encodeURIComponent(prefix)}=${encodeURIComponent(String(params))}`);
  return out;
}

export class StripeError extends Error {
  readonly code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "StripeError";
    this.code = code;
  }
}

async function request<T>(
  env: StripeEnv,
  method: "GET" | "POST",
  path: string,
  params?: Record<string, unknown>,
): Promise<T> {
  const body = method === "POST" ? encode(params ?? {}).join("&") : undefined;
  const query = method === "GET" && params ? `?${encode(params).join("&")}` : "";
  const res = await fetch(`${GATEWAY}${path}${query}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env["LOVABLE_API_KEY"] ?? ""}`,
      "X-Connection-Api-Key": connectionKey(env),
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    ...(body ? { body } : {}),
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const err = (json as { error?: { message?: string; code?: string } }).error;
    throw new StripeError(err?.message ?? `Stripe request failed (${res.status})`, err?.code);
  }
  return json as T;
}

export interface StripeCheckoutSession {
  id: string;
  client_secret?: string | null;
  payment_status?: string;
  status?: string;
  amount_total?: number;
  currency?: string;
  customer?: string;
  metadata?: Record<string, string>;
  total_details?: { amount_tax?: number; amount_shipping?: number };
}

export interface StripeCustomer {
  id: string;
  email?: string | null;
  metadata?: Record<string, string>;
}

export function createStripeClient(env: StripeEnv) {
  return {
    env,
    checkout: {
      sessions: {
        create: (params: Record<string, unknown>) =>
          request<StripeCheckoutSession>(env, "POST", "/v1/checkout/sessions", params),
        retrieve: (id: string) =>
          request<StripeCheckoutSession>(env, "GET", `/v1/checkout/sessions/${id}`),
      },
    },
    customers: {
      list: (params: Record<string, unknown>) =>
        request<{ data: StripeCustomer[] }>(env, "GET", "/v1/customers", params),
      create: (params: Record<string, unknown>) =>
        request<StripeCustomer>(env, "POST", "/v1/customers", params),
      update: (id: string, params: Record<string, unknown>) =>
        request<StripeCustomer>(env, "POST", `/v1/customers/${id}`, params),
    },
  };
}

export function getStripeErrorMessage(error: unknown): string {
  if (error instanceof StripeError) return error.message;
  if (error instanceof Error) return error.message;
  return "Payment could not be started. Please try again.";
}