## Context

Dashboard já usa loader com prefetch e suspense, mas o `pendingComponent` da rota `/` ainda renderiza só `RouteLoading`, que mostra `Spinner` genérico. Enquanto isso, listas canônicas do produto já usam skeleton estrutural dedicado no pending inicial. No dashboard, ausência desse shape gera salto visual justamente na landing principal do produto e reduz percepção de estabilidade.

Tela também já é componentizada por superfícies analíticas separadas e usa `Card` compartilhado como wrapper visual. Skeleton novo precisa seguir mesma composição visual, mesma ordem de blocos e mesmo comportamento de scroll interno, sem criar novo padrão paralelo fora da feature.

## Goals / Non-Goals

**Goals:**

- Entregar pending inicial do dashboard com skeleton estrutural fiel ao layout final.
- Preservar hierarchy visual da tela: header com filtros, cards métricos, gráfico de evolução, tabela mensal e breakdowns.
- Manter boundary da feature dashboard, usando shared UI re-exportada para primitives.
- Tornar contrato testável no nível de rota e de composição da feature.

**Non-Goals:**

- Não alterar queries, filtros, escopo de dados ou regras de permissão do dashboard.
- Não criar shared skeleton genérico para qualquer página analítica.
- Não substituir `RouteLoading` global em outras rotas.
- Não mudar layout final carregado do dashboard; apenas loading state inicial.

## Decisions

- Criar skeleton dedicado dentro da feature dashboard.
  Rationale: shape da tela é específico demais para caber num shared wrapper genérico sem perder fidelidade.
  Alternative considered: estender `RouteLoading` ou `ListRouteSkeleton`. Rejeitado porque ambos abstraem demais e não representam cards, chart shell e tabela do dashboard.

- Espelhar composição real do dashboard em blocos equivalentes, não em placeholders soltos.
  Rationale: pixel-perfect depende de manter ordem, wrappers `Card`, alturas aproximadas, grid responsivo e scroll area iguais ao estado carregado.
  Alternative considered: usar só blocos retangulares verticais. Rejeitado porque ainda geraria salto visual forte.

- Manter skeleton como surface-only component sem depender de dados mockados.
  Rationale: pending inicial deve ser determinístico, barato e sem duplicar schema/model.
  Alternative considered: construir skeleton a partir de arrays config-driven. Rejeitado por não agregar valor para um shape estático.

- Trocar `pendingComponent` da rota do dashboard para skeleton dedicado e manter `RouteLoading` apenas como indicador de navegação incremental no header.
  Rationale: isso preserva feedback leve para refetch/navegação enquanto corrige estado mais crítico, que é o primeiro paint da página.

## Risks / Trade-offs

- [Risk] Skeleton pode divergir do layout real conforme cards/gráficos evoluem. -> Mitigation: alinhar estrutura aos componentes atuais e adicionar testes de contrato para ordem dos blocos e wiring da rota.
- [Risk] Reproduzir visual demais no skeleton pode aumentar manutenção da feature. -> Mitigation: limitar fidelidade a estrutura, heights, spacing e wrappers; evitar duplicar detalhes internos dos charts.
- [Risk] Mobile e desktop podem exigir larguras diferentes e causar placeholder quebrado. -> Mitigation: reutilizar breakpoints e grid classes já usados na composição real.
