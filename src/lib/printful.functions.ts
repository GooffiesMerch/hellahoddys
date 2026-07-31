import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const recipientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  address1: z.string().min(1),
  address2: z.string().optional().default(""),
  city: z.string().min(1),
  state_code: z.string().optional().default(""),
  country_code: z.string().min(2).max(2),
  zip: z.string().min(1),
  phone: z.string().optional().default(""),
});

const itemSchema = z.object({
  handle: z.string(),
  title: z.string(),
  sku: z.string().optional().default(""),
  variantLabel: z.string().optional().default(""),
  price: z.number().nonnegative(),
  quantity: z.number().int().min(1).max(50),
});

/** Full re-pull of every Printful store (troubleshooting only — sync is automatic). */
export const syncPrintfulCatalog = createServerFn({ method: "POST" }).handler(async () => {
  const { syncCatalog } = await import("./printful-fulfillment.server");
  return syncCatalog({ full: true });
});

/** Live shipping options for a cart + destination. */
export const getShippingRates = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ recipient: recipientSchema, items: z.array(itemSchema).min(1) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { shippingRates } = await import("./printful-fulfillment.server");
    return shippingRates(data.recipient, data.items);
  });

/** Creates the order locally and submits it to Printful for fulfillment. */
export const createPrintfulOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        recipient: recipientSchema,
        items: z.array(itemSchema).min(1),
        shippingMethod: z.string().default("STANDARD"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { placeOrder } = await import("./printful-fulfillment.server");
    return placeOrder(data.recipient, data.items, data.shippingMethod);
  });

/** Order status + tracking for the confirmation page. */
export const getOrderStatus = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { orderStatus } = await import("./printful-fulfillment.server");
    return orderStatus(data.id);
  });