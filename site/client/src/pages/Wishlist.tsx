/* Farmaville — Care Counter: desejos persistem localmente e retornam à sacola sem fricção. */
import { ArrowLeft, BookHeart, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { catalog } from "@/data/catalog";
import { useShop } from "@/contexts/ShopContext";
import { notifyProductAdded } from "@/lib/shop-feedback";

const formatPrice = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;

function CounterCross() {
  return <span className="counter-cross" aria-hidden="true"><i /><i /><i /><i /></span>;
}

export default function Wishlist() {
  const { wishlist, addToCart, toggleFavorite } = useShop();
  const products = catalog.filter((product) => wishlist.includes(product.code));
  const moveToCart = (code: string, name: string) => { addToCart(code); toggleFavorite(code); notifyProductAdded(name, "product"); };
  return <div className="wishlist-page">
    <header className="product-page-header"><div className="page-header-side"><Link href="/#catalogo" className="back-link"><ArrowLeft size={16} /> Continuar comprando</Link></div><Link href="/" className="product-page-brand"><img src="/manus-storage/logo-oficial_5f581676.png" alt="Farmaville Farmácia" /></Link><Link href="/carrinho" className="product-cart-link">Sacola <ShoppingBag size={18} /></Link></header>
    <main className="wishlist-layout">
      <div className="wishlist-heading"><span className="section-label">lista de desejos</span><h1>Guarde para<br /><em>quando precisar.</em></h1><p>Seus produtos salvos ficam neste dispositivo. Quando fizer sentido, volte para a sacola e escolha entrega ou retirada.</p></div>
      {products.length === 0 ? <div className="wishlist-empty"><CounterCross /><h2>Sua lista de desejos está vazia.</h2><p>Encontre produtos no catálogo e use o coração para salvar sua próxima compra para depois.</p><Link href="/#catalogo" className="button button-dark">Encontrar produtos <ArrowLeft size={16} /></Link></div> : <div className="wishlist-grid">{products.map((product) => <article className="wishlist-item" key={product.code}><span className="catalog-group">{product.group}</span><h2>{product.name}</h2><p>{product.laboratory || "Laboratório não informado"} · código {product.code}</p><strong>{formatPrice(product.price)}</strong><div><button type="button" className="button button-dark" onClick={() => moveToCart(product.code, product.name)}>Adicionar à sacola <ShoppingBag size={16} /></button><button type="button" className="wishlist-remove" onClick={() => { toggleFavorite(product.code); toast("Removido da lista de desejos"); }} aria-label={`Remover ${product.name} da lista de desejos`}><BookHeart size={16} /></button></div></article>)}</div>}
    </main>
  </div>;
}
