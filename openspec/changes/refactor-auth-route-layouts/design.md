## Context

O projeto usa TanStack Router com file-based routing, mas as rotas protegidas ainda montam o `AuthenticatedShell` individualmente em cada arquivo de rota. Isso duplica composição de layout, espalha o gate de autenticação e dificulta evoluir a árvore de rotas para um modelo mais próximo do layout aninhado esperado pelo router.

A mudança proposta introduz dois grupos pathless:

- `_app/route.tsx` para encapsular todas as rotas autenticadas com sidebar e exigir sessão antes de renderizar o conteúdo filho.
- `_auth/route.tsx` para encapsular as rotas públicas de autenticação em um container visual único, sem o shell autenticado.

Essa estrutura preserva os mesmos paths públicos e autenticados, mas move a responsabilidade de layout para o roteador.

## Goals / Non-Goals

**Goals:**
- Centralizar o shell autenticado no layout `_app`.
- Centralizar o container das telas públicas de autenticação no layout `_auth`.
- Manter URLs existentes, comportamento de redirecionamento e regras de sessão.
- Reduzir repetição de `AuthenticatedShell` e de verificações de sessão espalhadas pelas folhas de rota.
- Deixar a árvore de rotas alinhada ao modelo de pathless layout do TanStack Router.

**Non-Goals:**
- Alterar a experiência visual do sidebar ou dos fluxos de login e recuperação de senha.
- Redesenhar a estratégia de providers globais no `__root`.
- Mudar permissões, regras de negócio, loaders de dados de feature ou contratos de query.

## Decisions

### Decision: Usar `_app/route.tsx` como shell autenticado pathless
O layout autenticado passará a existir como uma rota pathless do TanStack Router, usando `Outlet` para renderizar as páginas protegidas.

Rationale:
- Remove repetição de `<AuthenticatedShell>...</AuthenticatedShell>` em cada rota.
- Coloca a composição do sidebar no nível correto da árvore de rotas.
- Permite que o gate de autenticação seja definido uma vez para todas as rotas pós-login.

Alternatives considered:
- Manter o `AuthenticatedShell` em cada rota protegida.
  - Rejeitado porque preserva duplicação e dificulta evoluir a hierarquia.
- Mover tudo para `__root.tsx`.
  - Rejeitado porque misturaria rotas públicas e protegidas no mesmo container e exigiria condicionais globais desnecessárias.

### Decision: Usar `_auth/route.tsx` para o container das páginas públicas
As rotas `/login` e `/recuperar-senha` passarão a viver sob um layout pathless `_auth`, responsável apenas pelo container visual das telas públicas.

Rationale:
- Mantém as páginas públicas fora do shell autenticado de forma explícita na árvore.
- Aproxima a organização de rotas do shape desejado pelo time.
- Permite evoluir outras telas públicas futuras sem repetir o mesmo container.

Alternatives considered:
- Continuar com cada rota pública montando seu próprio container.
  - Rejeitado porque mantém duplicação e reduz clareza arquitetural.

### Decision: Centralizar `requireRouteSession` no layout `_app`
O layout `_app` será o dono da verificação de sessão da área autenticada. As rotas filhas continuarão responsáveis apenas por seus próprios dados de feature.

Rationale:
- O acesso a qualquer rota filha protegida passa primeiro pela mesma barreira de autenticação.
- Evita múltiplas verificações equivalentes distribuídas pela árvore.
- Mantém os loaders de feature focados em prefetch e composição local.

Alternatives considered:
- Manter `requireRouteSession` em todos os loaders filhos.
  - Rejeitado porque o comportamento passa a ser redundante depois da introdução do layout autenticado.

### Decision: Preservar `AuthenticatedShell` como componente de infraestrutura do layout
O componente `AuthenticatedShell` pode continuar existindo, mas deixa de ser uma preocupação das rotas-folha e passa a ser usado somente pelo layout `_app`.

Rationale:
- Minimiza churn estrutural.
- Reaproveita a composição existente de `LoggedUserSessionProvider`, `SidebarProvider`, `AppSidebar` e `SidebarInset`.
- Mantém a mudança focada no roteamento, não em redesign de componentes compartilhados.

Alternatives considered:
- Substituir `AuthenticatedShell` por um novo layout component ao mesmo tempo.
  - Rejeitado porque amplia o escopo sem benefício funcional imediato.

## Risks / Trade-offs

- [Duplicidade temporária entre loaders pai e filho] → Mitigação: definir claramente que `_app` valida sessão e que filhos cuidam apenas do prefetch específico.
- [Regeneração da route tree pode expor imports e caminhos antigos] → Mitigação: mover as rotas de forma coesa e atualizar todos os imports no mesmo change.
- [Confusão entre agrupamento organizacional e layout pathless] → Mitigação: usar `_app` e `_auth` como rotas pathless reais com `route.tsx`, não apenas diretórios de organização.
- [Componentes públicos podem ficar acoplados demais ao layout de autenticação] → Mitigação: limitar `_auth/route.tsx` ao container visual compartilhado, preservando o conteúdo de cada página nas folhas.

## Migration Plan

1. Criar `src/routes/_app/route.tsx` com `requireRouteSession`, shell autenticado e `Outlet`.
2. Mover as rotas protegidas atuais para `src/routes/_app/`.
3. Criar `src/routes/_auth/route.tsx` com o container compartilhado das telas públicas.
4. Mover `login` e `recuperar-senha` para `src/routes/_auth/`.
5. Atualizar imports, loaders e usos de layout para a nova árvore.
6. Regenerar a route tree do TanStack Router e validar que os paths públicos permanecem inalterados.
7. Validar navegação autenticada e pública, inclusive redirects.

Rollback strategy:
- Reverter a reorganização da árvore de rotas e restaurar a montagem de shell por rota, sem impacto em contratos de domínio ou dados persistidos.

## Open Questions

- Nenhuma questão aberta crítica no momento; a proposta já fixa o shape alvo como `_app/route.tsx` e `_auth/route.tsx` com preservação dos paths atuais.
