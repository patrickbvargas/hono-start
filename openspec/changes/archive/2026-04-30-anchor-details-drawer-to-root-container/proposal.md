## Why

Os drawers de detalhes hoje abrem a partir da lateral do `body`, o que ignora o container central da aplicação e faz a animação parecer deslocada do layout principal. Isso precisa ser corrigido agora para alinhar o comportamento visual do overlay com o shell autenticado já documentado.

## What Changes

- Ancorar o drawer de detalhes ao container raiz da aplicação em vez do viewport global.
- Ajustar overlay e painel do drawer para ocupar os limites do container raiz.
- Preservar o padrão atual de overlays compartilhados sem introduzir novos componentes ou uma nova API de rota.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `shared-overlay-orchestration`: detail drawers must open from the edge of the root app container while preserving list context behind the overlay.

## Impact

- Affected code: `src/routes/__root.tsx`, `src/shared/components/ui/drawer.tsx`, `src/shared/components/entity-detail.tsx`.
- No API, database, or dependency changes.
- Affects all entity detail drawers that use the shared overlay pattern.
