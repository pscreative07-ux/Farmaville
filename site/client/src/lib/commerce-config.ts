/* Farmaville — configuração explícita de operação. Atualize somente após regras e integrações confirmadas. */
export const commerceConfig = {
  serviceArea: "Anápolis, GO",
  fulfillment: {
    delivery: { enabled: false, label: "Entrega em Anápolis", note: "Área atendida, taxa e prazo serão confirmados pela Farmaville." },
    pickup: { enabled: true, label: "Retirada na loja", note: "Disponibilidade e horário de retirada serão confirmados pela equipe." },
  },
  freeShipping: { enabled: false, threshold: null as number | null },
  payment: { provider: "Mercado Pago", platform: "Shopify", enabled: false },
  erp: { provider: "INOVAFARMA", connected: false },
  catalog: { importedToStore: false },
} as const;
