# INOVAFARMA: estrutura para integração futura

O INOVAFARMA informa que integrações podem ocorrer por **API** ou por **Views** de banco de dados e que dependem da autorização dos envolvidos via Portal PS. A documentação pública cita vendas online entre os tipos de integração previstos. [1]

| Abordagem | Resultado | Requisitos | Complexidade |
|---|---|---|---|
| **API autorizada** | Sincronização controlada de preço, estoque e catálogo | Documentação do fornecedor, endpoint, escopo e credencial autorizada | Média/alta |
| **Views autorizadas** | Leitura de dados da base conforme o acesso liberado | Acesso de rede seguro, modelo de dados e autorização | Alta; não exponha banco na internet |
| **Arquivo exportado** | Importação assistida com validação de SKU | Arquivo do ERP e rotina definida pela Farmaville | Menor; não é em tempo real |

## Contrato mínimo a confirmar

Antes de escrever uma integração, solicite ao suporte do INOVAFARMA a documentação da versão instalada e confirme quais dados podem ser expostos. O mapeamento deve prever, no mínimo, identificador/SKU, nome, preço, saldo de estoque, disponibilidade e data de atualização. Campos de produto sujeito a receita devem manter apenas a classificação comercial necessária ao site; não coloque dados de pacientes, receitas, históricos clínicos ou credenciais no repositório.

## Fluxo recomendado

Prepare a conexão inicialmente em modo desativado. Com a autorização do Portal PS, teste em ambiente controlado, valide SKUs duplicados e diferenças de estoque, registre somente metadados técnicos da importação e, por fim, habilite a atualização operacional. Não use o workflow de validação de habilidades para executar sincronização de estoque: a rotina deve rodar no backend autorizado, com logs protegidos, limites de repetição e uma forma de interromper a integração.

O arquivo [`examples/integration-config.example.json`](../../examples/integration-config.example.json) ilustra o estado desativado sem endereços, usuários ou tokens reais.

## Referências

[1]: https://conhecimento.atlassian.net/wiki/spaces/BDC/pages/18907864/Integra+es "INOVAFARMA — Integrações"
