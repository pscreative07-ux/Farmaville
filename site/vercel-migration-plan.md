# Plano de migração Farmaville — Vercel + Supabase

## Escopo aprovado

A Farmaville será preparada para uma migração completa para a Vercel, usando um projeto Supabase dedicado para autenticação, PostgreSQL e armazenamento. A implantação deve preservar a experiência pública, a conta do cliente, pedidos protegidos e a preparação para Shopify, Mercado Pago e INOVAFARMA.

## Estado do trabalho

- Cliente Supabase criado em `client/src/lib/supabase.ts`, usando somente `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Login Supabase é preferido quando as variáveis existem; o fluxo Manus permanece como fallback no preview local.
- O contexto tRPC aceita token Bearer Supabase e normaliza o usuário para a tabela existente, sem remover a autenticação legada.
- A função `api/trpc/[...trpc].ts` e `vercel.json` preparam o roteamento serverless.
- Build, tipagem e testes locais passaram: 9 testes aprovados e 1 teste de catálogo vazio ignorado de forma intencional enquanto a importação ERP não foi ativada.
- Preview Vercel criado e página pública respondeu HTTP 200.
- A função tRPC ainda requer as variáveis no projeto Vercel e nova validação de runtime; o primeiro teste sem essas variáveis retornou `FUNCTION_INVOCATION_FAILED`.

## Variáveis necessárias na Vercel

### Cliente e autenticação

- `VITE_SUPABASE_URL` — URL pública do projeto Supabase.
- `VITE_SUPABASE_PUBLISHABLE_KEY` — chave publicável do projeto Supabase.
- `SUPABASE_URL` — URL usada pelas funções server-side; pode ter o mesmo valor.
- `SUPABASE_PUBLISHABLE_KEY` — chave publicável usada para validar sessões no backend.

Não versionar valores de ambiente. A chave publicável pode aparecer no bundle do navegador por definição, mas tokens de servidor, conexão de banco, Mercado Pago e INOVAFARMA devem permanecer somente em ambientes protegidos.

## Dependências de ativação

- Habilitar Google OAuth ou outro provedor no Supabase Auth e cadastrar a URL de callback da Vercel.
- Criar tabelas e políticas RLS no Supabase antes de migrar dados reais.
- Reavaliar a tabela legada de usuários antes de produção; a estrutura atual ainda utiliza Drizzle/MySQL para pedidos locais.
- Conectar o repositório ao projeto Vercel com `site` como root directory quando o código estiver no monorepo público.
- Adicionar as variáveis de cliente em Preview e Production no painel Vercel e gerar um novo deployment.
- Configurar o domínio oficial no Vercel e adicionar os registros DNS solicitados pelo painel.

## Integrações comerciais

- Mercado Pago: manter a decisão de usar o aplicativo Mercado Pago pela Shopify. Não colocar `MERCADO_PAGO_ACCESS_TOKEN` no frontend nem no GitHub Actions. Uma integração direta de servidor só deve ser criada se o fluxo Shopify não atender ao checkout.
- INOVAFARMA: não configurar token ou endpoint sem autorização e documentação do fornecedor. O desenho prevê API ou importação controlada de arquivo, com validação de SKU, preço, estoque, receita e histórico.
- Receita: manter o fluxo responsável via WhatsApp e status de análise até existir um processo técnico aprovado para armazenamento privado e acesso restrito.

## Referências oficiais consultadas

- Vercel — Vite: https://vercel.com/docs/frameworks/frontend/vite
- Vercel — Variáveis de ambiente: https://vercel.com/docs/environment-variables
- Vercel — Supabase Marketplace: https://vercel.com/marketplace/supabase
- Vercel — Blob: https://vercel.com/docs/vercel-blob
- Supabase — Auth: https://supabase.com/docs/guides/auth
- Supabase — Storage: https://supabase.com/docs/guides/storage
- GitHub — Secrets em Actions: https://docs.github.com/actions/security-guides/using-secrets-in-github-actions
- Shopify — Domínio próprio: https://help.shopify.com/en/manual/domains/add-a-domain/connecting-domains
- Mercado Pago — Shopify: https://www.mercadopago.com.br/developers/en/docs/shopify/overview
- INOVAFARMA — Integrações: https://conhecimento.atlassian.net/wiki/spaces/BDC/pages/18907864/Integra+es
