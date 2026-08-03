import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const envSchema = z.enum(["sandbox", "live"]);

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

/** Creates a Stripe embedded checkout session for the current cart. */
export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        recipient: recipientSchema,
        items: z.array(itemSchema).min(1),
        shippingMethod: z.string().default("STANDARD"),
        returnUrl: z.string().url(),
        environment: envSchema,
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { createCheckout } = await import("./payments.server");
    const { getStripeErrorMessage } = await import("./stripe.server");
    try {
      return await createCheckout(data);
    } catch (error) {
      console.error("createCheckoutSession failed", error);
      return { error: getStripeErrorMessage(error) } as const;
    }
  });

/** Confirms payment and submits the paid order to Printful. */
export const completeCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ sessionId: z.string().min(1), environment: envSchema }).parse(data),
  )
  .handler(async ({ data }) => {
    const { finalizeCheckout } = await import("./payments.server");
    const { getStripeErrorMessage } = await import("./stripe.server");
    try {
      return await finalizeCheckout(data.sessionId, data.environment);
    } catch (error) {
      console.error("completeCheckout failed", error);
      return { error: getStripeErrorMessage(error) } as const;
    }
  });