## Context

Consulta financeira já deriva saldo de principal excluindo reversões. Prisma contém liquidações, reversões 1:1, requestKey e pontes de remuneração. As features legadas fees/remunerations não representam esse novo motor e não devem receber novas escritas.

## Goals / Non-Goals

**Goals:** baixa individual e estorno acessíveis pelo título; atomicidade financeira, auditoria e isolamento.

**Non-Goals:** seleção múltipla, novas rotas, alteração ou exclusão de liquidações e migração do legado.

## Decisions

- Criar feature `title-settlements`, com schemas, API, data, hooks e modais próprios. Receivables/payables compõem sua superfície pública. Evita duplicar equação, estornos e remuneração nas duas coleções.
- Usar Decimal no servidor, datas ISO de calendário e hoje em America/Sao_Paulo. O servidor recalcula caixa e saldo, nunca aceita totais do cliente.
- Bloquear linha do título antes de ler saldo e requestKey. Reenvio com mesmo payload retorna sucesso; uso da chave com payload distinto falha. Reversão bloqueia primeiro o título original, depois os pagáveis dependentes em ordem crescente. Pagamentos também bloqueiam seus títulos, impedindo corrida com cancelamento em cascata.
- Liquidações só aceitam títulos não cancelados com saldo suficiente. Estorno cria evento separado, exige data igual ou posterior à baixa e não futura e motivo obrigatório. Não altera evento original.
- Recebimentos contratuais geram remuneração opcional, padrão habilitado. Percentuais preservam semântica existente por atuação: responsável/assistente usam remuneração, indicante usa indicação, indicado usa remuneração menos indicação aplicável. Ponte guarda snapshot e vencimento pela régua da filial, com arredondamento em centavos. Perfis indisponíveis ou percentuais inválidos rejeitam a operação inteira.
- Baixa individual usa modal EntityForm/TanStack Form; overlays usam useOverlay. Estorno fica em cada movimentação ativa, não em uma ação ambígua de estornar o título inteiro.
- Invalidar consultas financeiras, contratos, despesas e auditoria após confirmação, preservando filtros e aba.

## Risks / Trade-offs

- Pagamentos dependentes concorrentes → todos disputam os mesmos locks de pagável.
- Reenvio após falha de rede → requestKey estável por formulário e validação do payload persistido.
- Regras legadas parcialmente migradas → nova escrita usa somente Receipt/Payment/RemunerationPayable; testes não dependem do motor legado.
- Baixa múltipla continua fora desta entrega → contrato geral permanece, interface individual explicitada.

## Migration Plan

Sem alteração de schema ou migração. Publicar com grants existentes do Clerk. Rollback remove somente interface/operações novas; eventos financeiros persistidos permanecem consultáveis e imutáveis.

## Open Questions

Nenhuma decisão de produto pendente para o recorte individual.
