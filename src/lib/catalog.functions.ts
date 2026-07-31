import { createServerFn } from "@tanstack/react-start";

/** Products synced from Printful, in the storefront Product shape. */
export const getPrintfulCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { loadPrintfulCatalog } = await import("./printful-catalog.server");
  return loadPrintfulCatalog();
});
