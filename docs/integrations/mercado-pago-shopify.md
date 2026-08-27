# Mercado Pago via Shopify

A Farmaville optou por usar o **Mercado Pago pela integração da Shopify**. Nesse modelo, o checkout e a confirmação do pagamento devem permanecer no fluxo da loja; não adicione uma segunda cobrança direta no mesmo pedido. A documentação do Mercado Pago descreve o processo como: criar a conta de vendedor, instalar os aplicativos, vincular a conta, configurar e ativar os meios de pagamento e realizar testes. [1]

| Abordagem | Resultado | Segredos no GitHub | Complexidade |
|---|---|---:|---|
| **Aplicativo Mercado Pago na Shopify** | Pagamento, status e pedidos administrados pela plataforma de loja | Não são necessários para o workflow de habilidades | Menor; é o caminho escolhido para a Farmaville |
| **API direta do Mercado Pago** | Checkout customizado fora da Shopify | `MERCADO_PAGO_ACCESS_TOKEN` no servidor e, quando aplicável, chave pública no cliente | Maior; exige evitar duplicação de cobrança e manter conciliação própria |

## Ativação da abordagem escolhida

Primeiro, reivindique a loja Shopify. Depois, no painel administrativo da Shopify, instale e vincule a solução oficial do Mercado Pago, escolha os meios de pagamento, mantenha o ambiente de teste até confirmar a jornada e só então ative a produção. O Mercado Pago informa que sua documentação para Shopify inclui opções como cartões, Pix e Checkout Pro, de acordo com o país e a configuração da conta. [1]

O repositório não deve armazenar a senha, token de produção, dados de cartão, conta de vendedor ou chaves de webhook. Caso seja criado um serviço próprio de conciliação no futuro, guarde credenciais apenas no ambiente do servidor e use os nomes listados no [guia de segredos](../github-actions-and-secrets.md).

## Decisão para o código

Enquanto a loja não estiver reivindicada e o aplicativo não estiver conectado, mantenha a etapa de checkout apenas como orientação. Não envie dados de pagamento para a API, não declare pagamento aprovado e não gere pedidos fictícios. Depois da ativação, prefira receber o status pelo fluxo oficial da Shopify; qualquer uso de notificações do Mercado Pago deve ser validado com a documentação vigente antes da implementação.

## Referências

[1]: https://www.mercadopago.com.br/developers/en/docs/shopify/overview "Mercado Pago Developers — Shopify overview"
