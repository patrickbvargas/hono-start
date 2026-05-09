## Why

Alguns formulários de edição abrem sem os valores já salvos aparentarem estar preenchidos, mesmo quando o registro possui dados válidos. O problema aparece com maior frequência quando a leitura de detalhe chega depois da abertura do modal ou quando o registro aponta para uma opção hoje inativa, o que torna a edição pouco confiável e induz o usuário a sobrescrever dados sem perceber.

## What Changes

- Alinhar a hidratação de overlays de edição ao padrão suspense-first para que formulários não renderizem campos com defaults de criação antes do detalhe persistido.
- Preservar no formulário de edição as seleções já persistidas de entidades de negócio hoje inativas ou indisponíveis, exibindo-as como opções desabilitadas em vez de deixar o autocomplete visualmente vazio.
- Aplicar a correção primeiro aos fluxos afetados de contratos e honorários, mantendo o boundary de hooks e queries consistente com o contrato do repositório.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `feature-data-hooks`: os hooks de hidratação de edição passam a usar leitura suspense-first para evitar render inicial com defaults vazios.
- `contract-management`: o formulário de edição de contratos preserva cliente e colaboradores já vinculados mesmo quando essas entidades não são mais selecionáveis para novos vínculos.
- `fee-management`: o formulário de edição de honorários preserva contrato e receita já vinculados mesmo quando esses pais não são mais selecionáveis para novos lançamentos.

## Impact

- Affected code: `src/features/clients`, `src/features/employees`, `src/features/contracts`, `src/features/fees`, `src/shared/components/form`.
- Affected behavior: modal edit hydration, autocomplete rendering for persisted inactive selections, query option composition for edit forms.
- Dependencies: no new runtime dependency; existing TanStack Query and shared form/autocomplete layers remain in use.

## Non-goals

- Não alterar regras de negócio de criação para permitir novas seleções de registros inativos.
- Não redesenhar o padrão de overlays, forms ou boundaries além do necessário para remover o bug.
- Não mudar semântica de filtros/listagens fora dos formulários de edição afetados.
