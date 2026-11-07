## Why

Contas a pagar e receber já permitem consultar títulos e movimentações, mas ainda não registrar baixas nem corrigir liquidações. Operadores precisam concluir essas ações no contexto do próprio título.

## What Changes

- Adicionar modais de baixa individual, total ou parcial, nas páginas e resumos dos títulos.
- Adicionar estorno por movimentação confirmada, com data e motivo, preservando o evento original.
- Gerar remunerações contratuais atomicamente e bloquear estornos com pagamentos dependentes ativos.
- Aplicar grants, isolamento por filial, auditoria, idempotência e serialização do saldo.

## Capabilities

### New Capabilities
- `title-settlements`: Baixas individuais e estornos contextualizados em títulos financeiros.

### Modified Capabilities

Nenhuma; a nova capacidade amplia as coleções existentes sem alterar sua consulta.

## Impact

Features de títulos, recebíveis e pagáveis; entidades Receipt, Payment, reversões e RemunerationPayable já existentes. Admin com grants pode operar pagamentos e estornos; Member com grant pode registrar recebimentos autorizados. Toda operação usa a filial da sessão. Sem novas dependências ou rotas.

## Non-goals

Seleção múltipla, criação manual de títulos, edição/exclusão de baixas, upload de comprovantes e relatórios novos. A baixa múltipla permanece prevista no contrato geral para etapa própria.
