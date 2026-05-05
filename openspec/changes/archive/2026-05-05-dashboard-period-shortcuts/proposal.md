## Why

O dashboard ja aceita periodo livre por `dateFrom` e `dateTo`, mas falta um caminho rapido para os recortes mais usados no dia a dia. Hoje o usuario precisa abrir o popover e ajustar datas manualmente ate mesmo para casos padrao como ultimos 6 meses, ultimos 12 meses ou ano atual.

## What Changes

- Add atalhos visuais de periodo ao lado do filtro inline de colaborador no header do dashboard.
- Support os atalhos `6 meses`, `12 meses` e `2026`, com `2026` como estado padrao inicial no ano atual.
- Keep o filtro manual dentro do popover funcionando normalmente para selecao livre de `dateFrom` e `dateTo`.
- Keep URL-driven dashboard search as source of truth so shortcut clicks and manual edits stay shareable/restorable.

## Non-goals

- Nao alterar regras de visibilidade por role, escopo por firma, ou agregacoes do dashboard.
- Nao remover os campos manuais de periodo do popover.
- Nao introduzir presets adicionais alem de `6 meses`, `12 meses` e `2026`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `dashboard`: expand dashboard filter behavior so the header exposes period shortcut buttons while preserving manual period editing and URL-driven restoration.

## Impact

- Affected code: `src/features/dashboard/components/filter/*`, `src/features/dashboard/hooks/use-filter.ts`, `src/features/dashboard/schemas/*`, and `src/routes/_app/index.tsx` if loader defaults need alignment.
- API/data impact: none expected; existing `dateFrom` and `dateTo` search params remain the canonical contract.
- User roles: administrators and regular users gain the same shortcut behavior; only the existing employee inline filter remains admin-only.
- Multi-tenant impact: none beyond current dashboard filtering rules because shortcuts only write validated period params already scoped by session.
