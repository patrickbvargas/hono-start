## Why

Recebimentos e remunerações precisam guardar comprovantes PIX, documentos de pagamento e memórias de cálculo junto ao lançamento financeiro. Hoje anexos só existem em clientes, colaboradores, contratos e despesas.

## What Changes

- Permitir anexos diretamente em recebimentos e remunerações, nas páginas dedicadas e detalhes contextuais.
- Reutilizar upload em lote, listagem, download privado e exclusão confirmada existentes.
- Preservar acesso por escritório, contrato atribuído e remuneração própria. Upload exige permissão de anexos e leitura do lançamento; não altera valores nem exige edição financeira.
- Permitir documentação financeira após conclusão/cancelamento do contrato; bloquear novos anexos em lançamentos ou seus ancestrais excluídos.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `attachment-management`: adicionar recebimentos e remunerações como proprietários de anexos com escopo financeiro e interfaces contextuais.

## Impact

Prisma e migração aditiva, feature de anexos, páginas/detalhes de recebimentos e remunerações, contratos de domínio e testes. Administradores e usuários com leitura atribuída/própria e grants de anexos podem documentar seus lançamentos, sem ampliar visibilidade entre escritórios ou colaboradores.

## Non-goals

Novos formatos de arquivo, confirmação automática de pagamento, alteração dos cálculos financeiros, anexos em receitas e migração dos arquivos já existentes.
