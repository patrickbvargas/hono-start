## Why

As rotas protegidas e públicas de autenticação ainda usam `loader` para decidir redirects de sessão, o que mistura prefetch de dados com controle de acesso e deixa a árvore de rotas menos alinhada ao fluxo recomendado do TanStack Router. Agora vale separar essas responsabilidades para que autenticação aconteça antes do carregamento da rota e o destino originalmente solicitado possa ser preservado de forma previsível.

## What Changes

- Mover a exigência de sessão das rotas autenticadas do `loader` para `beforeLoad`.
- Mover o redirect de usuários já autenticados fora das telas `/login` e `/recuperar-senha` para `beforeLoad`.
- Preservar o destino originalmente solicitado quando um usuário não autenticado for redirecionado para `/login`.
- Manter `loader` responsável apenas por prefetch e hidratação de dados de tela.
- Preservar URLs públicas e autenticadas existentes.

## Non-goals

- Não alterar regras de autorização, papéis, permissões, nem isolamento multi-tenant.
- Não substituir BetterAuth, TanStack Query, nem o modelo atual de sessão no servidor.
- Não redesenhar telas de login, recuperação de senha, sidebar, ou overlays.
- Não migrar outros comportamentos de rota que não estejam diretamente ligados ao gate de autenticação.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `authentication`: o gate de entrada e saída das rotas públicas e protegidas passa a acontecer em `beforeLoad`, com preservação opcional do destino solicitado antes do login.
- `session-authorization`: a exigência de sessão protegida passa a acontecer antes de loaders e renderização das rotas filhas, usando helpers compartilhados de sessão.

## Impact

- Affected code: `src/routes/_app/route.tsx`, `src/routes/_auth/login.tsx`, `src/routes/_auth/recuperar-senha.tsx`, `src/shared/session/**`, hooks de login e navegação pós-autenticação.
- Affected systems: TanStack Router route lifecycle, redirects de autenticação, sincronização entre gate de rota e cache de sessão.
- User roles: todos os usuários autenticados e não autenticados.
- Multi-tenant implications: nenhuma mudança; escopo de firma continua vindo da sessão autenticada.
