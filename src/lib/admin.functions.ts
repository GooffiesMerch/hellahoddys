import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Lists recent orders for the admin dashboard. Gated by ADMIN_PASSCODE. */
export const listAdminOrders = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ passcode: z.string().min(1), limit: z.number().int().min(1).max(500).optional() }).parse(data),
  )
  .handler(async ({ data }) => {
    const expected = process.env["ADMIN_PASSCODE"];
    if (!expected) throw new Error("Admin dashboard is not configured yet.");
    if (data.passcode !== expected) throw new Error("Incorrect passcode.");
    const { backend } = await import("./db.server");
    return backend.listOrders(data.limit ?? 100);
  });