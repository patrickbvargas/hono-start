## Context

O repositório já possui um padrão compartilhado para seções de drawers de detalhes através de `EntityDetail.Section`, que usa `SectionTitle`. A feature de anexos hoje renderiza sua própria heading manual e seu loading usa spinner e mensagem textual, destoando do restante dos detalhes. Além disso, os drawers de cliente, contrato e colaborador não incorporam explicitamente a seção de anexos, apesar do contrato do produto já tratar anexos como parte desses contextos.

## Goals / Non-Goals

**Goals:**
- Reusar o mesmo tratamento visual de heading entre anexos e demais seções dos drawers.
- Integrar anexos nos drawers de cliente, colaborador e contrato sem quebrar o padrão de overlay atual.
- Trocar o loading textual dos anexos por skeletons compatíveis com o restante do drawer.
- Ajustar skeletons dos drawers afetados para permanecerem proporcionais ao conteúdo final.

**Non-Goals:**
- Mudar contratos de dados, permissões ou regras de negócio de anexos.
- Refatorar `EntityDetail` para um novo layout global.
- Alterar fluxos de fee ou remuneration details.

## Decisions

### Reusar `SectionTitle` diretamente na `AttachmentSection`
`AttachmentSection` continuará sendo um componente feature-local exportado por `attachments`, mas seu título passará a usar o mesmo `SectionTitle` do shared layer. Isso preserva o limite entre feature e shared e elimina a heading ad hoc.

Alternativas consideradas:
- Encapsular `AttachmentSection` dentro de `EntityDetail.Section`: rejeitado porque a seção de anexos precisa manter ações próprias e estados internos, e já é consumida como bloco independente.
- Duplicar classes do título atual: rejeitado por perpetuar drift visual.

### Montar `AttachmentSection` dentro de `EntityDetail.Section`
Nos drawers de cliente, colaborador e contrato, a seção de anexos será encaixada no corpo do detalhe usando o mesmo ritmo de `Separator` e `Section` das demais áreas. O componente de anexos receberá uma flag para ocultar seu cabeçalho interno quando for renderizado dentro de uma seção do detalhe.

Alternativas consideradas:
- Deixar `AttachmentSection` renderizar seu próprio título também dentro do drawer: rejeitado por duplicar heading.
- Criar variantes separadas de componente para listagem simples e detalhe: rejeitado por aumentar superfície sem necessidade.

### Substituir spinner por skeletons determinísticos
O loading de anexos será representado por skeletons com medidas fixas e repetíveis, aproximando o estado carregando do layout final. Isso mantém coerência com `EntityDetail.SkeletonFields` e evita salto perceptível ao resolver a query.

Alternativas consideradas:
- Manter spinner textual: rejeitado por destoar do padrão de drawers e dificultar pixel parity.
- Reusar `EntityDetail.SkeletonFields` sem customização: rejeitado porque a lista de anexos tem composição de item e ações diferente dos pares termo/definição.

## Risks / Trade-offs

- [Skeleton de anexos ficar genérico demais] → Modelar o placeholder próximo do card/list item real, com linha de meta e ação.
- [Dupla renderização de heading entre drawer e componente] → Introduzir prop explícita para ocultar heading interno em contextos embutidos.
- [Regressão em detalhes existentes] → Cobrir com testes focados de renderização/composição e executar checagens do repositório.

## Migration Plan

Sem migração de banco ou rollout por etapas. Mudança apenas de UI e composição de drawers.

## Open Questions

- Nenhuma pendente para implementação atual.
