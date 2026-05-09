## 1. Dashboard summary contract

- [x] 1.1 Estender o read model do dashboard para expor subtotal mensal e total consolidado da linha de subtotal sem alterar escopo por sessão.
- [x] 1.2 Atualizar testes de `src/features/dashboard/data/queries.ts` para validar subtotais por mês, total do subtotal e comportamento com meses zerados.
- [x] 1.3 Confirmar que nenhuma migração de banco é necessária para a mudança.

## 2. Dashboard remuneration table UI

- [x] 2.1 Atualizar a tabela de remunerações do dashboard para renderizar linha de subtotal mensal usando shared UI existente e sem quebrar empty state.
- [x] 2.2 Ajustar testes de render da tabela para validar headers mensais, subtotal row e ausência do subtotal quando não houver linhas visíveis.

## 3. Verification

- [x] 3.1 Rodar cobertura focada do dashboard para queries e tabela de remunerações.
- [x] 3.2 Rodar `pnpm check`.
- [x] 3.3 Rodar `npx tsc --noEmit`.
