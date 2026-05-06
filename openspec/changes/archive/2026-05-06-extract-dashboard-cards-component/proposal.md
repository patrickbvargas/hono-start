## Why

O componente principal do dashboard ainda mistura responsabilidade de layout com a implementação detalhada dos cards de métricas. Chats e tabelas já vivem em componentes dedicados; alinhar os cards ao mesmo padrão reduz acoplamento e deixa o `Dashboard` focado em compor a tela.

## What Changes

- Extrair a grade de cards de métricas do dashboard para um componente dedicado dentro da feature.
- Manter o conteúdo, formatação, ícones, tooltips e tons visuais dos cards sem alterar comportamento de produto.
- Simplificar o componente `Dashboard` para que ele apenas orquestre scroll e layout geral das superfícies analíticas.

## Capabilities

### New Capabilities

- `dashboard-layout-composition`: Define a composição do dashboard com superfícies analíticas dedicadas, incluindo cards de métricas extraídos para um componente próprio.

### Modified Capabilities

- `dashboard`: O requirement de superfícies analíticas passa a exigir que o componente raiz do dashboard componha superfícies dedicadas em vez de concentrar a implementação dos cards.

## Impact

- Código afetado: `src/features/dashboard/components/dashboard`, novo componente em `src/features/dashboard/components/metric-cards`, e testes focados do dashboard.
- APIs externas, dados, permissões, filtros, queries e dependências permanecem inalterados.
- Sem migração de banco, contrato HTTP ou mudança de comportamento funcional para usuários finais.
