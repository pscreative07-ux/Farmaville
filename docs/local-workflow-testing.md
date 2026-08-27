# Testar o workflow antes do GitHub Actions

O workflow de validação usa Python, instala `PyYAML` e executa o validador de estrutura contra cada pasta de habilidade. Para verificar o mesmo contrato antes de abrir um pull request, use o script local do repositório.

```bash
git clone https://github.com/pscreative07-ux/Farmaville.git
cd Farmaville
chmod +x scripts/validate-skills-local.sh
./scripts/validate-skills-local.sh
```

O script interrompe na primeira habilidade inválida e aponta o problema de frontmatter ou de estrutura. Se o Python não encontrar `PyYAML`, instale a dependência no seu ambiente local com `python3 -m pip install pyyaml` e execute novamente.

| O que validar | Comando | Resultado esperado |
|---|---|---|
| As três habilidades | `./scripts/validate-skills-local.sh` | Mensagem “Skill is valid!” para cada pasta |
| Uma habilidade específica | `python3 skills/skill-creator/scripts/quick_validate.py "$PWD/skills/game-dev"` | Validação sem erro |
| Alterações não rastreadas | `git status --short` | Revisar antes de criar o commit |
| Espaços ou conflitos de diff | `git diff --check` | Nenhuma saída e código de retorno zero |

Para simular o ambiente completo de execução, é possível usar uma ferramenta local compatível com GitHub Actions. Para este workflow específico, porém, o script local já cobre os mesmos comandos de validação e não necessita de Docker, segredos ou conexão a fornecedores externos.

O GitHub recomenda guardar credenciais em *Secrets* e não em arquivos de projeto. A validação de habilidades foi desenhada para permanecer sem credenciais, inclusive em pull requests. [1]

## Referências

[1]: https://docs.github.com/actions/security-guides/using-secrets-in-github-actions "GitHub Docs — Using secrets in GitHub Actions"
