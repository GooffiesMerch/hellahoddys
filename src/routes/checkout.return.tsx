import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { completeCheckout } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Order confirmation — Hella Hoodys" },
      { name: "description", content: "Your Hella Hoodys payment confirmation." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id: sessionId } = Route.useSearch();
  const finalize = useServerFn(completeCheckout);
  const navigate = useNavigate();
  const { clear } = useCart();
  const [message, setMessage] = useState("Confirming your payment…");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!sessionId) {
      setMessage("We couldn't find that checkout session.");
      return;
    }
    (async () => {
      try {
        const res = await finalize({ data: { sessionId, environment: getStripeEnvironment() } });
        if ("error" in res) {
          setMessage(res.error);
          return;
        }
        if (res.paid && res.orderId) {
          clear();
          navigate({ to: "/orders/$id", params: { id: res.orderId } });
          return;
        }
        setMessage(
          "Your payment hasn't cleared yet. If you were charged, refresh this page in a moment.",
        );
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Could not confirm your payment.");
      }
    })();
  }, [sessionId, finalize, navigate, clear]);

  return (
    <div className="mx-auto max-w-[700px] px-6 py-24 text-center">
      <h1 className="text-3xl font-black tracking-tight">Thanks for your order</h1>
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}