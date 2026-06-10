## 1. Dashboard summary contract

- [x] 1.1 Estender o read model do dashboard para expor saldo total, série mensal de saldo e linhas mensais de fluxo de caixa sem alterar escopo por sessão.
- [x] 1.2 Implementar agregações de `entrada`, `remuneração`, `despesa`, `saída` e `saldo`, incluindo quebra de entradas por `Administrativo`, `Judicial` e `Sucumbência`.
- [x] 1.3 Atualizar testes de `src/features/dashboard/data/queries.ts` para validar agregação mensal, meses zerados, coerência aritmética e visibilidade admin-only.
- [x] 1.4 Confirmar que nenhuma migração de banco é necessária para a mudança.

## 2. Dashboard cash-flow UI

- [x] 2.1 Adicionar superfície visual dedicada para o card de saldo total respeitando o padrão atual de shared UI do dashboard.
- [x] 2.2 Implementar gráfico mensal de fluxo de caixa com buckets por mês e empty state em pt-BR.
- [x] 2.3 Implementar tabela mensal de fluxo de caixa com colunas de entrada por tipo, `Entrada`, `Remuneração`, `Despesa`, `Saída` e `Saldo`.
- [x] 2.4 Garantir que as superfícies de fluxo de caixa apareçam apenas para administradores sem quebrar o layout atual do dashboard para usuários regulares.

## 3. Canonical docs update

- [x] 3.1 Atualizar o capability `dashboard` e os docs canônicos em `docs/domain/` para registrar o novo dado read-only de fluxo de caixa e sua regra de visibilidade.
- [x] 3.2 Revisar textos pt-BR de labels e descrições para manter terminologia consistente entre dashboard, despesas e honorários.

## 4. Verification

- [x] 4.1 Adicionar cobertura focada para os novos componentes visuais de fluxo de caixa e seus empty states.
- [x] 4.2 Rodar `pnpm check`.
- [x] 4.3 Rodar `npx tsc --noEmit`.
