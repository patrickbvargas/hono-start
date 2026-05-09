## Why

Tabela mensal de remunerações no dashboard mostra total por colaborador, mas não mostra subtotal consolidado por mês. Isso força leitura manual coluna a coluna e reduz valor analítico de superfície que já resume dados financeiros por período.

## What Changes

- Adicionar linha de subtotal mensal na tabela de remunerações do dashboard.
- Exibir, para cada coluna de mês visível, soma das remunerações dos colaboradores mostrados na tabela.
- Preservar total por colaborador, filtros ativos, buckets mensais e escopo por perfil já existente.
- Manter comportamento consistente para administradores e usuários regulares, sempre respeitando isolamento por firma e visibilidade da sessão.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `dashboard`: tabela mensal de remunerações passa a exibir subtotal por coluna/mês com base no conjunto filtrado e visível na sessão.

## Impact

- Código afetado: `src/features/dashboard/components/remuneration-table/index.tsx`, `src/features/dashboard/data/queries.ts`, `src/features/dashboard/schemas/model.ts` e testes focados de dashboard.
- Sistemas: agregação de resumo do dashboard, renderização da tabela mensal e contrato OpenSpec do capability `dashboard`.
- Roles afetados: administradores e usuários autenticados com visão própria de remunerações.
- Multi-tenant: sem expansão de escopo; subtotais seguem mesmos filtros, mesma firma e mesma visibilidade da sessão.

## Non-goals

- Não alterar critérios de filtro, ordenação ou período do dashboard.
- Não mudar regras de cálculo de remuneração, apenas agregação de apresentação já visível na tabela.
- Não adicionar subtotal em outras tabelas ou gráficos fora da superfície de remunerações do dashboard.
