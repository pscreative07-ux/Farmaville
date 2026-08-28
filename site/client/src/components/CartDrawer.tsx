/* Farmaville — Care Counter: drawer de sacola com foco contido, retorno ao disparador e ações claras. */
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookHeart, Minus, Plus, Save, ShoppingBag, Trash2, X } from "lucide-react";
import { Link } from "wouter";
import { useShop } from "@/contexts/ShopContext";
import ClearCartDialog from "@/components/ClearCartDialog";
import { toast } from "sonner";

type CartDrawerProps = { open: boolean; onClose: () => void };
const formatPrice = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const drawerRef = useRef<HTMLElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const { cartLines, cartCount, subtotal, updateQuantity, removeFromCart, moveToWishlist, saveCart, savedCartAt } = useShop();
  const [removingCode, setRemovingCode] = useState<string | null>(null);
  const removeWithAnimation = (code: string) => { setRemovingCode(code); window.setTimeout(() => { removeFromCart(code); setRemovingCode(null); }, 220); };
  const moveToWishlistWithAnimation = (code: string) => { setRemovingCode(code); window.setTimeout(() => { moveToWishlist(code); setRemovingCode(null); }, 220); };

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => drawerRef.current?.querySelector<HTMLElement>("[data-cart-close]")?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onCloseRef.current(); return; }
      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])"));
      if (!focusable.length) { event.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.setTimeout(() => returnFocusRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;
  return <div className="cart-drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
    <aside ref={drawerRef} className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
      <div className="cart-drawer-header"><div><span className="section-label">sacola farmaville</span><h2 id="cart-drawer-title">Seu pedido <span>({cartCount})</span></h2></div><button type="button" data-cart-close className="cart-drawer-close" onClick={onClose} aria-label="Fechar sacola"><X size={19} /></button></div>
      {cartLines.length === 0 ? <div className="cart-drawer-empty"><ShoppingBag size={28} /><strong>Sua sacola está vazia.</strong><span>Adicione produtos do catálogo para começar.</span><button type="button" className="button button-dark" onClick={onClose}>Explorar catálogo <ArrowRight size={16} /></button></div> : <>
        <div className="cart-drawer-lines">{cartLines.map(({ product, quantity }) => <article className={removingCode === product.code ? "cart-drawer-line is-removing" : "cart-drawer-line"} key={product.code}><div><span className="catalog-group">{product.group}</span><strong>{product.name}</strong><small>{formatPrice(product.price)} · código {product.code}</small></div><div className="cart-drawer-line-tools"><div className="line-quantity"><button type="button" onClick={() => quantity === 1 ? removeWithAnimation(product.code) : updateQuantity(product.code, quantity - 1)} aria-label={`Diminuir ${product.name}`}><Minus size={13} /></button><span>{quantity}</span><button type="button" onClick={() => updateQuantity(product.code, quantity + 1)} aria-label={`Aumentar ${product.name}`}><Plus size={13} /></button></div><button type="button" className="wishlist-line" onClick={() => moveToWishlistWithAnimation(product.code)} aria-label={`Mover ${product.name} para a lista de desejos`}><BookHeart size={14} /></button><button type="button" className="remove-line" onClick={() => removeWithAnimation(product.code)} aria-label={`Remover ${product.name}`}><Trash2 size={14} /></button></div></article>)}</div>
        <div className="cart-drawer-summary"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><button type="button" className="save-cart-action drawer-save-cart" onClick={() => { saveCart(); toast.success("Sacola salva", { description: "Você pode continuar depois neste dispositivo." }); }}><Save size={14} /> {savedCartAt ? "Sacola salva" : "Salvar sacola"}</button><ClearCartDialog className="cart-drawer-clear" /><Link href="/carrinho" className="button button-dark cart-drawer-checkout" onClick={onClose}>Ir para a sacola completa <ArrowRight size={16} /></Link><p className="cart-drawer-note">Entrega, retirada e frete são calculados na sacola completa.</p>
      </>}
    </aside>
  </div>;
}
