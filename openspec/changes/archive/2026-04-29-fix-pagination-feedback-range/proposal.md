## Why

O feedback textual da paginação compartilhada usa apenas a quantidade de registros da página atual, então o valor permanece igual em páginas cheias consecutivas e transmite uma informação enganosa. Precisamos tornar esse resumo reativo ao índice da página para que o usuário saiba qual faixa do conjunto total está vendo.

## What Changes

- Ajustar o resumo textual da paginação compartilhada para mostrar a faixa exibida na página atual em vez de apenas a contagem da página.
- Preservar a paginação orientada por URL e o seletor de tamanho de página existentes.
- Garantir comportamento consistente para listas paginadas que reutilizam o componente compartilhado.

## Capabilities

### New Capabilities
- `shared-pagination-feedback`: Define o resumo textual compartilhado para listas paginadas baseadas em URL.

### Modified Capabilities

## Impact

- Affected code: `src/shared/components/pagination.tsx`, `src/shared/hooks/use-pagination.ts` somente se necessário para suportar o resumo, e possíveis testes de contratos compartilhados.
- APIs/systems: nenhuma API externa; muda apenas o feedback visual compartilhado das listas paginadas.
- User impact: usuários passam a ver uma faixa reativa como `Exibindo 26-50 de 100 registros` ao navegar entre páginas.
