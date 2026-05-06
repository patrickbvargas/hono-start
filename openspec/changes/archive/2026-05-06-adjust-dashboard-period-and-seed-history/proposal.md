## Why

O atalho anual do dashboard trata o ano corrente como um intervalo fechado até 31/12, o que expõe meses futuros vazios e polui a leitura da evolução financeira. Além disso, o seed local hoje concentra fixtures financeiras em 2026, o que impede validar comparativos anuais de receita e remuneração sem cadastro manual.

## What Changes

- Ajustar o atalho do ano corrente no dashboard para limitar o período até a data atual.
- Preservar o comportamento de atalho anual completo para anos não correntes.
- Expandir os fixtures financeiros do seed para incluir dados determinísticos de 2025 com fees e remunerações válidas.
- Manter a idempotência do seed e evitar colisão entre contratos de anos diferentes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `dashboard`: o atalho anual corrente passa a representar de `01/01` até hoje, evitando buckets futuros no ano atual.
- `development-seed-fixtures`: o seed passa a incluir fixtures financeiras históricas para 2025, permitindo comparativos anuais no dashboard.

## Impact

- Código afetado em `src/features/dashboard/utils`, `src/features/dashboard/hooks`, `src/features/dashboard/data`, e testes do dashboard.
- Código afetado em `prisma/seed.ts` para geração determinística de fixtures por ano.
- Sem novas dependências e sem migrações de banco.

## Non-goals

- Não mudar a lógica de comparação do dashboard além do recorte do ano corrente.
- Não alterar regras de cálculo de remuneração.
- Não adicionar novos filtros, novos atalhos de período, ou novos modelos de dados.
