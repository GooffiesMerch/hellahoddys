import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useNavigate } from "@tanstack/react-router";
import { cartItemKey, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import { getShippingRates } from "@/lib/printful.functions";
import {
  completeCheckout,
  createCheckoutSession,
  getPaypalConfig,
} from "@/lib/payments.functions";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

const COUNTRIES: Array<{ code: string; name: string }> = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "IE", name: "Ireland" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "IN", name: "India" },
  { code: "PK", name: "Pakistan" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "ZA", name: "South Africa" },
];

const STATES: Record<string, Array<{ code: string; name: string }>> = {
  US: [
    ["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],
    ["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["DC","District of Columbia"],
    ["FL","Florida"],["GA","Georgia"],["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],
    ["IN","Indiana"],["IA","Iowa"],["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],
    ["ME","Maine"],["MD","Maryland"],["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],
    ["MS","Mississippi"],["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],
    ["NH","New Hampshire"],["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],
    ["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],["OK","Oklahoma"],["OR","Oregon"],
    ["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],["SD","South Dakota"],
    ["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],["VA","Virginia"],
    ["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"],
    ["PR","Puerto Rico"],
  ].map(([code, name]) => ({ code, name })),
  CA: [
    ["AB","Alberta"],["BC","British Columbia"],["MB","Manitoba"],["NB","New Brunswick"],
    ["NL","Newfoundland and Labrador"],["NS","Nova Scotia"],["NT","Northwest Territories"],
    ["NU","Nunavut"],["ON","Ontario"],["PE","Prince Edward Island"],["QC","Quebec"],
    ["SK","Saskatchewan"],["YT","Yukon"],
  ].map(([code, name]) => ({ code, name })),
  AU: [
    ["ACT","Australian Capital Territory"],["NSW","New South Wales"],["NT","Northern Territory"],
    ["QLD","Queensland"],["SA","South Australia"],["TAS","Tasmania"],["VIC","Victoria"],
    ["WA","Western Australia"],
  ].map(([code, name]) => ({ code, name })),
};

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Hella Hoodys" },
      { name: "description", content: "Enter your shipping details and place your Hella Hoodys order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

interface Rate {
  id: string;
  name: string;
  rate: string;
  currency: string;
  minDeliveryDays?: number;
  maxDeliveryDays?: number;
}

const emptyForm = {
  name: "",
  email: "",
  address1: "",
  address2: "",
  city: "",
  state_code: "",
  country_code: "US",
  zip: "",
  phone: "",
};

function CheckoutPage() {
  const { items, subtotal } = useCart();
  const fetchRates = useServerFn(getShippingRates);
  const startCheckout = useServerFn(createCheckoutSession);

  const [form, setForm] = useState(emptyForm);
  const [rates, setRates] = useState<Rate[]>([]);
  const [shippingMethod, setShippingMethod] = useState<string>("");
  const [loadingRates, setLoadingRates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payStep, setPayStep] = useState(false);

  const lines = items.map((i) => ({
    handle: i.handle,
    title: i.title,
    sku: i.variantSku ?? "",
    variantLabel: i.variantLabel ?? "",
    price: i.price,
    quantity: i.quantity,
  }));

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const setCountry = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setForm((f) => ({ ...f, country_code: e.target.value, state_code: "" }));

  const stateOptions = STATES[form.country_code];

  const canQuote =
    form.address1 &&
    form.city &&
    form.zip &&
    form.country_code &&
    (!STATES[form.country_code] || form.state_code) &&
    items.length > 0;

  async function onQuote() {
    setError(null);
    setLoadingRates(true);
    try {
      const res = await fetchRates({
        data: { recipient: { ...form, name: form.name || "Customer", email: form.email || "hello@example.com" }, items: lines },
      });
      setRates(res.rates ?? []);
      setShippingMethod(res.rates?.[0]?.id ?? "");
      if (!res.rates || res.rates.length === 0) {
        setError("No shipping options came back for that address. Double-check it and try again.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load shipping rates.");
    } finally {
      setLoadingRates(false);
    }
  }

  function onPlace(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPayStep(true);
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[900px] px-6 lg:px-10 py-24 text-center">
        <h1 className="text-4xl font-black tracking-tight">Nothing to check out</h1>
        <p className="mt-3 text-muted-foreground">Add a hoody to your bag first.</p>
      </div>
    );
  }

  const selected = rates.find((r) => r.id === shippingMethod);
  const shippingCost = selected ? Number(selected.rate) : 0;

  if (payStep) {
    return (
      <PaymentStep
        recipient={form}
        items={lines}
        shippingMethod={shippingMethod || "STANDARD"}
        total={subtotal + shippingCost}
        onBack={() => setPayStep(false)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-12">
      <PaymentTestModeBanner />
      <h1 className="text-4xl font-black tracking-tight">Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Every piece is printed and shipped on demand by our fulfillment partner.
      </p>

      <form onSubmit={onPlace} className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-md border border-border p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">Shipping details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={form.name} onChange={set("name")} required />
              <Field label="Email" type="email" value={form.email} onChange={set("email")} required />
              <Field label="Address" value={form.address1} onChange={set("address1")} required className="sm:col-span-2" />
              <Field label="Apt, suite (optional)" value={form.address2} onChange={set("address2")} className="sm:col-span-2" />
              <Field label="City" value={form.city} onChange={set("city")} required />
              {stateOptions ? (
                <label className="block text-sm">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    State / province
                  </span>
                  <select
                    value={form.state_code}
                    onChange={(e) => setForm((f) => ({ ...f, state_code: e.target.value }))}
                    required
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
                  >
                    <option value="">Select a state</option>
                    {stateOptions.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <Field label="State / region (optional)" value={form.state_code} onChange={set("state_code")} />
              )}
              <Field label="ZIP / postal code" value={form.zip} onChange={set("zip")} required />
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Country
                </span>
                <select
                  value={form.country_code}
                  onChange={setCountry}
                  required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <Field label="Phone (optional)" value={form.phone} onChange={set("phone")} className="sm:col-span-2" />
            </div>
          </section>

          <section className="rounded-md border border-border p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">Shipping method</h2>
              <button
                type="button"
                onClick={onQuote}
                disabled={!canQuote || loadingRates}
                className="rounded-md border border-border px-4 py-2 text-xs font-semibold hover:bg-accent disabled:opacity-50"
              >
                {loadingRates ? "Getting rates…" : "Get live rates"}
              </button>
            </div>

            {rates.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Fill in your address, then get live rates from our fulfillment partner.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {rates.map((r) => (
                  <li key={r.id}>
                    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-md border border-border px-4 py-3 text-sm hover:bg-accent">
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value={r.id}
                          checked={shippingMethod === r.id}
                          onChange={() => setShippingMethod(r.id)}
                        />
                        <span>
                          <span className="font-semibold">{r.name}</span>
                          {r.minDeliveryDays != null && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              {r.minDeliveryDays}–{r.maxDeliveryDays} business days
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="font-semibold">{formatPrice(Number(r.rate))}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-md border border-border p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">Order summary</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((i) => (
              <li key={cartItemKey(i)} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {i.title}
                  {i.variantLabel ? ` — ${i.variantLabel}` : ""} × {i.quantity}
                </span>
                <span className="font-semibold">{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <Row label="Subtotal" value={formatPrice(subtotal)} />
            <Row
              label="Shipping"
              value={selected ? formatPrice(shippingCost) : "Get rates"}
            />
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-bold">
            <span>Total</span>
            <span>{formatPrice(subtotal + shippingCost)}</span>
          </div>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            className="mt-6 w-full rounded-md bg-brand py-3 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60"
          >
            Continue to payment
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            Payments are processed securely by PayPal. Your order goes into production as soon as
            payment is confirmed.
          </p>
        </aside>
      </form>
    </div>
  );
}

interface PaymentStepProps {
  recipient: typeof emptyForm;
  items: Array<{
    handle: string;
    title: string;
    sku: string;
    variantLabel: string;
    price: number;
    quantity: number;
  }>;
  shippingMethod: string;
  total: number;
  onBack: () => void;
}

function PaymentStep({ recipient, items, shippingMethod, total, onBack }: PaymentStepProps) {
  const loadConfig = useServerFn(getPaypalConfig);
  const startCheckout = useServerFn(createCheckoutSession);
  const finalize = useServerFn(completeCheckout);
  const navigate = useNavigate();
  const { clear } = useCart();

  const [clientId, setClientId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  // Re-opening the PayPal window must not create a second order every click.
  const created = useRef<{ signature: string; paypalOrderId: string } | null>(null);

  useEffect(() => {
    let active = true;
    loadConfig({})
      .then((c) => active && setClientId(c.clientId))
      .catch(() => active && setError("PayPal is not configured yet."));
    return () => {
      active = false;
    };
  }, [loadConfig]);

  return (
    <div className="mx-auto max-w-[900px] px-6 lg:px-10 py-12">
      <PaymentTestModeBanner />
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-black tracking-tight">Payment</h1>
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-border px-4 py-2 text-xs font-semibold hover:bg-accent"
        >
          Back to details
        </button>
      </div>
      <div id="checkout" className="rounded-md border border-border p-6">
        <div className="mb-4 flex justify-between text-sm font-semibold">
          <span>Total due</span>
          <span>{formatPrice(total)}</span>
        </div>
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        {status && <p className="mb-4 text-sm text-muted-foreground">{status}</p>}
        {clientId ? (
          <PayPalScriptProvider
            options={{ clientId, currency: "USD", intent: "capture" }}
          >
            <PayPalButtons
              style={{ layout: "vertical", shape: "rect", label: "paypal" }}
              createOrder={async () => {
                setError(null);
                const signature = JSON.stringify({ recipient, items, shippingMethod });
                if (created.current?.signature === signature) {
                  return created.current.paypalOrderId;
                }
                const res = await startCheckout({
                  data: { recipient, items, shippingMethod },
                });
                if ("error" in res) throw new Error(res.error);
                created.current = { signature, paypalOrderId: res.paypalOrderId };
                return res.paypalOrderId;
              }}
              onApprove={async (data) => {
                setStatus("Confirming your payment…");
                const res = await finalize({ data: { paypalOrderId: data.orderID } });
                if ("error" in res) {
                  setError(res.error);
                  setStatus(null);
                  return;
                }
                if (res.paid && res.orderId) {
                  clear();
                  navigate({ to: "/orders/$id", params: { id: res.orderId } });
                  return;
                }
                setStatus(null);
                setError("Your payment hasn't cleared yet. If you were charged, refresh shortly.");
              }}
              onError={(err) => {
                setStatus(null);
                setError(err instanceof Error ? err.message : "PayPal could not process that payment.");
              }}
            />
          </PayPalScriptProvider>
        ) : (
          !error && <p className="text-sm text-muted-foreground">Loading PayPal…</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function Field({
  label,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
      />
    </label>
  );
}