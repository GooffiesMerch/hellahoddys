import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface CartItem {
  handle: string;
  title: string;
  image?: string;
  price: number;
  variantSku?: string;
  variantLabel?: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  updateQty: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "hh_cart_v1";

// The variant label has to be part of the identity: roughly a third of the
// catalog's variants carry no SKU, so keying on handle+SKU alone collapsed
// every size of those products into a single line (adding S, M and L produced
// "S x 3" and shipped three smalls).
const keyOf = (i: Pick<CartItem, "handle" | "variantSku" | "variantLabel">) =>
  `${i.handle}::${i.variantSku ?? ""}::${i.variantLabel ?? ""}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) {
        setItems(
          parsed.filter(
            (p): p is CartItem =>
              !!p &&
              typeof p === "object" &&
              typeof (p as CartItem).handle === "string" &&
              typeof (p as CartItem).price === "number" &&
              typeof (p as CartItem).quantity === "number",
          ),
        );
      }
    } catch {
      // A corrupt or foreign value in localStorage should not break the store.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Private-mode / quota failures are non-fatal; the cart stays in memory.
    }
  }, [items, hydrated]);

  const addItem: CartContextValue["addItem"] = (item, qty = 1) => {
    setItems((prev) => {
      const k = keyOf(item);
      const existing = prev.find((p) => keyOf(p) === k);
      if (existing) {
        return prev.map((p) =>
          keyOf(p) === k ? { ...p, quantity: p.quantity + qty } : p,
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const updateQty: CartContextValue["updateQty"] = (key, qty) => {
    setItems((prev) =>
      prev
        .map((p) => (keyOf(p) === key ? { ...p, quantity: Math.max(0, qty) } : p))
        .filter((p) => p.quantity > 0),
    );
  };

  const removeItem: CartContextValue["removeItem"] = (key) => {
    setItems((prev) => prev.filter((p) => keyOf(p) !== key));
  };

  const clear = () => setItems([]);

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, subtotal, addItem, updateQty, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export const cartItemKey = keyOf;