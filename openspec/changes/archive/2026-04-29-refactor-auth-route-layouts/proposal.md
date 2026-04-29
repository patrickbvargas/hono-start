## Why

As rotas autenticadas hoje repetem a montagem do `AuthenticatedShell` em cada página, o que espalha a responsabilidade de layout e autenticação pela árvore de rotas em vez de centralizá-la no TanStack Router. Agora é necessário alinhar a estrutura do projeto ao modelo de pathless layout routes para que o shell autenticado e o container público de autenticação sejam definidos uma única vez, com composição consistente para todas as rotas.

## What Changes

- Reorganizar as rotas do produto em um grupo pathless `_app` com `route.tsx` responsável pelo layout autenticado e pela exigência de sessão.
- Reorganizar as rotas públicas de autenticação em um grupo pathless `_auth` com `route.tsx` responsável pelo container visual das telas públicas.
- Remover a responsabilidade de montar o shell autenticado manualmente de cada rota protegida individual.
- Preservar os paths públicos e autenticados existentes, sem alterar URLs canônicas como `/`, `/clientes`, `/login` e `/recuperar-senha`.
- Manter o sidebar como parte do container autenticado e manter as telas públicas sem o shell autenticado.

## Non-goals

- Não alterar regras de autenticação, duração de sessão, permissões ou redirecionamentos já documentados.
- Não redesenhar o visual do sidebar, da dashboard ou dos formulários de login e recuperação de senha.
- Não introduzir novas URLs públicas ou autenticadas além da reorganização estrutural do roteamento.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `app-layout`: exigir que o shell autenticado seja fornecido por um pathless layout route `_app/route.tsx` que encapsula todas as rotas pós-login via `Outlet`.
- `authentication`: exigir que as telas públicas de autenticação sejam agrupadas sob um pathless layout route `_auth/route.tsx`, mantendo-as fora do shell autenticado e preservando seus redirecionamentos.

## Impact

- Affected code: `src/routes/**`, `src/shared/components/authenticated-shell.tsx`, componentes compartilhados de layout público/autenticado e geração da route tree do TanStack Router.
- Affected systems: composição de rotas autenticadas e públicas, carregamento de sessão em nível de layout e organização do sidebar no shell do aplicativo.
- User roles: todos os usuários autenticados e não autenticados, sem mudança nas permissões ou no escopo multi-tenant.
- Multi-tenant implications: nenhuma mudança de isolamento; a sessão continua sendo a fonte autoritativa para acesso às rotas protegidas.
