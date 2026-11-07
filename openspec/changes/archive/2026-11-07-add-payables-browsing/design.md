## Context

Receivables fornece padrão completo de consulta financeira. Payable já possui pontes de despesa/remuneração e pagamentos com reversão. Grants de payable/payment e política read_own já existem.

## Goals / Non-Goals

**Goals:** paridade de layout e interação, saldos precisos, escopo uniforme em todas as superfícies.

**Non-Goals:** operações de escrita financeira ou alterações de schema.

## Decisions

- Slice própria payables com o mesmo shape de receivables; reutilizar componentes compartilhados existentes. Não criar motor genérico de títulos, pois as origens e regras de autorização diferem.
- CTE SQL parametrizada calcula principal/caixa de pagamentos sem reversão, situação e totais antes de paginar, como no receber. Pontes usam firmId e somente remuneração resolve contrato por contractAssignment.
- Read_own exige beneficiário da Person autenticada, ponte de remuneração e contrato atribuído conforme política existente. Aplicar antes de resultados, opções e totais. Grants de pagamentos são verificados separadamente.
- Anexos usam owner payable próprio e consulta somente leitura. Auditoria resolve IDs autorizados antes de retornar eventos. Não retornar ruleSnapshot ou valores de remuneração de terceiros.
- URL, filtros, drawer, abas, skeletons, máscaras e menus seguem receivables, incluindo estado de retorno. Origens são Despesa, Remuneração e Direto.
- Context7 consultado para queryOptions, refetchInterval e refetchOnWindowFocus. Renovar estados na virada do dia civil de São Paulo e foco, como no receber.

## Risks / Trade-offs

- Vazamento por opções/contagens → mesma base autorizada para toda seleção e testes negativos.
- Confundir caixa e principal → campos separados e pagamentos estornados excluídos das somas.
- Migração legada ainda apresenta erros globais de TypeScript → executar gates e registrar diagnósticos sem supressões.

## Migration Plan

Sem migração, seed ou novas dependências. Rollback remove entrada de navegação e novas rotas sem alterar registros existentes.

## Open Questions

Nenhuma.
