## Context

O projeto já centraliza skeletons equivalentes em shared components. Os desvios atuais estão nesses componentes compartilhados, então correção precisa acontecer no shared layer para refletir em todas as rotas e drawers sem duplicação por feature.

## Goals / Non-Goals

**Goals:**

- Remover bordas visuais do skeleton de list route.
- Aproximar alturas dos placeholders de lista dos elementos reais da tabela e paginação.
- Fazer `EntityDetail.SkeletonFields` usar alturas consistentes com tipografia e gaps reais do estado carregado.

**Non-Goals:**

- Não mudar larguras já usadas pelos skeletons de detalhes.
- Não alterar contrato de rotas, overlays, queries ou componentes de feature.
- Não introduzir skeletons específicos por entidade.

## Decisions

- Manter toda mudança em `src/shared/components`.
  Rationale: listas e drawers equivalentes já dependem desses wrappers compartilhados.

- Remover classes de borda do `ListRouteSkeleton`, preservando estrutura e alturas.
  Rationale: atende pedido visual sem quebrar shape estrutural já exigido por contrato.

- Ajustar alturas do `EntityDetail.SkeletonFields` a partir das classes reais de `EntityDetail.Fields`.
  Rationale: os gaps já seguem o layout final; desvio principal está na altura das linhas placeholder.

## Risks / Trade-offs

- Menos linhas divisórias no skeleton de lista pode reduzir separação visual entre header, rows e footer -> Mitigation: preservar blocos, alturas e agrupamento existentes.
- Ajuste de altura genérico no detail skeleton não replica diferenças entre texto e badge em todos os campos -> Mitigation: alinhar com tipografia padrão dos fields, mantendo comportamento consistente entre features.
