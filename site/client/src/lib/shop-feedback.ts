/* Farmaville — Care Counter: feedback comercial consistente e mensurável, sem interromper o fluxo de compra. */
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

export function notifyProductAdded(productName: string, source: "catalog" | "product" | "quick_view" = "catalog") {
  toast.success("Adicionado à sacola", { description: productName });
  trackEvent("toast_interaction", { type: "product_added", source });
}

export function notifyToastAction(eventName: string, data: Record<string, string | number | boolean> = {}) {
  trackEvent("toast_interaction", { type: eventName, ...data });
}
