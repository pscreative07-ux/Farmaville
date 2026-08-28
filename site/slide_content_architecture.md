# Arquitetura e integrações — Farmaville

## Slide 1 — Capa

**Farmaville Farmácia**

Arquitetura digital, experiência comercial e roteiro de ativação

Subtítulo: Anápolis, GO · Lucas Antônio · CRF-GO 11193

Direção visual: usar logo oficial e foto real do interior da Farmaville em composição de azul-petróleo, verde-mint e coral.

## Slide 2 — Objetivo da plataforma

**Uma farmácia digital com atendimento local e operação responsável.**

A plataforma organiza catálogo, sacola, produtos sujeitos a receita, atendimento por WhatsApp, conta do cliente e informações institucionais. As funções comerciais só são ativadas quando preço, estoque, pagamento e logística estiverem conectados e verificados.

Usar foto da equipe no balcão e quatro blocos: catálogo real, atendimento farmacêutico, entrega/retirada em Anápolis e confirmação operacional.

## Slide 3 — Arquitetura atual

**Camadas conectadas, responsabilidades claras.**

| Camada | Tecnologia / recurso | Papel |
|---|---|---|
| Experiência do cliente | React, TypeScript e interface Farmaville | Catálogo, sacola, desejos, conta e páginas públicas |
| Serviços | Backend tipado e autenticação | Proteção da conta e histórico de pedidos |
| Dados | Banco relacional | Usuários, pedidos e histórico técnico de importação |
| Comércio | Shopify | Fonte de produtos, pedidos e checkout após ativação |
| Operação | INOVAFARMA | Fonte planejada de preço e estoque |

Diagrama recomendado: fluxos da esquerda para a direita, com a Farmaville como camada visível e integrações como camadas de apoio.

## Slide 4 — Jornada de compra segura

**O cliente tem clareza antes de concluir.**

1. Explora o catálogo e acessa a página de produto.
2. Salva desejos, adiciona itens e seleciona entrega ou retirada em Anápolis.
3. Informa cupom e CEP; condições reais são confirmadas na operação.
4. Visualiza a etapa de pagamento preparada para Mercado Pago via Shopify.
5. O pedido só é confirmado quando pagamento, estoque e condições de entrega forem validados.

Usar uma linha coral de orientação e selos mint para cada ponto de confirmação.

## Slide 5 — Integrações configuradas e pendentes

**A arquitetura foi preparada sem expor dados sensíveis.**

| Integração | Estado | Próxima ação |
|---|---|---|
| Shopify | Loja criada, sem catálogo importado | Reivindicar a titularidade e importar os produtos autorizados |
| Mercado Pago | Escolhido para a Shopify | Instalar, vincular conta, configurar meios de pagamento e testar |
| INOVAFARMA | Roteiro e variáveis preparados | Receber documentação, autorização e credenciais para a conexão escolhida |
| GitHub Actions | Workflow publicado | Validar habilidades automaticamente em alterações e pull requests |

## Slide 6 — Segurança, privacidade e responsabilidade

**Sem promessas operacionais fora da realidade.**

O checkout informativo não processa cobranças antes da ativação. A consulta de pedidos é protegida por autenticação. Produtos sujeitos a receita direcionam para avaliação responsável; o envio pelo WhatsApp não é aprovação automática. Segredos permanecem fora do código, dos exemplos e dos logs.

Destacar: Lucas Antônio · CRF-GO 11193, como dado institucional confirmado.

## Slide 7 — Automação e governança de código

**Alterações passam por verificação antes de chegar à produção.**

O repositório contém um workflow que executa a validação de `skill-creator`, `game-dev` e `video-generator` em pushes, pull requests e execuções manuais. Há também um script local que reproduz a checagem estrutural antes do envio.

Mostrar o fluxo: edição → validação local → pull request → GitHub Actions → revisão → publicação.

## Slide 8 — Roteiro de ativação

**Quatro decisões para abrir a operação.**

| Ordem | Decisão | Critério de conclusão |
|---|---|---|
| 1 | Reivindicar Shopify e configurar Mercado Pago | Pagamento de teste aprovado |
| 2 | Definir conexão INOVAFARMA | Dados, autorização e ambiente controlado disponíveis |
| 3 | Importar e revisar catálogo | SKU, preço, estoque e regras de receita conferidos |
| 4 | Conectar domínio oficial e testar ponta a ponta | HTTPS, compra, comunicação e acompanhamento validados |

Fecho: “A Farmaville está tecnicamente preparada; a ativação comercial depende das validações operacionais.”

## Slide 9 — Referências e próximos passos

Incluir os links do repositório Farmaville, guia de segredos, guia Mercado Pago, guia INOVAFARMA, teste local do workflow e roteiro Shopify/domínio.

Mensagem final: “Ativar com segurança, operar com clareza, atender com proximidade.”
