import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getPaypalConfig } from "@/lib/payments.functions";

/** Shows a notice while PayPal is running in sandbox (test) mode. */
export function PaymentTestModeBanner() {
  const loadConfig = useServerFn(getPaypalConfig);
  const [state, setState] = useState<{ clientId: string; environment: string } | null>(null);

  useEffect(() => {
    let active = true;
    loadConfig({})
      .then((c) => active && setState(c))
      .catch(() => active && setState({ clientId: "", environment: "sandbox" }));
    return () => {
      active = false;
    };
  }, [loadConfig]);

  if (!state) return null;

  if (!state.clientId) {
    return (
      <div className="w-full border-b border-destructive/40 bg-destructive/10 px-4 py-2 text-center text-xs text-destructive">
        PayPal is not configured yet — checkout is unavailable.
      </div>
    );
  }

  if (state.environment === "sandbox") {
    return (
      <div className="w-full border-b border-primary/30 bg-primary/10 px-4 py-2 text-center text-xs text-foreground">
        Payments are in PayPal sandbox mode — use a sandbox buyer account to test.
      </div>
    );
  }
  return null;
}
