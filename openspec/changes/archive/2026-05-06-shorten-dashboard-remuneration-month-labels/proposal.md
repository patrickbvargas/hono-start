## Why

Os labels mensais da tabela de remunerações usam ano com quatro dígitos, enquanto o gráfico de evolução financeira usa ano curto. Essa diferença cria ruído visual desnecessário em duas superfícies que representam os mesmos buckets mensais.

## What Changes

- Ajustar os labels das colunas mensais da tabela de remunerações para usar formato abreviado de ano, como `Jan/26`.
- Manter os buckets mensais, ordenação, totais e restante do comportamento do dashboard inalterados.

## Capabilities

### New Capabilities

- `<name>`: None.

### Modified Capabilities

- `dashboard`: A tabela mensal de remunerações passa a exibir labels de mês com ano abreviado, alinhados ao padrão visual curto usado pelo chart de evolução.

## Impact

- Código afetado: `src/features/dashboard/data/queries.ts` e testes focados do dashboard.
- Sem mudanças de cálculo, queries, permissões, APIs ou banco de dados.
