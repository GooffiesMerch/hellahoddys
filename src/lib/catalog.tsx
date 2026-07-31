import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { products as staticProducts, type Product } from "./products";
import { getPrintfulCatalog } from "./catalog.functions";

const CatalogContext = createContext<Product[]>(staticProducts);

/**
 * Merges the local catalog with products synced from Printful so anything
 * published in Printful shows up on the storefront after a catalog sync.
 */
export function CatalogProvider({ children }: { children: ReactNode }) {
  const fetchCatalog = useServerFn(getPrintfulCatalog);

  const { data } = useQuery({
    queryKey: ["printful-catalog"],
    queryFn: () => fetchCatalog({}),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const merged = useMemo(() => {
    if (!data || data.length === 0) return staticProducts;
    const known = new Set(staticProducts.map((p) => p.handle));
    const titles = new Set(staticProducts.map((p) => p.title.trim().toLowerCase()));
    const extras = (data as Product[]).filter(
      (p) =>
        p.images.length > 0 && !known.has(p.handle) && !titles.has(p.title.trim().toLowerCase()),
    );
    return extras.length > 0 ? [...extras, ...staticProducts] : staticProducts;
  }, [data]);

  return <CatalogContext.Provider value={merged}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): Product[] {
  return useContext(CatalogContext);
}

export function useProduct(handle: string): Product | undefined {
  const catalog = useCatalog();
  return catalog.find((p) => p.handle === handle);
}
