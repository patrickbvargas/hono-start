## Why

As rotas principais de lista usam loaders com `ensureQueryData`, mas hoje a primeira navegação deixa a tela sem estrutura visível até a resposta chegar. Isso quebra a continuidade visual da aplicação e contraria o padrão esperado de estados de loading explícitos para listas operacionais.

## What Changes

- Adicionar um fallback visual compartilhado para rotas de lista durante o carregamento inicial do loader.
- Manter a estrutura comum da UI visível durante o loading: topo da página, área de filtros, tabela e paginação.
- Aplicar o fallback nas rotas principais de listas operacionais que usam o padrão canônico de header com filtro e body com tabela.

## Capabilities

### New Capabilities
- `list-route-loading`: define o comportamento visual de carregamento inicial para rotas de lista baseadas em loader.

### Modified Capabilities

## Impact

- Código afetado: `src/routes/_app/*`, `src/shared/components/*`.
- APIs e persistência: sem mudanças.
- Dependências: sem novas dependências.
- Papéis afetados: todos os usuários autenticados que acessam listas operacionais.
- Multi-tenant: sem impacto em isolamento ou autorização.

## Non-goals

- Não redesenhar filtros, tabela ou paginação.
- Não alterar loading incremental após a rota já estar montada.
- Não introduzir skeletons específicos por entidade nesta mudança.
