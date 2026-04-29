## Context

Hoje `_app/route.tsx` exige sessão em `loader`, e as rotas públicas de autenticação também usam `loader` para expulsar usuários já autenticados. Isso funciona, mas acopla controle de acesso ao ciclo de carregamento de dados e não usa o ponto de extensão que o TanStack Router documenta para auth gating.

O ajuste é pequeno em escopo, mas cruza layout autenticado, telas públicas de autenticação, helpers de sessão e navegação pós-login. Também existe a oportunidade de preservar o destino originalmente solicitado, evitando que todo login sempre termine em `/`.

## Goals / Non-Goals

**Goals:**
- Executar redirects de autenticação antes do carregamento da rota.
- Manter loaders focados em prefetch de dados.
- Preservar o destino originalmente solicitado quando o usuário entra por uma rota protegida.
- Reusar os helpers compartilhados de sessão já existentes, sem criar uma segunda fonte de verdade.

**Non-Goals:**
- Reescrever o modelo de sessão.
- Alterar o fluxo visual das telas de auth.
- Trocar a matriz de permissões ou mover autorização de recurso para `beforeLoad`.

## Decisions

### 1. Gates de auth vão para `beforeLoad`
`beforeLoad` vira o ponto canônico para bloquear `_app` e para redirecionar usuários autenticados para fora de `/login` e `/recuperar-senha`.

Rationale:
- É o ponto recomendado pelo TanStack Router para auth gating.
- Evita misturar redirect de sessão com prefetch.
- Reduz risco de conteúdo protegido ou estado intermediário aparecer antes do redirect.

Alternatives considered:
- Manter `loader`: simples, mas semanticamente menos preciso e mais acoplado ao carregamento.
- Mover gate para componentes: tarde demais no ciclo da rota e pior para UX.

### 2. Destino solicitado será preservado por search param de redirect
Quando `_app` bloquear um usuário não autenticado, o redirect para `/login` incluirá um campo de search com o destino atual. O pós-login deverá consumir esse destino somente quando ele representar navegação interna válida; caso contrário, seguirá para `/`.

Rationale:
- Melhora continuidade do fluxo.
- Mantém a navegação explícita e compatível com o modelo do Router.

Alternatives considered:
- Sempre redirecionar para `/`: mais simples, mas perde contexto.
- Persistir destino em store local: mais indireto e mais difícil de sincronizar com reload.

### 3. Helpers de sessão continuam compartilhados
O change não cria outro helper de autenticação. Os helpers de sessão existentes continuam canônicos; apenas passam a ser chamados no momento certo do ciclo de rota.

Rationale:
- Evita duplicação de política.
- Mantém a fonte de verdade já consolidada em `src/shared/session`.

## Risks / Trade-offs

- [Redirect inválido ou externo em `redirect`] → Validar e aceitar apenas destinos internos conhecidos antes de navegar após login.
- [Diferença entre gate de rota e estado de sessão no browser] → Reusar os helpers compartilhados e manter invalidação/refetch de sessão no fluxo de login/logout.
- [Mudança de timing expor teste frágil] → Atualizar testes de rotas e autenticação para refletir `beforeLoad`.
