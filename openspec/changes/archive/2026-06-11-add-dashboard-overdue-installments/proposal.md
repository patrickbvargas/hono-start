## Why

O dashboard já resume receitas, remunerações e fluxo de caixa, mas ainda não mostra receitas parceladas que já deveriam ter honorários lançados e continuam com parcelas vencidas sem pagamento registrado. Essa lacuna mantém a conferência de inadimplência fora do sistema e força validação manual.

## What Changes

- Add uma nova superfície analítica no dashboard para listar parcelas vencidas com possível inadimplência.
- Calcular parcelas esperadas com base em `paymentStartDate`, `totalInstallments` e meses completos decorridos.
- Expor no dashboard quais números de parcelas vencidas continuam sem honorário ativo registrado.
- Respeitar o escopo atual do dashboard: administrador vê a firma, demais usuários veem apenas contratos permitidos pelo próprio escopo.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `dashboard`: expandir o dashboard para identificar e listar parcelas vencidas sem honorário ativo registrado, com regra auditável por número de parcela e respeito ao escopo de visibilidade existente.

## Impact

- Affected spec: `openspec/specs/dashboard/spec.md`
- Affected code: `src/features/dashboard/*` and dashboard route consumption on `src/routes/_app/index.tsx`
- No new dependencies
- No database migration
