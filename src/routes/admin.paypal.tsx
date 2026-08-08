import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { checkPaypalCredentials } from "@/lib/payments.functions";

export const Route = createFileRoute("/admin/paypal")({
  head: () => ({
    meta: [
      { title: "PayPal Credential Check — Hella Hoodys" },
      {
        name: "description",
        content: "Verify that the PayPal client ID, secret and environment match before checkout.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaypalCheckPage,
});

type Result = Awaited<ReturnType<typeof checkPaypalCredentials>>;

function PaypalCheckPage() {
  const check = useServerFn(checkPaypalCredentials);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  const run = useCallback(() => {
    setLoading(true);
    check({})
      .then(setResult)
      .finally(() => setLoading(false));
  }, [check]);

  useEffect(run, [run]);

  return (
    <div className="mx-auto max-w-[760px] px-6 lg:px-10 py-16">
      <h1 className="text-3xl font-black tracking-tight">PayPal credential check</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Confirms the client ID, secret and environment belong to the same PayPal app.
      </p>

      <div className="mt-8 rounded-md border border-border p-6">
        {loading && !result ? (
          <p className="text-sm text-muted-foreground">Checking…</p>
        ) : result ? (
          <>
            <div
              className={`rounded-md px-4 py-3 text-sm font-semibold ${
                result.ok
                  ? "bg-primary/10 text-foreground"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {result.ok
                ? `Credentials are valid in ${result.environment} mode — checkout is ready.`
                : (result.error ?? "PayPal credentials are not usable.")}
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              <Item label="PAYPAL_ENV" value={result.environment} />
              <Item
                label="PAYPAL_CLIENT_ID"
                value={result.hasClientId ? result.clientIdPreview : "missing"}
              />
              <Item
                label="PAYPAL_CLIENT_SECRET"
                value={
                  !result.hasClientSecret
                    ? "missing"
                    : result.sameValue
                      ? "same as client ID (invalid)"
                      : "set"
                }
              />
              <Item label="Token request" value={result.ok ? "accepted" : "rejected"} />
            </dl>
          </>
        ) : null}

        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="mt-6 rounded-md border border-border px-4 py-2 text-xs font-semibold hover:bg-accent disabled:opacity-50"
        >
          {loading ? "Checking…" : "Re-check"}
        </button>
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}