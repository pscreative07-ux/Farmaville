/* Farmaville — Care Counter: estado comercial compartilhado, com ações claras e sem promessas operacionais não configuradas. */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { catalog, type PharmacyProduct } from "@/data/catalog";
import { trackEvent } from "@/lib/analytics";
import { commerceConfig } from "@/lib/commerce-config";

export type Fulfillment = "delivery" | "pickup";
export type ShippingEstimate = { price: number | null; label: string };
export type CartLine = { product: PharmacyProduct; quantity: number };

type ShopContextValue = {
  cartLines: CartLine[];
  cartCount: number;
  subtotal: number;
  coupon: string;
  couponStatus: "idle" | "format_invalid" | "ready";
  couponMessage: string;
  applyCoupon: (value: string) => void;
  favorites: string[];
  fulfillment: Fulfillment;
  cep: string;
  shipping: ShippingEstimate | null;
  addToCart: (code: string, quantity?: number) => void;
  updateQuantity: (code: string, quantity: number) => void;
  removeFromCart: (code: string) => void;
  toggleFavorite: (code: string) => void;
  setFulfillment: (value: Fulfillment) => void;
  setCep: (value: string) => void;
  calculateShipping: () => boolean;
  clearCart: () => void;
  wishlist: string[];
  moveToWishlist: (code: string) => void;
  saveCart: () => void;
  savedCartAt: string | null;
  discountTotal: number;
  freeShippingThreshold: number | null;
  remainingForFreeShipping: number | null;
};

const ShopContext = createContext<ShopContextValue | null>(null);
const storageKey = "farmaville-shop-state";
const savedCartKey = "farmaville-saved-cart";

function readState() {
  if (typeof window === "undefined") return { favorites: [] as string[], cart: [] as { code: string; quantity: number }[], coupon: "", savedCartAt: null as string | null };
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) || "{}");
    return { favorites: Array.isArray(saved.favorites) ? saved.favorites : [], cart: Array.isArray(saved.cart) ? saved.cart : [], coupon: typeof saved.coupon === "string" ? saved.coupon : "", savedCartAt: typeof saved.savedCartAt === "string" ? saved.savedCartAt : null };
  } catch {
    return { favorites: [] as string[], cart: [] as { code: string; quantity: number }[], coupon: "", savedCartAt: null as string | null };
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const initial = readState();
  const [favorites, setFavorites] = useState<string[]>(initial.favorites);
  const [cartLines, setCartLines] = useState<CartLine[]>(() => initial.cart.map((line: { code: string; quantity: number }) => {
    const product = catalog.find((item) => item.code === line.code);
    return product ? { product, quantity: Math.max(1, line.quantity) } : null;
  }).filter(Boolean) as CartLine[]);
  const [fulfillment, setFulfillment] = useState<Fulfillment>("delivery");
  const [cep, setCep] = useState("");
  const [shipping, setShipping] = useState<ShippingEstimate | null>(null);
  const [coupon, setCoupon] = useState(initial.coupon);
  const [savedCartAt, setSavedCartAt] = useState<string | null>(() => initial.savedCartAt);
  const discountTotal = 0;
  const freeShippingThreshold = commerceConfig.freeShipping.threshold;

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify({ favorites, cart: cartLines.map(({ product, quantity }) => ({ code: product.code, quantity })), coupon, savedCartAt }));
  }, [favorites, cartLines, coupon, savedCartAt]);

  const cartCount = useMemo(() => cartLines.reduce((total, line) => total + line.quantity, 0), [cartLines]);
  const subtotal = useMemo(() => cartLines.reduce((total, line) => total + line.product.price * line.quantity, 0), [cartLines]);
  const remainingForFreeShipping = freeShippingThreshold === null ? null : Math.max(0, freeShippingThreshold - Math.max(0, subtotal - discountTotal));
  const couponStatus = !coupon ? "idle" : coupon.length < 4 ? "format_invalid" : "ready";
  const couponMessage = couponStatus === "idle" ? "Digite um código promocional." : couponStatus === "format_invalid" ? "Use pelo menos 4 caracteres." : "Cupom salvo para validação no checkout.";
  const applyCoupon = (value: string) => {
    const normalized = value.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 24);
    setCoupon(normalized);
    trackEvent("coupon_input", { has_code: Boolean(normalized), valid_format: normalized.length >= 4 });
  };

  const addToCart = (code: string, quantity = 1) => {
    const product = catalog.find((item) => item.code === code);
    if (!product) return;
    trackEvent("cart_add", { product_code: product.code, product_name: product.name, quantity });
    setCartLines((current) => {
      const existing = current.find((line) => line.product.code === code);
      if (existing) return current.map((line) => line.product.code === code ? { ...line, quantity: line.quantity + quantity } : line);
      return [...current, { product, quantity }];
    });
  };

  const updateQuantity = (code: string, quantity: number) => {
    if (quantity <= 0) {
      setCartLines((current) => current.filter((line) => line.product.code !== code));
      return;
    }
    setCartLines((current) => current.map((line) => line.product.code === code ? { ...line, quantity } : line));
  };

  const removeFromCart = (code: string) => {
    trackEvent("cart_remove", { product_code: code });
    setCartLines((current) => current.filter((line) => line.product.code !== code));
  };
  const toggleFavorite = (code: string) => setFavorites((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code]);
  const wishlist = favorites;
  const moveToWishlist = (code: string) => {
    const product = catalog.find((item) => item.code === code);
    if (!product) return;
    setFavorites((current) => current.includes(code) ? current : [...current, code]);
    removeFromCart(code);
    trackEvent("cart_move_to_wishlist", { product_code: code, product_name: product.name });
  };
  const saveCart = () => {
    const timestamp = new Date().toISOString();
    window.localStorage.setItem(savedCartKey, JSON.stringify({ savedAt: timestamp, cart: cartLines.map(({ product, quantity }) => ({ code: product.code, quantity })) }));
    setSavedCartAt(timestamp);
    trackEvent("cart_save", { item_count: cartCount });
  };

  const calculateShipping = () => {
    const normalized = cep.replace(/\D/g, "");
    if (fulfillment === "pickup") {
      setShipping({ price: null, label: "Retirada em Anápolis · confirmação necessária" });
      return true;
    }
    if (normalized.length !== 8) return false;
    setShipping({ price: null, label: "Entrega em Anápolis · taxa e prazo a confirmar" });
    return true;
  };

  return <ShopContext.Provider value={{ cartLines, cartCount, subtotal, coupon, couponStatus, couponMessage, applyCoupon, favorites, wishlist, fulfillment, cep, shipping, savedCartAt, discountTotal, freeShippingThreshold, remainingForFreeShipping, addToCart, updateQuantity, removeFromCart, toggleFavorite, moveToWishlist, saveCart, setFulfillment: (value) => { setFulfillment(value); setShipping(null); }, setCep: (value) => { setCep(value.replace(/\D/g, "").slice(0, 8)); setShipping(null); }, calculateShipping, clearCart: () => { trackEvent("cart_clear", { item_count: cartCount }); setCartLines([]); setShipping(null); } }}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop precisa estar dentro de ShopProvider");
  return context;
}
