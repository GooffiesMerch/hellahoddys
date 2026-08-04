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

/** Public PayPal config the browser SDK needs (client id is not a secret). */
export const getPaypalConfig = createServerFn({ method: "GET" }).handler(async () => {
  const { paypalEnvironment } = await import("./paypal.server");
  return {
    clientId: process.env["PAYPAL_CLIENT_ID"] ?? "",
    environment: paypalEnvironment(),
  };
});

/** Creates a pending order plus a PayPal order for the current cart. */
export const createCheckoutSession = createServerFn({ method: "POST" })
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
    const { createCheckout } = await import("./payments.server");
    const { getPaypalErrorMessage } = await import("./paypal.server");
    try {
      return await createCheckout(data);
    } catch (error) {
      console.error("createCheckoutSession failed", error);
      return { error: getPaypalErrorMessage(error) } as const;
    }
  });

/** Captures the PayPal payment and submits the paid order to Printful. */
export const completeCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ paypalOrderId: z.string().min(1).max(64) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { finalizeCheckout } = await import("./payments.server");
    const { getPaypalErrorMessage } = await import("./paypal.server");
    try {
      return await finalizeCheckout(data.paypalOrderId);
    } catch (error) {
      console.error("completeCheckout failed", error);
      return { error: getPaypalErrorMessage(error) } as const;
    }
  });
