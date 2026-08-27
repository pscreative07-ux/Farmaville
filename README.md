# Farmaville Skills

Este repositório reúne habilidades reutilizáveis organizadas para apoiar a criação, validação e evolução de experiências digitais.

| Habilidade | Finalidade |
|---|---|
| [`skill-creator`](./skills/skill-creator/) | Estruturar, documentar e validar novas habilidades reutilizáveis. |
| [`game-dev`](./skills/game-dev/) | Planejar, construir e verificar jogos para navegador. |
| [`video-generator`](./skills/video-generator/) | Orientar a criação de entregas em vídeo a partir de briefs e referências. |

## Organização

Cada habilidade tem um arquivo `SKILL.md` como ponto de entrada. Arquivos de referência, modelos e scripts ficam na própria pasta da habilidade, para que o contexto de uso permaneça próximo ao material necessário.

## Uso responsável

Revise os requisitos de cada habilidade antes de aplicá-la a um projeto. Não inclua chaves, senhas, dados pessoais, registros clínicos ou dados de produção em exemplos, scripts ou referências públicas.

## Licenças e atribuições

As licenças e avisos presentes nas pastas das habilidades foram preservados. Em especial, os materiais derivados do projeto Godogen permanecem acompanhados das respectivas atribuições e licença.

## Automação e integrações

O repositório contém um [workflow de validação](./.github/workflows/validate-skills.yml) para executar a checagem estrutural das três habilidades em alterações e pull requests. Os guias de [segredos e variáveis](./docs/github-actions-and-secrets.md), [Mercado Pago pela Shopify](./docs/integrations/mercado-pago-shopify.md) e [INOVAFARMA](./docs/integrations/inovafarma.md) deixam as integrações preparadas sem armazenar credenciais reais.
