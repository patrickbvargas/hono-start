## Why

Dashboard quase pronto, mas ainda tem atrito visual e de uso no fluxo principal. Scroll atual corta bordas dos cards, seletor de colaborador fica escondido dentro do popover para admin, e alguns rótulos repetem informação sem ganho de leitura.

## What Changes

- Ajustar conteúdo do dashboard para rolar dentro de uma `ScrollArea` compartilhada, preservando bordas e espaçamento dos cards durante scroll.
- Promover filtro de colaborador para área inline do cabeçalho do dashboard, ao lado do trigger de filtros avançados, mantendo estado URL-driven existente.
- Simplificar legenda textual dos breakdowns de receita para mostrar apenas percentual.
- Remover tag visual "Visão da firma" do topo do dashboard.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `dashboard`: refina layout rolável, hierarquia visual do cabeçalho e apresentação dos breakdowns sem alterar regras de escopo ou filtros suportados.

## Impact

- Affected code: `src/features/dashboard/components/*`, dashboard component tests, and delta specs for dashboard behavior.
- APIs: none.
- Dependencies: none.

## Non-goals

- Não altera agregações, regras de permissão, payload do dashboard, nem semântica dos filtros existentes.
- Não introduz novo padrão compartilhado de filtro fora do dashboard.
