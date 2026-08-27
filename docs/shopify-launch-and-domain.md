# Colocar a Farmaville no ar com Shopify e domínio oficial

## Escolher o endereço do domínio

A Farmaville já possui uma arquitetura de **loja de catálogo com Shopify no back-office**. Antes de apontar o domínio oficial, escolha qual experiência será pública. Não aponte o mesmo domínio principal para duas plataformas diferentes ao mesmo tempo.

| Opção | Onde o cliente navega | Onde apontar o domínio | Melhor quando |
|---|---|---|---|
| **Site Farmaville atual + Shopify como comércio** | No site Farmaville, com a Shopify no catálogo, carrinho e pedido | Nas configurações de domínio do projeto Farmaville | Você quer preservar o site profissional já criado |
| **Loja nativa da Shopify** | No tema hospedado pela Shopify | Em **Shopify Admin → Settings → Domains** | Você quer substituir o site atual por um tema Shopify |

## Roteiro recomendado para a Farmaville

Como o site Farmaville já está estruturado para usar a Shopify como base comercial, mantenha o domínio oficial no projeto Farmaville e trate a Shopify como a plataforma de produtos, pagamento e pedidos. Antes da divulgação, reivindique a loja nas configurações de integrações do projeto, conecte o Mercado Pago no painel Shopify e confirme que o catálogo autorizado foi importado e revisado.

Em seguida, abra as configurações de domínio do projeto Farmaville e conecte ou compre o domínio oficial. Defina-o como endereço principal somente depois de a página inicial, catálogo, sacola e páginas institucionais estarem conferidos nesse endereço. Mantenha `www` redirecionando para o domínio principal escolhido e valide o certificado HTTPS antes de anunciar a loja.

## Se a opção escolhida for a loja nativa da Shopify

Caso a decisão mude para um tema hospedado diretamente pela Shopify, conecte o domínio no painel Shopify. Para um domínio comprado de outro provedor, a Shopify orienta usar o fluxo **Settings → Domains → Connect existing domain** e, quando a configuração for manual, apontar o registro `A` para `23.227.38.65`, o `AAAA` para `2620:0127:f00f:5::` e o `CNAME` `www` para `shops.myshopify.com.`. A propagação normalmente ocorre em até duas horas, mas pode levar até 48 horas. [1] [2]

O registrador de domínio continua responsável por DNS, renovação e cobrança. Se houver proxy de terceiros ou registros existentes, revise-os antes de alterar DNS; configurações não suportadas podem causar indisponibilidade. [3]

## Checklist de abertura

| Etapa | Evidência de conclusão |
|---|---|
| Reivindicar a loja | Titularidade confirmada na integração da Shopify |
| Configurar Mercado Pago | Conta vinculada, meios de pagamento definidos e teste aprovado |
| Importar o catálogo | SKU, preço, estoque e itens sujeitos a receita revisados |
| Definir entrega e retirada | Área de Anápolis, taxa, prazo e atendimento confirmados |
| Conectar o domínio | HTTPS ativo e redirecionamento principal definido |
| Testar uma compra | Produto, entrega, pagamento, status e comunicação de confirmação revisados |

## Referências

[1]: https://help.shopify.com/en/manual/domains/add-a-domain/connecting-domains/connect-domain-manual "Shopify Help Center — Connect your third-party domain manually"
[2]: https://help.shopify.com/en/manual/domains/add-a-domain/connecting-domains "Shopify Help Center — Connecting a third-party domain"
[3]: https://help.shopify.com/en/manual/domains/add-a-domain/connecting-domains/considerations "Shopify Help Center — Considerations for third-party domains"
