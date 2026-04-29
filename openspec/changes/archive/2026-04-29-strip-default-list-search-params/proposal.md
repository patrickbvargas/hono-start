## Why

As rotas com filtros, ordenação e paginação hoje restauram estado corretamente, mas a URL tende a carregar parâmetros redundantes mesmo quando o usuário está apenas no estado default da tela. Isso produz links mais barulhentos, dificulta leitura e compartilha URLs com informação sem efeito real.

## What Changes

- Canonicalizar URLs de telas com search state validado para remover parâmetros que estejam apenas repetindo valores default.
- Aplicar middleware de search do TanStack Router nas telas list-driven e outras telas com filtros URL-driven onde o comportamento default já é conhecido.
- Preservar parâmetros não-default para que compartilhamento e reload continuem restaurando o mesmo estado visível.
- Manter validação por schema como fonte de defaults de rota.

## Non-goals

- Não alterar semântica de filtros, ordenação, paginação ou visibilidade de dados.
- Não introduzir persistência automática de search entre rotas diferentes via `retainSearchParams` neste change.
- Não substituir os schemas de search atuais nem mover filtro de URL para estado local.

## Capabilities

### New Capabilities
- `router-search-canonicalization`: define a canonicalização de URLs para rotas TanStack Router com search state validado e defaults conhecidos.

### Modified Capabilities
- None.

## Impact

- Affected code: `src/routes/_app/*.tsx` com `validateSearch`, schemas de search/defaults, hooks compartilhados de paginação/filtro/ordenação quando consumirem defaults centralizados.
- Affected systems: URL generation, link sharing, reload de telas list-driven, middleware de search do TanStack Router.
- User roles: todos os usuários autenticados que usam filtros de listagem ou dashboard.
- Multi-tenant implications: nenhuma mudança; apenas representação da URL.
