/*
 * Harvest Almanac — shell global do Farmaville.
 * Direção: editorial rural contemporânea, assimetria acolhedora e textura de papel.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Privacy from "./pages/Privacy";
import Wishlist from "./pages/Wishlist";
import Account from "./pages/Account";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Checkout from "./pages/Checkout";
import { ShopProvider } from "./contexts/ShopContext";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/produto/:code"} component={Product} />
      <Route path={"/carrinho"} component={Cart} />
      <Route path={"/desejos"} component={Wishlist} />
      <Route path={"/conta"} component={Account} />
      <Route path={"/sobre"} component={About} />
      <Route path={"/duvidas"} component={FAQ} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/privacidade"} component={Privacy} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <ShopProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ShopProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
