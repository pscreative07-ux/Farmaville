/* Farmaville — Care Counter: storefront profissional com catálogo real, compra assistida e identidade da loja física. */
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { ArrowDownWideNarrow, ArrowRight, ArrowUpRight, Baby, BadgeCheck, Check, Clock3, Cross, Eye, Heart, HeartPulse, Instagram, LoaderCircle, MapPin, Menu, Mic, Minus, PackageCheck, Phone, Plus, Search, ShoppingBag, Sparkles, Stethoscope, Store, Truck, UserRound, X } from "lucide-react";
import { catalog } from "@/data/catalog";
import { useShop } from "@/contexts/ShopContext";
import CartDrawer from "@/components/CartDrawer";
import { notifyProductAdded } from "@/lib/shop-feedback";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";

const logoImage = "/manus-storage/logo-oficial_5f581676.png";
const heroImage = "/manus-storage/interior-farmaville_77195e99.jpg";
const storeImage = "/manus-storage/fachada-interior_832aefad.jpg";
const careImage = "/manus-storage/equipe-balcao_c473e999.png";
const medicationImage = "/manus-storage/medicamentos_fd5e222f.jpg";
const whatsappUrl = "https://wa.me/5562991089398?text=" + encodeURIComponent("Olá, Farmaville! Gostaria de enviar uma receita para avaliação.");
const instagramUrl = "https://instagram.com/farmaville.farmacia";
const mapsUrl = "https://www.google.com/maps/search/?api=1&query=Av.+Goiás,+2641,+Vila+Brasil,+Anápolis,+GO,+75144-355";
const mascotImage = "/manus-storage/mascote-oficial_6cda4003.png";
const catalogScrollKey = "farmaville-catalog-scroll";
const babyImage = "/manus-storage/bebe-dermocosmeticos_e73a509b.jpg";

const categories = [
  { name: "Medicamentos", group: "GENERICO", icon: HeartPulse, tone: "teal" },
  { name: "Vitaminas", group: "VITAMINAS", icon: Sparkles, tone: "mint" },
  { name: "Dermocosméticos", group: "PERFUMARIA", icon: Heart, tone: "coral" },
  { name: "Bebê e criança", group: "LEITES", icon: Baby, tone: "yellow" },
  { name: "Higiene", group: "LIMPEZA", icon: PackageCheck, tone: "blue" },
];

const featuredConfig = [
  { code: "1431901", image: babyImage, tag: "seleção da loja" },
  { code: "833701", image: medicationImage, tag: "" },
  { code: "35435601", image: storeImage, tag: "boa escolha" },
];

