## Why

Contratos já geram títulos a receber, mas não existe uma coleção financeira para localizar essas obrigações, acompanhar saldos e consultar seus detalhes. A primeira entrega será Contas a Receber, com a mesma experiência de listagem, resumo contextual e página dedicada usada nas demais entidades, tanto no desktop quanto no mobile.

## What Changes

- Criar `/contas-a-receber` e `/contas-a-receber/$receivableId`, com entrada própria na navegação e títulos em pt-BR.
- Reproduzir o padrão completo de consulta: filtros e chips na URL, atalhos de período, ordenação, paginação, totais filtrados, tabela desktop, cards mobile, alternância de visualização desktop, menu de contexto e menu de ações equivalentes.
- Abrir a página dedicada como ação principal do registro e oferecer resumo em drawer pelo menu, preservando o contexto da lista.
- Compor página dedicada e resumo com seções reutilizadas: Visão geral, Recebimentos, Anexos e Histórico, conforme permissões. Abas da página ficam na URL e o retorno restaura os filtros da coleção.
- Exibir contraparte, origem por ponte, classificação, vencimento, valor nominal, principal abatido, saldo, caixa recebido e estados financeiros derivados, sem confundir recebimento com abatimento de principal.
- Proteger lista, opções, totais, resumo, página, recebimentos, anexos e auditoria pelo escopo da sessão. Admin consulta títulos da filial; Member consulta apenas títulos de contratos atribuídos, com grants explícitos.

## Capabilities

### New Capabilities

- `receivables-browsing`: Consulta completa de títulos a receber, com listagem responsiva, menus, resumo contextual, página com abas, cálculos financeiros e autorização uniforme.

### Modified Capabilities

Nenhuma. A nova coleção utiliza os contratos existentes de navegação, overlays, anexos e auditoria sem redefini-los.

## Non-goals

- Contas a pagar, pagamentos, fluxo de caixa, exportações ou novos relatórios globais.
- Criar ou editar títulos, cancelar/restaurar obrigações, registrar recebimentos, selecionar títulos para baixa em lote, estornar ou gerar remunerações. Esta mudança entrega a consulta completa; menus não terão ações de escrita fictícias.
- Copiar exclusão lógica genérica para `Receivable`, que utiliza cancelamento financeiro e não possui `deletedAt`.
- Substituir ou remover a rota legada `/honorarios`, nem usar seus registros `Fee` como fonte dos títulos.
- Alterar geração, esquema Prisma, stack, componentes base ou estrutura documentada.

## Impact

- Nova slice `src/features/receivables`, seguindo a referência `clients` e a composição financeira de `expenses`.
- Novas rotas, registro em `ROUTES` e navegação autorizada; regeneração normal da árvore de rotas.
- Integração com fronteiras públicas de related-records, attachments e audit-logs; extensão pontual de autorização por proprietário onde Receivable ainda não estiver suportado.
- Atualização de documentação canônica para registrar a consulta, os campos do resumo e a precedência visual de estados sobrepostos.
- Sem nova dependência e sem migração prevista. A mudança ativa `decouple-financial-bridge-schema` permanece independente; esta entrega usa o esquema de pontes já presente no checkout, sem executar seed/reset.
