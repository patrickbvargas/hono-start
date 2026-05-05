## Why

Os skeletons compartilhados de lista e de detalhes não estão alinhados com o shape final da interface. O resultado é um loading state visualmente mais pesado, com bordas que não agregam, e placeholders de detalhes que não respeitam a altura real do conteúdo.

## What Changes

- Remover bordas decorativas do shared list-route skeleton.
- Ajustar o shared list-route skeleton para manter alturas consistentes com header, linhas de tabela e footer/paginação da UI final.
- Ajustar o shared entity-detail skeleton para respeitar as alturas e gaps reais dos grupos de informação, mantendo as larguras atuais.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `list-route-loading`: shared pending skeleton passa a evitar bordas visuais e alinhar melhor o tamanho dos placeholders com layout final.
- `shared-overlay-orchestration`: loading skeleton dentro do detail drawer passa a respeitar alturas e espaçamentos do conteúdo final dos campos.

## Impact

- Shared UI em `src/shared/components/list-route-skeleton.tsx`.
- Shared UI em `src/shared/components/entity-detail.tsx`.
- Testes de contrato dos skeletons compartilhados.
