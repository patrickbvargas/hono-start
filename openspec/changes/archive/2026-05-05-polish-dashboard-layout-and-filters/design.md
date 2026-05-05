## Context

Dashboard já usa wrapper com altura limitada e superfícies em `Card`, mas conteúdo principal ainda cria scroll bruto no container interno. Isso faz scrollbar invadir área útil e visualmente cortar bordas dos cards. No cabeçalho, filtro de colaborador para admin fica enterrado no popover, diferente do padrão onde filtro primário fica visível e filtros secundários ficam agrupados.

## Goals / Non-Goals

**Goals:**
- Conter scroll do dashboard em `ScrollArea` compartilhada.
- Deixar seletor de colaborador visível ao lado do trigger de filtros.
- Reduzir ruído textual na legenda dos breakdowns.
- Remover badge de escopo visual sem alterar escopo real dos dados.

**Non-Goals:**
- Mudar queries, schemas, permissões ou payload de summary.
- Reestruturar `FilterPopover` para outras features.
- Alterar tema visual global do app.

## Decisions

- Use `ScrollArea` de `@/shared/components/ui` no container raiz do dashboard.
  Rationale: segue boundary de UI compartilhada e resolve clipping/scroll sem introduzir vendor import novo.
  Alternative considered: ajustar apenas `overflow-auto` e padding no container atual. Rejeitado porque mantém scrollbar nativa feia e menos consistente com house UI.

- Manter `FilterPopover` para filtros secundários e mover apenas `employeeId` para inline.
  Rationale: preserva padrão de "filtro principal visível + avançados no popover" já usado em outras listas.
  Alternative considered: mover todos filtros inline. Rejeitado por ampliar cabeçalho e fugir do padrão documentado.

- Esconder label visual do autocomplete inline com classe utilitária em vez de criar novo componente compartilhado.
  Rationale: mudança pequena, acessível, localizada e sem expandir API compartilhada.

## Risks / Trade-offs

- ScrollArea com padding lateral insuficiente pode ainda encostar no scrollbar → Mitigação: reservar `pr-3` no conteúdo rolável.
- Campo inline sem label visual pode perder contexto → Mitigação: manter label semanticamente presente via `sr-only` e placeholder explícito.
- Remoção da badge de escopo reduz redundância, mas tira um reforço visual de contexto → Mitigação: manter todo comportamento de escopo e título do dashboard intactos.
