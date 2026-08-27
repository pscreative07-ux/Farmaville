# GitHub Actions, variáveis e segredos

O workflow [`validate-skills.yml`](../.github/workflows/validate-skills.yml) valida apenas a estrutura das habilidades. Ele **não precisa de credenciais** e não executa pagamentos, importações ou sincronização de estoque. Essa separação evita que uma alteração de documentação tenha acesso desnecessário a dados operacionais.

## Onde configurar

No repositório, abra **Settings → Secrets and variables → Actions**. Use a aba **Secrets** para valores privados e a aba **Variables** para valores públicos de configuração. O GitHub permite criar segredos no escopo do repositório ou de um ambiente de implantação; segredos ausentes são resolvidos como valor vazio, portanto a aplicação deve interromper com mensagem clara quando um segredo obrigatório faltar. [1]

| Nome | Tipo recomendado | Quando será necessário | Nunca usar no workflow de validação |
|---|---|---|---|
| `SHOPIFY_STORE_DOMAIN` | Variable | Sincronização autorizada com a loja | Sim |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Secret | Importação ou reconciliação pelo backend | Sim |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Secret | Leitura autenticada pelo storefront, se aplicável | Sim |
| `MERCADO_PAGO_ACCESS_TOKEN` | Secret | Somente uma integração direta de servidor, se escolhida | Sim |
| `MERCADO_PAGO_PUBLIC_KEY` | Variable | Somente checkout direto no navegador, se escolhido | Sim |
| `INOVAFARMA_API_BASE_URL` | Variable | Quando a API for disponibilizada pelo fornecedor | Sim |
| `INOVAFARMA_API_TOKEN` | Secret | Quando a API exigir autenticação e o acesso for autorizado | Sim |

> **Regra principal:** nunca grave valores reais em arquivos `.env`, `README`, exemplos, commits ou logs. O arquivo [`examples/.env.example`](../examples/.env.example) contém apenas nomes e valores fictícios.

## Como o workflow deve usar um segredo

Somente um workflow operacional, protegido por ambiente e com permissões mínimas, deve receber segredos. Passe o valor ao processo por `env`, sem interpolá-lo no comando nem registrá-lo na saída. O GitHub recomenda evitar argumentos de linha de comando para segredos e alerta que segredos não são automaticamente encaminhados a workflows reutilizáveis ou a eventos de forks. [1]

```yaml
jobs:
  sync:
    environment: production
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
      - name: Executar sincronização autorizada
        env:
          INOVAFARMA_API_TOKEN: ${{ secrets.INOVAFARMA_API_TOKEN }}
          INOVAFARMA_API_BASE_URL: ${{ vars.INOVAFARMA_API_BASE_URL }}
        run: node scripts/sync-inovafarma.mjs
```

Esse exemplo é um **molde**, não um agendamento pronto. A sincronização só deve ser criada depois que o fornecedor confirmar os campos, a autenticação, a frequência e a autorização operacional.

## Recomendação de ambientes

Crie os ambientes `staging` e `production`. Mantenha testes e validações sem segredos; use aprovação manual para `production` quando houver importação de preço, estoque ou pedidos. A proteção por ambiente diminui o risco de disparar uma integração comercial por um pull request comum.

## Referências

[1]: https://docs.github.com/actions/security-guides/using-secrets-in-github-actions "GitHub Docs — Using secrets in GitHub Actions"
