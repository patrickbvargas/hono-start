## Why

Despesas já geram títulos a pagar, mas falta uma coleção financeira própria para consultar obrigações e saldos. Entregar a mesma experiência de Contas a receber, preservando o sigilo das remunerações.

## What Changes

- Criar coleção `/contas-a-pagar` e página `/contas-a-pagar/$payableId`, navegação autorizada, tabela/cards, filtros na URL, totais, paginação, menus e resumo contextual.
- Exibir beneficiário, origem (despesa, remuneração ou direto), classificação, vencimento, principal abatido, saldo e caixa pago, com estados derivados de pagamentos não estornados.
- Disponibilizar Visão geral, Pagamentos, Anexos e Histórico conforme grants e acesso ao proprietário.
- Admin consulta títulos da filial. Member consulta exclusivamente sua própria remuneração ligada a contrato atribuído, antes de opções, contagens e totais.

## Capabilities

### New Capabilities

- `payables-browsing`: Consulta responsiva de títulos a pagar com isolamento de filial, sigilo de remuneração e paridade com o receber.

### Modified Capabilities

Nenhuma.

## Non-goals

- Criação/edição/cancelamento de títulos, pagamentos, estornos, seleção para baixa, exportação e geração de remuneração.
- Alterar rotas legadas, esquema Prisma, dependências ou mudança ativa de desacoplamento.
- Upload e exclusão de anexos de títulos nesta etapa de consulta.

## Impact

Nova slice payables e rotas; integração com navegação, related-records, autorização de anexos e auditoria. Sem migração ou seed. Mantém padrões de receivables e contratos canônicos do projeto.
