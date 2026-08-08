import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { checkPaypalCredentials, testPaypalCredentials } from "@/lib/payments.functions";

export const Route = createFileRoute("/admin/paypal")({
  head: () => ({
    meta: [
      { title: "PayPal Credential Check — Hella Hoodys" },
      {
        name: "description",
        content: "Verify and update the PayPal client ID, secret and environment before checkout.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaypalCheckPage,
});

type StoredResult = Awaited<ReturnType<typeof checkPaypalCredentials>>;
type TestResult = Awaited<ReturnType<typeof testPaypalCredentials>>;

function PaypalCheckPage() {
  const check = useServerFn(checkPaypalCredentials);
  const test = useServerFn(testPaypalCredentials);

  const [storedResult, setStoredResult] = useState<StoredResult | null>(null);
  const [storedLoading, setStoredLoading] = useState(true);

  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [environment, setEnvironment] = useState<"sandbox" | "live">("live");
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  const runStored = useCallback(() => {
    setStoredLoading(true);
    check({})
      .then(setStoredResult)
      .finally(() => setStoredLoading(false));
  }, [check]);

  useEffect(runStored, [runStored]);

  const handleTest = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setTestLoading(true);
      setTestResult(null);
      try {
        const result = await test({ data: { clientId, clientSecret, environment } });
        setTestResult(result);
      } finally {
        setTestLoading(false);
      }
    },
    [test, clientId, clientSecret, environment],
  );

  return (
    <div className="mx-auto max-w-[760px] px-6 lg:px-10 py-16">
      <h1 className="text-3xl font-black tracking-tight">PayPal credential check</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Confirms the client ID, secret and environment belong to the same PayPal app.
      </p>

      <div className="mt-8 rounded-md border border-border p-6">
        <h2 className="text-sm font-semibold">Stored credentials</h2>
        {storedLoading && !storedResult ? (
          <p className="mt-4 text-sm text-muted-foreground">Checking…</p>
        ) : storedResult ? (
          <>
            <div
              className={`mt-4 rounded-md px-4 py-3 text-sm font-semibold ${
                storedResult.ok
                  ? "bg-primary/10 text-foreground"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {storedResult.ok
                ? `Credentials are valid in ${storedResult.environment} mode — checkout is ready.`
                : (storedResult.error ?? "PayPal credentials are not usable.")}
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              <Item label="PAYPAL_ENV" value={storedResult.environment} />
              <Item
                label="PAYPAL_CLIENT_ID"
                value={storedResult.hasClientId ? storedResult.clientIdPreview : "missing"}
              />
              <Item
                label="PAYPAL_CLIENT_SECRET"
                value={
                  !storedResult.hasClientSecret
                    ? "missing"
                    : storedResult.sameValue
                      ? "same as client ID (invalid)"
                      : "set"
                }
              />
              <Item label="Token request" value={storedResult.ok ? "accepted" : "rejected"} />
            </dl>
          </>
        ) : null}

        <button
          type="button"
          onClick={runStored}
          disabled={storedLoading}
          className="mt-6 rounded-md border border-border px-4 py-2 text-xs font-semibold hover:bg-accent disabled:opacity-50"
        >
          {storedLoading ? "Checking…" : "Re-check stored credentials"}
        </button>
      </div>

      <div className="mt-8 rounded-md border border-border p-6">
        <h2 className="text-sm font-semibold">Update / test new credentials</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Paste the values from the same PayPal app and same mode (Live or Sandbox). The test only
          validates the pair — it does not change the stored secrets until you save them.
        </p>

        <form onSubmit={handleTest} className="mt-6 space-y-4">
          <div>
            <label htmlFor="paypal-client-id" className="block text-xs font-semibold">
              PayPal Client ID
            </label>
            <input
              id="paypal-client-id"
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="AeX..."
              maxLength={256}
              required
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="paypal-client-secret" className="block text-xs font-semibold">
              PayPal Client Secret
            </label>
            <input
              id="paypal-client-secret"
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="EJx..."
              maxLength={256}
              required
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="paypal-env" className="block text-xs font-semibold">
              Environment
            </label>
            <select
              id="paypal-env"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as "sandbox" | "live")}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="live">Live (real payments)</option>
              <option value="sandbox">Sandbox (test only)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={testLoading || !clientId || !clientSecret}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {testLoading ? "Testing…" : "Test credentials"}
          </button>
        </form>

        {testResult ? (
          <div
            className={`mt-6 rounded-md px-4 py-3 text-sm font-semibold ${
              testResult.ok
                ? "bg-primary/10 text-foreground"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {testResult.ok
              ? `These credentials are valid in ${testResult.environment} mode. You can save them now.`
              : (testResult.error ?? "These credentials are not usable.")}
          </div>
        ) : null}

        <div className="mt-6 rounded-md bg-accent/50 px-4 py-3 text-xs text-muted-foreground">
          To save these values to the project secrets, click the button below and re-enter them in
          the secure form. Both values must come from the same PayPal app and same mode.
        </div>
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
