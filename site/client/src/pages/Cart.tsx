/* Farmaville — Care Counter: carrinho transparente, com fulfillment explícito e frete tratado como estimativa até integrar um provedor real. */
import { useState, type FormEvent } from "react";
import { ArrowLeft, BadgeCheck, BookHeart, Check, CircleAlert, Minus, Plus, Save, ShoppingBag, Store, Trash2, Truck } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useShop } from "@/contexts/ShopContext";
import { commerceConfig } from "@/lib/commerce-config";
import ClearCartDialog from "@/components/ClearCartDialog";

const formatPrice = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;

function CounterCross() {
  return <span className="counter-cross" aria-hidden="true"><i /><i /><i /><i /></span>;
}

export default function Cart() {
  const { cartLines, cartCount, subtotal, discountTotal, freeShippingThreshold, remainingForFreeShipping, fulfillment, setFulfillment, cep, setCep, shipping, calculateShipping, updateQuantity, removeFromCart, moveToWishlist, saveCart, savedCartAt } = useShop();
  const [removingCode, setRemovingCode] = useState<string | null>(null);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const totalBeforeShipping = Math.max(0, subtotal - discountTotal);
  const total = totalBeforeShipping + (shipping?.price || 0);
  const freeShippingProgress = freeShippingThreshold && remainingForFreeShipping !== null ? Math.min(100, Math.round(((freeShippingThreshold - remainingForFreeShipping) / freeShippingThreshold) * 100)) : 0;
  const removeWithAnimation = (code: string) => { setRemovingCode(code); window.setTimeout(() => { removeFromCart(code); setRemovingCode(null); }, 220); };
  const moveToWishlistWithAnimation = (code: string) => { setRemovingCode(code); window.setTimeout(() => { moveToWishlist(code); setRemovingCode(null); }, 220); };
  const submitShipping = (event: FormEvent) => {
    event.preventDefault();
    if (!calculateShipping()) toast.error("Confira o CEP", { description: "Digite um CEP válido com 8 números." });
    else toast.success(fulfillment === "pickup" ? "Retirada selecionada" : "Entrega selecionada", { description: fulfillment === "pickup" ? "A disponibilidade será confirmada pela loja." : "A cobertura, taxa e prazo em Anápolis serão confirmados pela Farmaville." });
  };

  return <div className="cart-page">
    <header className="product-page-header">
      <div className="page-header-side"><Link href="/#catalogo" className="back-link"><ArrowLeft size={16} /> Continuar comprando</Link></div>
      <Link href="/" className="product-page-brand"><img src="/manus-storage/logo-oficial_5f581676.png" alt="Farmaville Farmácia" /></Link>
      <Link href="/desejos" className="product-cart-link">Desejos <BookHeart size={18} /></Link>
    </header>
    <main className="cart-layout">
      <div className="cart-main">
        <div className="cart-title-row">
          <div><span className="section-label">sacola farmaville</span><h1>Seu cuidado,<br /><em>mais perto.</em></h1></div>
          {cartLines.length > 0 && <div className="cart-actions"><button type="button" className="save-cart-action" onClick={() => { saveCart(); setSavedFeedback(true); toast.success("Sacola salva", { description: "Você pode continuar depois neste dispositivo." }); }}><Save size={14} /> {savedFeedback ? "Sacola salva" : "Salvar sacola"}</button><ClearCartDialog className="clear-cart" /></div>}
        </div>
        {cartLines.length === 0 ? <div className="cart-empty"><CounterCross /><h2>Sua sacola está vazia.</h2><p>Encontre seus produtos no catálogo, calcule a entrega pelo CEP ou selecione retirada para organizar sua próxima visita.</p><Link href="/#catalogo" className="button button-dark">Encontrar produtos <ArrowLeft size={16} /></Link></div> : <div className="cart-lines">{cartLines.map(({ product, quantity }) => <article className={removingCode === product.code ? "cart-line is-removing" : "cart-line"} key={product.code}><div className="cart-line-main"><span className="catalog-group">{product.group}</span><h2>{product.name}</h2><p>{product.laboratory || "Laboratório não informado"} · código {product.code}</p></div><div className="cart-line-actions"><strong>{formatPrice(product.price * quantity)}</strong><div className="line-quantity"><button type="button" onClick={() => quantity === 1 ? removeWithAnimation(product.code) : updateQuantity(product.code, quantity - 1)}><Minus size={14} /></button><span>{quantity}</span><button type="button" onClick={() => updateQuantity(product.code, quantity + 1)}><Plus size={14} /></button></div><button type="button" className="wishlist-line" onClick={() => moveToWishlistWithAnimation(product.code)} aria-label={`Mover ${product.name} para a lista de desejos`}><BookHeart size={15} /></button><button type="button" className="remove-line" onClick={() => removeWithAnimation(product.code)} aria-label={`Remover ${product.name}`}><Trash2 size={15} /></button></div></article>)}</div>}
      </div>
      <aside className="cart-summary">
        <span className="section-label">resumo do pedido</span>
        <div className="counter-reassurance"><span><Truck size={15} /> Entrega em Anápolis</span><span><Store size={15} /> Retirada na loja</span><span><BadgeCheck size={15} /> Confirmação antes de concluir</span></div>
        {freeShippingThreshold && remainingForFreeShipping !== null ? <div className="free-shipping-progress" aria-live="polite"><div className="free-shipping-copy"><Truck size={16} /><span>{remainingForFreeShipping === 0 ? "Você garantiu frete grátis." : `Faltam ${formatPrice(remainingForFreeShipping)} para frete grátis.`}</span></div><div className="free-shipping-track"><span style={{ width: `${freeShippingProgress}%` }} /></div></div> : <div className="commerce-status-card"><CircleAlert size={16} /><span><strong>Política de frete em ativação</strong>Frete gratuito, taxa e prazo serão exibidos quando as regras locais estiverem configuradas.</span></div>}
        <div className="summary-row"><span>Subtotal ({cartCount} item(ns))</span><strong>{formatPrice(subtotal)}</strong></div>
        <div className="summary-row"><span>Descontos aplicados</span><strong className="summary-discount">{discountTotal > 0 ? `−${formatPrice(discountTotal)}` : "R$ 0,00"}</strong></div>
        <div className="summary-row"><span>{shipping ? shipping.label : fulfillment === "pickup" ? "Retirada em Anápolis" : "Entrega em Anápolis"}</span><strong>{shipping?.price === 0 ? "Grátis" : shipping?.price ? formatPrice(shipping.price) : "A confirmar"}</strong></div>
        <div className="fulfillment-toggle"><button type="button" className={fulfillment === "delivery" ? "is-active" : ""} onClick={() => setFulfillment("delivery")}><Truck size={17} /><span><strong>Entrega em Anápolis</strong>Área, taxa e prazo a confirmar</span>{fulfillment === "delivery" && <Check size={15} />}</button><button type="button" className={fulfillment === "pickup" ? "is-active" : ""} onClick={() => setFulfillment("pickup")}><Store size={17} /><span><strong>Retirada na loja</strong>Disponibilidade a confirmar</span>{fulfillment === "pickup" && <Check size={15} />}</button></div>
        <form className="shipping-form" onSubmit={submitShipping}>{fulfillment === "delivery" ? <><label htmlFor="cep">Informe seu CEP em Anápolis</label><div><input id="cep" inputMode="numeric" value={cep} onChange={(event) => setCep(event.target.value)} placeholder="00000-000" /><button type="submit">Confirmar CEP</button></div></> : <><label>Retirada na loja</label><p className="pickup-note">A equipe confirmará disponibilidade e o melhor horário para retirada.</p><button type="submit" className="pickup-confirm">Selecionar retirada</button></>}</form>
        {shipping && <div className="shipping-result"><span>{shipping.label}</span><strong>{shipping.price === null ? "A confirmar" : shipping.price === 0 ? "Grátis" : formatPrice(shipping.price)}</strong></div>}
        <div className="summary-total"><span>Total dos produtos</span><strong>{formatPrice(total)}</strong></div>
        {discountTotal === 0 && <p className="discount-note">Cupons e condições promocionais serão aplicados no checkout quando a loja estiver ativa.</p>}
        {savedCartAt && <p className="saved-cart-note"><Check size={14} /> Sacola salva neste dispositivo.</p>}
        <Link href="/checkout" className="button button-dark checkout-button">Revisar etapa de pagamento <ArrowLeft size={16} /></Link>
        <p className="summary-note">Mercado Pago via Shopify: configuração aguardando a reivindicação da loja. O valor final e a disponibilidade serão confirmados antes da conclusão.</p>
      </aside>
    </main>
  </div>;
}
