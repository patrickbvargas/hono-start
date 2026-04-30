## Context

O layout autenticado já renderiza o conteúdo dentro de um container central em `src/routes/__root.tsx`, mas o drawer compartilhado usa portal sem `container` e posicionamento `fixed`. Com isso, o drawer de detalhes é posicionado em relação ao viewport inteiro, não ao shell visível da aplicação.

## Goals / Non-Goals

**Goals:**
- Fazer o drawer de detalhes usar o container raiz como referência visual.
- Manter a API atual de `EntityDetail.Root` e do shared drawer simples.
- Aplicar a correção de forma centralizada, para todos os detalhes existentes.

**Non-Goals:**
- Criar um novo componente de layout ou provider para overlays.
- Alterar modais, sidebar mobile, ou outros overlays não relacionados aos detalhes.
- Redesenhar tamanhos, spacing, ou animações além do necessário para ancoragem.

## Decisions

- Add a stable DOM hook on the root layout container.
  Rationale: the drawer needs one known element to use as portal/positioning root. Adding an id and `relative` on the existing root container is the smallest change.
  Alternative considered: passing route-local refs through all detail call sites. Rejected because it spreads plumbing across many routes.

- Resolve the root container inside `EntityDetail.Root` and pass it to `Drawer`.
  Rationale: details are the only overlay behavior changing here, so resolution can stay local to the shared detail wrapper.
  Alternative considered: changing every drawer consumer. Rejected because it duplicates identical logic.

- Switch shared drawer overlay/content from `fixed` to `absolute` when rendered inside the root container.
  Rationale: `fixed` remains viewport-relative even when portaled into another element, while `absolute` anchors correctly to the nearest positioned ancestor.
  Alternative considered: custom transform math against viewport edges. Rejected as unnecessary complexity.

## Risks / Trade-offs

- Root container missing during first client render → Fallback to current behavior until hydration completes.
- Other drawer consumers may inherit container-aware positioning if they start passing a custom container → Acceptable, because shared drawer semantics remain consistent.
- Overlay clipping if the root container loses full-height/overflow assumptions → Mitigation: keep current `h-screen` and `overflow-hidden` root layout contract intact.