const formatPrice = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;
const loadingCards = Array.from({ length: 8 });
type SpeechResultEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type SpeechRecognitionLike = { lang: string; interimResults: boolean; maxAlternatives: number; onresult: ((event: SpeechResultEvent) => void) | null; onerror: ((event: unknown) => void) | null; onend: (() => void) | null; start: () => void; abort: () => void };
type SpeechRecognitionWindow = Window & { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
const typeLabel = (type: string) => type === "generic" ? "Genérico" : type === "reference" ? "Referência" : type === "similar" ? "Similar" : "Tipo a confirmar";

function Logo({ small = false }: { small?: boolean }) {
  return <img className={small ? "brand-logo small" : "brand-logo"} src={logoImage} alt="Farmaville Farmácia" />;
}

export default function Home() {
  // The useAuth hook provides authentication state.
  // To implement login/logout, call logout(), or start login from an event
  // handler: onClick={() => startLogin()} (imported from "@/const"). Never call
  // startLogin() during render (no href={startLogin()}) — it mints a one-time
  // nonce cookie and must run only at the moment of navigation.
  const { user, isAuthenticated } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [catalogSearchInput, setCatalogSearchInput] = useState("");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogGroup, setCatalogGroup] = useState("TODOS");
  const [careFilter, setCareFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("relevance");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [quickViewProduct, setQuickViewProduct] = useState<(typeof catalog)[number] | null>(null);
  const [quickViewAdded, setQuickViewAdded] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const modalRef = useRef<HTMLElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const { cartLines, cartCount, favorites, addToCart, updateQuantity, toggleFavorite } = useShop();
  const [catalogReady, setCatalogReady] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setCatalogReady(true), 320);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(visibleCount > 12 && window.scrollY > 520);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleCount]);

  useEffect(() => {
    const timer = window.setTimeout(() => setCatalogSearch(catalogSearchInput.trim()), 260);
    return () => window.clearTimeout(timer);
  }, [catalogSearchInput]);

  const featuredProducts = useMemo(() => featuredConfig.flatMap((item) => {
    const product = catalog.find((entry) => entry.code === item.code);
    return product ? [{ ...product, image: item.image, tag: item.tag }] : [];
  }), []);

  const catalogGroups = useMemo(() => ["TODOS", ...Array.from(new Set(catalog.map((item) => item.group)))], []);
  const careFilters = [{ value: "all", label: "Todos os temas", terms: "" }, { value: "dor", label: "Dor e febre", terms: "dor febre analgésico" }, { value: "gripe", label: "Gripe e resfriado", terms: "gripe resfriado tosse" }, { value: "alergia", label: "Alergias", terms: "alergia antialérgico" }, { value: "infantil", label: "Cuidados infantis", terms: "bebê infantil fralda leite" }, { value: "vitaminas", label: "Vitaminas", terms: "vitamina suplemento" }];
  const typeFilters = [{ value: "all", label: "Todos os tipos" }, { value: "generic", label: "Genéricos" }, { value: "reference", label: "Referência" }, { value: "similar", label: "Similares" }, { value: "unknown", label: "Tipo não informado" }];
  const catalogResults = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();
    const filtered = catalog.filter((item) => {
      const matchesGroup = catalogGroup === "TODOS" || item.group === catalogGroup;
      const matchesQuery = !query || `${item.code} ${item.name} ${item.laboratory} ${item.group}`.toLowerCase().includes(query);
      const selectedCare = careFilters.find((filter) => filter.value === careFilter);
      const searchableProduct = `${item.name} ${item.laboratory} ${item.group}`.toLowerCase();
      const matchesCare = !selectedCare?.terms || selectedCare.terms.split(" ").some((term) => searchableProduct.includes(term));
      const matchesType = typeFilter === "all" || item.productType === typeFilter;
      const matchesFavorite = !favoritesOnly || favorites.includes(item.code);
      return matchesGroup && matchesQuery && matchesCare && matchesType && matchesFavorite;
    });
    return [...filtered].sort((a, b) => {
      if (sortOrder === "price-asc") return a.price - b.price;
      if (sortOrder === "price-desc") return b.price - a.price;
      if (sortOrder === "name") return a.name.localeCompare(b.name);
      if (sortOrder === "stock") return b.stock - a.stock;
      return (a.abc || "Z").localeCompare(b.abc || "Z") || a.name.localeCompare(b.name);
    });
  }, [catalogGroup, catalogSearch, careFilter, favorites, favoritesOnly, sortOrder, typeFilter]);

  const visibleResults = catalogResults.slice(0, visibleCount);
  const hasMoreResults = visibleCount < catalogResults.length;

  useEffect(() => {
    setVisibleCount(12);
    const savedScroll = window.sessionStorage.getItem(catalogScrollKey);
    if (savedScroll !== null) {
      window.sessionStorage.removeItem(catalogScrollKey);
      window.requestAnimationFrame(() => window.scrollTo({ top: Number(savedScroll), behavior: "auto" }));
    }
  }, [catalogGroup, catalogSearch, careFilter, favoritesOnly, sortOrder, typeFilter]);

  useEffect(() => {
    return () => recognitionRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!quickViewProduct) return;
    lastFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setQuickViewAdded(false);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const modal = modalRef.current;
    const focusTimer = window.setTimeout(() => modal?.querySelector<HTMLElement>("[data-quick-view-close]")?.focus(), 0);
    const handleModalKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setQuickViewProduct(null);
        return;
      }
      if (event.key !== "Tab" || !modal) return;
      const focusable = Array.from(modal.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])"));
      if (!focusable.length) { event.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleModalKeydown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleModalKeydown);
      document.body.style.overflow = previousOverflow;
      window.setTimeout(() => lastFocusedElementRef.current?.focus(), 0);
    };
  }, [quickViewProduct]);

  const startVoiceSearch = () => {
    const speechWindow = window as SpeechRecognitionWindow;
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast("Busca por voz indisponível", { description: "Digite o nome ou SKU para pesquisar." });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() || "";
      if (transcript) {
        setSearch(transcript);
        setCatalogSearchInput(transcript);
        setCatalogSearch(transcript);
        go("catalogo");
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast("Não foi possível ouvir", { description: "Tente novamente ou digite sua busca." });
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const searchSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!search.trim()) { toast("Digite o nome, código ou laboratório"); return; }
    setCatalogSearchInput(search.trim());
    setCatalogSearch(search.trim());
    go("catalogo");
    toast("Catálogo filtrado", { description: `Resultados para “${search.trim()}”` });
  };
  const preserveCatalogScroll = () => {
    if (typeof window !== "undefined") window.sessionStorage.setItem(catalogScrollKey, String(window.scrollY));
  };

  const handleCategory = (group: string, name: string) => {
    preserveCatalogScroll();
    setCatalogGroup(group);
    setCatalogSearchInput("");
    setCatalogSearch("");
    go("catalogo");
    toast(name, { description: "Categoria selecionada no catálogo real." });
  };
  const addProduct = (code: string, name: string, source: "catalog" | "quick_view" = "catalog") => {
    addToCart(code);
    notifyProductAdded(name, source);
  };
  const loadMoreProducts = () => {
    if (isLoadingMore || !hasMoreResults) return;
    setIsLoadingMore(true);
    window.setTimeout(() => {
      setVisibleCount((count) => count + 12);
      setIsLoadingMore(false);
    }, 420);
  };
  const addQuickViewProduct = () => {
    if (!quickViewProduct) return;
    addProduct(quickViewProduct.code, quickViewProduct.name, "quick_view");
    setQuickViewAdded(true);
    window.setTimeout(() => setQuickViewAdded(false), 1800);
  };

  return <div className="pharmacy-app">
    <div className="pharmacy-topbar"><span><Truck size={14} /> Entrega e retirada com confirmação da loja</span><span className="topbar-separator" /><span>Farmacêutico disponível para ajudar</span><a href={whatsappUrl} target="_blank" rel="noreferrer">Fale com a equipe <ArrowUpRight size={13} /></a></div>
    <header className="pharmacy-header">
      <a className="pharmacy-brand" href="#inicio" onClick={() => go("inicio")}><Logo /></a>
      <form className="search-bar" onSubmit={searchSubmit}><Search size={19} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Busque por medicamento, vitamina ou cuidado" aria-label="Buscar produtos" /><button type="button" className={isListening ? "voice-search-button is-listening" : "voice-search-button"} onClick={startVoiceSearch} aria-label={isListening ? "Ouvindo busca por voz" : "Buscar por voz"} aria-pressed={isListening}><Mic size={17} /></button><kbd>⌘ K</kbd></form>
      <div className="header-tools"><button type="button" onClick={() => go("servicos")}><MapPin size={19} /><span>Encontrar loja</span></button>{isAuthenticated ? <Link href="/conta" className="account-header-link"><UserRound size={19} /><span>Minha conta</span></Link> : <button type="button" onClick={startLogin}><UserRound size={19} /><span>Entrar</span></button>}<button className="cart-button" type="button" onClick={() => setCartDrawerOpen(true)} aria-haspopup="dialog"><ShoppingBag size={20} /><span>Sacola</span>{cartCount > 0 && <b>{cartCount}</b>}</button></div>
      <button className="mobile-menu" type="button" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}>{menuOpen ? <X /> : <Menu />}</button>
    </header>
    <nav className={menuOpen ? "category-nav is-open" : "category-nav"} aria-label="Categorias"><div className="category-nav-inner"><a href="#categorias" onClick={() => setMenuOpen(false)}>Categorias <span className="nav-new">novo</span></a><a href="#ofertas" onClick={() => setMenuOpen(false)}>Ofertas do dia</a><a href="#catalogo" onClick={() => setMenuOpen(false)}>Catálogo</a><a href="#servicos" onClick={() => setMenuOpen(false)}>Serviços de saúde</a><a href="#cuidado" onClick={() => setMenuOpen(false)}>Guia de cuidado</a><a href="#programa" onClick={() => setMenuOpen(false)}>Programa Farmaville</a></div></nav>

    <main>
      <section className="pharmacy-hero" id="inicio"><div className="hero-content"><div className="hero-eyebrow"><span className="eyebrow-cross"><Cross size={13} /></span> cuidado de todos os dias</div><h1>Na Farmaville,<br />seu cuidado<br /><em>começa aqui.</em></h1><p>Medicamentos, bem-estar e atendimento próximo — tudo em um só lugar, com a confiança de uma farmácia que conhece a sua rotina.</p><div className="hero-search-note"><Search size={16} /><span>O que você está procurando hoje?</span></div><div className="hero-quick-links"><button type="button" onClick={() => go("ofertas")}>Ver ofertas <ArrowRight size={16} /></button><button type="button" onClick={() => go("categorias")}>Explorar categorias <ArrowRight size={16} /></button></div></div><div className="hero-photo"><img src={heroImage} alt="Interior real da Farmaville com prateleiras de medicamentos e atendimento" /><div className="photo-note"><span className="photo-note-icon"><HeartPulse size={15} /></span><span><strong>Estamos por perto</strong>Entrega e retirada na loja</span></div><div className="hero-badge"><span>cuidado</span><strong>sem<br />complicar</strong></div></div></section>
      <section className="service-ribbon"><div><Truck size={22} /><span><strong>Entrega local</strong>Condições confirmadas no pedido</span></div><div><Stethoscope size={22} /><span><strong>Orientação farmacêutica</strong>Conte com quem entende</span></div><div><Clock3 size={22} /><span><strong>Retire na loja</strong>Disponibilidade a confirmar</span></div></section>
      <section className="categories-section" id="categorias"><div className="section-intro"><div><span className="section-label">encontre seu cuidado</span><h2>Como podemos<br /><em>ajudar hoje?</em></h2></div><p>Escolha uma categoria para encontrar o que precisa. O catálogo usa os dados de produtos enviados pela Farmaville.</p></div><div className="category-grid">{categories.map(({ name, group, icon: Icon, tone }) => <button type="button" className={`category-card ${tone}`} key={name} onClick={() => handleCategory(group, name)}><span className="category-icon"><Icon size={24} /></span><strong>{name}</strong><ArrowUpRight size={17} /></button>)}</div></section>

      <section className="catalog-section" id="catalogo"><div className="catalog-header"><div><span className="section-label">catálogo farmaville</span><h2>Encontre o que<br /><em>você precisa.</em></h2><p>{catalog.length.toLocaleString("pt-BR")} itens organizados a partir do catálogo da loja. Consulte disponibilidade, preço e categoria. Os temas de busca são apenas um ponto de partida e não substituem orientação profissional.</p></div><div className="catalog-controls"><div className="catalog-search"><Search size={16} /><input value={catalogSearchInput} onChange={(event) => { preserveCatalogScroll(); setCatalogSearchInput(event.target.value); }} placeholder="Buscar por nome, código ou laboratório" aria-label="Buscar no catálogo" /></div><div className="catalog-toolbar"><label className="filter-control"><span>Tema</span><select value={careFilter} onChange={(event) => { preserveCatalogScroll(); setCareFilter(event.target.value); }} aria-label="Filtrar por tema de cuidado">{careFilters.map((filter) => <option value={filter.value} key={filter.value}>{filter.label}</option>)}</select></label><label className="filter-control"><span>Tipo</span><select value={typeFilter} onChange={(event) => { preserveCatalogScroll(); setTypeFilter(event.target.value); }} aria-label="Filtrar por tipo de medicamento">{typeFilters.map((filter) => <option value={filter.value} key={filter.value}>{filter.label}</option>)}</select></label><label className="sort-control"><ArrowDownWideNarrow size={15} /><span>Ordenar</span><select value={sortOrder} onChange={(event) => { preserveCatalogScroll(); setSortOrder(event.target.value); }} aria-label="Ordenar produtos"><option value="relevance">Relevância</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option><option value="name">Nome</option><option value="stock">Disponibilidade</option></select></label><button type="button" className={favoritesOnly ? "favorites-filter is-active" : "favorites-filter"} onClick={() => { preserveCatalogScroll(); setFavoritesOnly((value) => !value); }}><Heart size={14} fill={favoritesOnly ? "currentColor" : "none"} /> Favoritos {favorites.length > 0 && `(${favorites.length})`}</button></div><div className="catalog-filters" role="tablist" aria-label="Filtrar catálogo">{catalogGroups.slice(0, 7).map((group) => <button type="button" role="tab" aria-selected={catalogGroup === group} className={catalogGroup === group ? "is-active" : ""} key={group} onClick={() => { preserveCatalogScroll(); setCatalogGroup(group); }}>{group === "TODOS" ? "Todos" : group.toLowerCase()}</button>)}</div></div></div><div className="catalog-result-meta"><span>{catalogSearch || catalogGroup !== "TODOS" || careFilter !== "all" || typeFilter !== "all" || favoritesOnly ? `${catalogResults.length} itens nesta seleção` : "Seleção de produtos do catálogo"}</span><span>Ordenação: {sortOrder === "price-asc" ? "menor preço" : sortOrder === "price-desc" ? "maior preço" : sortOrder === "name" ? "nome" : sortOrder === "stock" ? "disponibilidade" : "relevância"}</span></div>{catalogReady ? <div className="catalog-grid">{visibleResults.map((item) => <article className="catalog-item" key={item.code}><Link href={`/produto/${item.code}`} className="catalog-item-link"><div><span className="catalog-group">{item.group}</span><h3>{item.name}</h3><p>{item.laboratory || "Laboratório não informado"} · código {item.code}</p></div><div className="catalog-item-bottom"><strong>{formatPrice(item.price)}</strong><span>{item.stock > 0 ? `${item.stock} em estoque` : "Consulte disponibilidade"}</span></div></Link><div className="catalog-item-actions"><span className="catalog-type"><BadgeCheck size={12} /> {typeLabel(item.productType)}</span><button type="button" className={favorites.includes(item.code) ? "catalog-favorite is-active" : "catalog-favorite"} onClick={() => { toggleFavorite(item.code); toast(favorites.includes(item.code) ? "Removido dos favoritos" : "Salvo nos favoritos"); }} aria-label={favorites.includes(item.code) ? `Remover ${item.name} dos favoritos` : `Favoritar ${item.name}`}><Heart size={15} fill={favorites.includes(item.code) ? "currentColor" : "none"} /></button><button type="button" className="quick-view-button" onClick={() => setQuickViewProduct(item)} aria-label={`Visualização rápida de ${item.name}`}><Eye size={15} /></button><button type="button" className="catalog-add" onClick={() => addProduct(item.code, item.name)} aria-label={`Adicionar ${item.name} à sacola`}><Plus size={15} /></button></div></article>)}</div> : <div className="catalog-grid catalog-loading" aria-busy="true" aria-live="polite"><div className="catalog-loading-mascot"><img src={mascotImage} alt="Mascote oficial da Farmaville preparando o catálogo" /><span>Preparando seu catálogo...</span></div>{loadingCards.map((_, index) => <div className="catalog-skeleton" key={`loading-${index}`}><span /><span /><span /><span /></div>)}</div>}{catalogReady && hasMoreResults && <div className="catalog-load-more"><button type="button" className="button button-dark" onClick={loadMoreProducts} disabled={isLoadingMore} aria-busy={isLoadingMore}>{isLoadingMore ? <><LoaderCircle className="loading-icon" size={16} /> Carregando produtos...</> : <>Carregar mais produtos <ArrowDownWideNarrow size={16} /></>}</button><span>Mostrando {visibleResults.length} de {catalogResults.length}</span></div>}{catalogReady && catalogResults.length === 0 && <div className="catalog-empty mascot-empty"><img src={mascotImage} alt="Mascote oficial da Farmaville procurando o produto" /><div><strong>Não encontramos esse produto.</strong><span>Tente outro nome, SKU ou categoria. Se precisar, fale com a equipe Farmaville.</span></div></div>}</section>

      <section className="offers-section" id="ofertas"><div className="offers-heading"><div><span className="section-label">seleção farmaville</span><h2>Cuidados que<br /><em>valem a pena.</em></h2></div><div className="offers-promise"><PackageCheck size={16} /><span><strong>Compra simples</strong>Entrega ou retirada na loja</span></div><button className="outline-link" type="button" onClick={() => go("catalogo")}>Ver catálogo completo <ArrowRight size={16} /></button></div><div className="products-grid">{featuredProducts.map((product) => { const quantity = cartLines.find((line) => line.product.code === product.code)?.quantity || 0; return <article className="product-card" key={product.code}><div className={`product-image ${product.group.toLowerCase()}`}><img src={product.image} alt={`Produtos da categoria ${product.group.toLowerCase()} na Farmaville`} />{product.tag && <span className="product-tag">{product.tag}</span>}<span className="product-vertical-mark" aria-hidden="true" /><button className="quick-add" type="button" onClick={() => addProduct(product.code, product.name)} aria-label={`Adicionar ${product.name}`}><Plus size={19} /></button></div><div className="product-info"><span>{product.group} · {product.laboratory || "Farmaville"}</span><Link href={`/produto/${product.code}`}><h3>{product.name}</h3></Link><div className="product-price"><strong>{formatPrice(product.price)}</strong></div>{quantity ? <div className="quantity-control"><button type="button" onClick={() => updateQuantity(product.code, quantity - 1)}><Minus size={14} /></button><span>{quantity} na sacola</span><button type="button" onClick={() => addProduct(product.code, product.name)}><Plus size={14} /></button></div> : <button className="add-product" type="button" onClick={() => addProduct(product.code, product.name)}>Adicionar à sacola <ArrowRight size={15} /></button>}</div></article>; })}</div></section>
      <section className="care-section" id="cuidado"><div className="care-image"><img src={careImage} alt="Profissional da Farmaville atendendo no balcão da farmácia" /><span>cuidado que<br /><strong>chega até você</strong></span></div><div className="care-copy"><span className="section-label">mais que uma farmácia</span><h2>Orientação para<br />cuidar da sua<br /><em>rotina de verdade.</em></h2><p>Por isso, a Farmaville está aqui para facilitar sua rotina: encontre, adicione à sacola, retire na loja ou fale com um farmacêutico.</p><button className="button button-dark" type="button" onClick={() => go("servicos")}>Conhecer nosso jeito <ArrowUpRight size={17} /></button></div></section>
      <section className="mascot-section" id="assistente"><div className="mascot-visual"><img src={mascotImage} alt="Mascote oficial da Farmaville, farmacêutico infantil com jaleco branco e detalhes turquesa" /></div><div className="mascot-copy"><span className="section-label">assistente farmaville</span><h2>Uma ajudinha<br /><em>para encontrar.</em></h2><p>Use a busca e os filtros para explorar o catálogo. Se precisar de uma orientação sobre o atendimento, fale com a equipe Farmaville pelo WhatsApp.</p><div className="mascot-actions"><a href={whatsappUrl} target="_blank" rel="noreferrer" className="button button-dark">Falar com a equipe <ArrowUpRight size={17} /></a><button type="button" className="outline-link" onClick={() => go("catalogo")}>Explorar o catálogo <ArrowRight size={16} /></button></div></div></section><section className="services-section" id="servicos"><div className="services-heading"><span className="section-label">serviços de saúde</span><h2>Conte com a gente<br /><em>em cada etapa.</em></h2></div><div className="services-list"><button type="button" onClick={() => toast("Serviço de orientação farmacêutica em breve.")}><span>01</span><Stethoscope size={22} /><strong>Fale com um farmacêutico</strong><ArrowUpRight size={17} /></button><button type="button" onClick={() => toast("Localizador de lojas em breve.")}><span>02</span><MapPin size={22} /><strong>Encontre uma Farmaville</strong><ArrowUpRight size={17} /></button><button type="button" onClick={() => toast("O programa de benefícios será lançado em breve.")}><span>03</span><Sparkles size={22} /><strong>Conheça nossos benefícios</strong><ArrowUpRight size={17} /></button></div></section>
      <section className="contact-section" id="contato"><div className="contact-heading"><span className="section-label">fale com a farmaville</span><h2>Estamos aqui<br /><em>para ajudar.</em></h2><p>Atendimento próximo para sua rotina, na loja e pelo celular.</p></div><div className="contact-details"><a href={whatsappUrl} target="_blank" rel="noreferrer"><span className="contact-detail-icon"><Phone size={18} /></span><span><small>WhatsApp para receitas</small><strong>(62) 99108-9398</strong></span><ArrowUpRight size={16} /></a><a href={mapsUrl} target="_blank" rel="noreferrer"><span className="contact-detail-icon"><MapPin size={18} /></span><span><small>Visite nossa loja</small><strong>Av. Goiás, 2641 · Vila Brasil</strong><small>Anápolis — GO · 75144-355</small></span><ArrowUpRight size={16} /></a><a href={instagramUrl} target="_blank" rel="noreferrer"><span className="contact-detail-icon"><Instagram size={18} /></span><span><small>Instagram oficial</small><strong>@farmaville.farmacia</strong></span><ArrowUpRight size={16} /></a><div className="contact-hours"><small>Horário de atendimento</small><strong>Seg–sex · 8h às 19h</strong><span>Sábado · 8h às 13h · Domingo fechado</span></div></div></section><section className="newsletter-section" id="programa"><div><span className="section-label">fica por dentro</span><h2>Informação também<br /><em>é cuidado.</em></h2></div><div><p>Receba novidades, dicas de bem-estar e ofertas selecionadas no seu e-mail.</p><form onSubmit={(event) => { event.preventDefault(); toast.success("Cadastro recebido", { description: "Obrigado por ficar por perto." }); }}><input type="email" required placeholder="seu melhor e-mail" aria-label="Seu melhor e-mail" /><button type="submit" aria-label="Cadastrar e-mail"><ArrowRight size={18} /></button></form><small>Você pode sair quando quiser. Sem excesso de mensagens.</small></div></section>
    </main>
    {quickViewProduct && <div className="quick-view-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setQuickViewProduct(null); }}><section ref={modalRef} className="quick-view-modal" role="dialog" aria-modal="true" aria-labelledby="quick-view-title"><button type="button" data-quick-view-close className="quick-view-close" onClick={() => setQuickViewProduct(null)} aria-label="Fechar visualização rápida"><X size={18} /></button><div className="quick-view-media"><img src={medicationImage} alt={`Imagem de apoio para ${quickViewProduct.name}`} /></div><div className="quick-view-copy"><span className="section-label">visualização rápida</span><span className="catalog-group">{quickViewProduct.group}</span><h2 id="quick-view-title">{quickViewProduct.name}</h2><p>{quickViewProduct.laboratory || "Laboratório não informado"} · código {quickViewProduct.code}</p><div className="quick-view-price"><strong>{formatPrice(quickViewProduct.price)}</strong><span>{quickViewProduct.stock > 0 ? `${quickViewProduct.stock} em estoque` : "Disponibilidade a confirmar"}</span></div><div className="quick-view-badges"><span><BadgeCheck size={13} /> {typeLabel(quickViewProduct.productType)}</span><span><BadgeCheck size={13} /> {quickViewProduct.prescriptionStatus === "required" ? "Receita necessária" : quickViewProduct.prescriptionStatus === "not_required" ? "Receita não necessária" : "Verificar receita"}</span></div><button type="button" className={quickViewAdded ? "button button-dark quick-view-add is-success" : "button button-dark quick-view-add"} onClick={addQuickViewProduct} aria-live="polite">{quickViewAdded ? <><Check size={16} /> Produto adicionado</> : <>Adicionar à sacola <ShoppingBag size={16} /></>}</button><Link className="quick-view-details" href={`/produto/${quickViewProduct.code}`} onClick={() => setQuickViewProduct(null)}>Ver detalhes completos <ArrowRight size={15} /></Link></div></section></div>}
    <CartDrawer open={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    {showBackToTop && <button type="button" className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Voltar ao topo"><ArrowUpRight size={17} /><span>Voltar ao topo</span></button>}
    <a className="whatsapp-float" href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Enviar receita pelo WhatsApp"><Phone size={19} /><span>Enviar receita</span></a><footer className="pharmacy-footer"><div className="footer-brand"><Logo small /></div><p>Um jeito mais próximo de cuidar.</p><nav className="footer-nav"><Link href="/sobre">Sobre</Link><Link href="/duvidas">Dúvidas</Link><Link href="/privacidade">Privacidade</Link><Link href="/conta">Conta</Link><Link href="/carrinho">Sacola ({cartCount})</Link></nav></footer>
  </div>;

}
