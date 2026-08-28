/* Farmaville — Care Counter: rastreamento opcional e não bloqueante para entender uso do catálogo e da sacola. */
type AnalyticsValue = string | number | boolean;
type AnalyticsData = Record<string, AnalyticsValue>;
type AnalyticsWindow = Window & { umami?: { track: (eventName: string, data?: AnalyticsData) => void } };

export function trackEvent(eventName: string, data?: AnalyticsData) {
  if (typeof window === "undefined") return;
  try {
    (window as AnalyticsWindow).umami?.track(eventName, data);
  } catch {
    // Analytics não deve interromper nenhuma ação de compra.
  }
}
