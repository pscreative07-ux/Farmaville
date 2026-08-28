/* Farmaville — Care Counter: PDP objetiva, confiável e transparente sobre produto, receita e disponibilidade. */
import { useState } from "react";
import { ArrowLeft, BadgeCheck, Heart, Minus, Plus, ShieldCheck, ShoppingBag, Store, Truck } from "lucide-react";
import { Link, useRoute } from "wouter";
import { toast } from "sonner";
import { catalog } from "@/data/catalog";
import { useShop } from "@/contexts/ShopContext";
import CartDrawer from "@/components/CartDrawer";
import { notifyProductAdded } from "@/lib/shop-feedback";

const realImages = {
  dermo: "/manus-storage/bebe-dermocosmeticos_e73a509b.jpg",
  medications: "/manus-storage/medicamentos_fd5e222f.jpg",
  store: "/manus-storage/interior-farmaville_77195e99.jpg",
};

function productImage(group: string) {
  const normalized = group.toLowerCase();
  if (normalized.includes("fralda") || normalized.includes("perfum") || normalized.includes("beb")) return realImages.dermo;
  if (normalized.includes("medic") || normalized.includes("gener") || normalized.includes("etico")) return realImages.medications;
  return realImages.store;
}

function productTypeLabel(type: string) {
  if (type === "generic") return "Genérico";
  if (type === "reference") return "Referência";
  if (type === "similar") return "Similar";
  return "Tipo não informado";
}

export default function Product() {
  const [, params] = useRoute("/produto/:code");
  const product = catalog.find((item) => item.code === params?.code);
  const { addToCart, cartCount, favorites, toggleFavorite } = useShop();
  const [quantity, setQuantity] = useState(1);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  if (!product) {
    return <main className="not-found-page"><span className="section-label">catálogo farmaville</span><h1>Produto não encontrado.</h1><p>Confira o código informado ou volte para o catálogo completo.</p><Link href="/#catalogo" className="button button-dark">Voltar ao catálogo <ArrowLeft size={16} /></Link></main>;
  }

  const isFavorite = favorites.includes(product.code);
  const prescriptionLabel = product.prescriptionStatus === "required" ? "Receita necessária" : product.prescriptionStatus === "not_required" ? "Receita não necessária" : "Verificar necessidade de receita";
  const prescriptionTone = product.prescriptionStatus === "verify" ? "is-warning" : "";

  return <div className="product-page"><header className="product-page-header"><div className="page-header-side"><Link href="/#catalogo" className="back-link"><ArrowLeft size={16} /> Voltar ao catálogo</Link></div><Link href="/" className="product-page-brand"><img src="/manus-storage/logo-oficial_5f581676.png" alt="Farmaville Farmácia" /></Link><button type="button" className="product-cart-link" onClick={() => setCartDrawerOpen(true)} aria-haspopup="dialog"><ShoppingBag size={18} /> Sacola {cartCount > 0 && <b>{cartCount}</b>}</button></header><main className="product-detail"><div className="product-detail-media"><span className="product-detail-label">{product.group}</span><img src={productImage(product.group)} alt={`Ambiente Farmaville relacionado a ${product.name}`} /></div><div className="product-detail-copy"><span className="section-label">detalhe do produto</span><div className="product-status-row"><span className="product-type-badge"><BadgeCheck size={14} /> {productTypeLabel(product.productType)}</span><button type="button" className={isFavorite ? "favorite-button is-active" : "favorite-button"} onClick={() => { toggleFavorite(product.code); toast(isFavorite ? "Removido dos favoritos" : "Salvo nos favoritos"); }} aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}><Heart size={18} fill={isFavorite ? "currentColor" : "none"} /></button></div><h1>{product.name}</h1><p className="product-laboratory">{product.laboratory || "Laboratório não informado"} · código {product.code}</p><div className="product-detail-price"><strong>R$ {product.price.toFixed(2).replace(".", ",")}</strong><span>{product.stock > 0 ? `${product.stock} unidades disponíveis no catálogo` : "Disponibilidade a confirmar"}</span></div><div className={`prescription-note ${prescriptionTone}`}><ShieldCheck size={19} /><div><strong>{prescriptionLabel}</strong><span>A confirmação depende da regra do produto e da análise da farmácia.</span></div></div><div className="product-fulfillment"><div><Truck size={18} /><span><strong>Entrega</strong>Calcule o prazo no carrinho</span></div><div><Store size={18} /><span><strong>Retirada na loja</strong>Consulte disponibilidade</span></div></div><div className="product-buy-row"><div className="product-quantity"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={15} /></button><span>{quantity}</span><button type="button" onClick={() => setQuantity((value) => Math.min(Math.max(product.stock, 1), value + 1))}><Plus size={15} /></button></div><button className="button button-dark product-add-button" type="button" onClick={() => { addToCart(product.code, quantity); notifyProductAdded(product.name, "product"); }}>Adicionar à sacola <ShoppingBag size={17} /></button></div><p className="product-disclaimer">As informações de receita e disponibilidade devem ser confirmadas antes da compra. Este site não substitui orientação de um profissional de saúde.</p></div></main><CartDrawer open={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} /></div>;
}

