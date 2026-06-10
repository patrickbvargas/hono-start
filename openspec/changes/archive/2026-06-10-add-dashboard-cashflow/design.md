## Context

O dashboard já possui agregação server-side, filtros por URL e componentes analíticos dedicados para cards, gráfico de evolução financeira, breakdowns e tabela mensal de remunerações. A mudança de fluxo de caixa cruza o read model do dashboard, a composição visual da tela e o contrato de visibilidade por papel, porque passa a combinar três fontes distintas: honorários recebidos, remunerações e despesas.

A principal restrição é de permissão: despesas são dados firm-wide e administradores são os únicos autorizados a visualizá-las. Portanto, qualquer saldo consolidado que some despesas não pode aparecer para usuários regulares sem violar o contrato atual de visibilidade.

Stakeholders principais:
- administradores, que precisam acompanhar saldo, entrada e saída da firma no dashboard;
- usuários regulares, que não podem ganhar visibilidade indireta de despesas;
- mantenedores do repositório, que precisam preservar o slice `dashboard` como ponto único de agregação read-only da home autenticada.

## Goals / Non-Goals

**Goals:**
- estender o read model do dashboard para expor dados de fluxo de caixa read-only;
- definir saldo como `entrada - saída`, com `entrada = honorários recebidos` e `saída = remunerações + despesas`;
- expor card, gráfico mensal e tabela mensal de fluxo de caixa alinhados ao estilo atual do dashboard;
- manter a visão completa de fluxo de caixa disponível apenas para administradores;
- atualizar docs canônicos para registrar o novo dado analítico e sua regra de visibilidade.

**Non-Goals:**
- criar nova rota, exportação ou drill-down transacional de fluxo de caixa;
- mudar regras de cálculo de honorários, remunerações ou despesas;
- vincular despesas a contratos, áreas ou tipos de receita;
- expandir a visibilidade de despesas ou saldo consolidado para usuários regulares.

## Decisions

### 1. Reusar o summary query do dashboard como fonte única do fluxo de caixa

`getDashboardSummary` continuará sendo o payload agregado da home autenticada e passará a devolver também a estrutura de fluxo de caixa.

Rationale:
- evita endpoint paralelo para a mesma combinação de filtros;
- mantém loader, suspense, cache key e escopo de sessão consistentes;
- garante que card, gráfico e tabela usem a mesma interpretação temporal e de permissão.

Alternatives considered:
- criar query separada só para fluxo de caixa: duplicaria regras de período, role scope e prefetch;
- montar saldo no cliente: empurra agregação de negócio para a UI e aumenta risco de divergência.

### 2. Fluxo de caixa completo será admin-only

O dashboard exibirá card, gráfico e tabela de fluxo de caixa completo apenas quando `isAdmin = true`.

Rationale:
- despesas são firm-wide e administrador-only por contrato;
- `saldo = entrada - saída` com despesas embutidas revelaria informação proibida para usuário regular;
- esconder só a coluna de despesas e ainda mostrar saldo consolidado continuaria vazando dado derivado.

Alternatives considered:
- mostrar saldo parcial para usuário regular sem despesas: criaria dois significados diferentes para “fluxo de caixa” e aumentaria ambiguidade;
- mostrar despesas agregadas sem detalhe: ainda viola o contrato de permissão, porque continua sendo visibilidade financeira firm-wide.

### 3. Entrada seguirá semântica de receita recebida já existente no dashboard

`entrada` será derivada de honorários efetivamente recebidos, somando `downPaymentValue` na data de início do pagamento e `fee.amount` nas datas de pagamento, reaproveitando a semântica atual de “receita recebida”.

Rationale:
- alinha fluxo de caixa com os cards e breakdowns já existentes;
- evita misturar receita prevista com caixa realizado;
- preserva uma única verdade para valores de entrada no dashboard.

Alternatives considered:
- usar `revenue.totalValue` planejado: mais simples, mas incorreto para caixa;
- criar terceira semântica “entrada de caixa” separada da receita recebida atual: redundante e confusa.

### 4. Tabela mensal de fluxo de caixa terá colunas fixas de composição financeira

A tabela mensal mostrará por mês os tipos de entrada `Administrativo`, `Judicial` e `Sucumbência`, mais colunas derivadas `Entrada`, `Remuneração`, `Despesa`, `Saída` e `Saldo`.

Rationale:
- reflete diretamente o modelo visual pedido;
- usa tipos de receita já canônicos no domínio;
- mantém leitura executiva sem exigir drill-down adicional.

Alternatives considered:
- reaproveitar breakdowns separados sem tabela mensal: perde comparabilidade mês a mês;
- incluir área jurídica na tabela: não corresponde à referência nem ao conceito principal de fluxo de caixa.

### 5. Filtros atuais se aplicam apenas aos conjuntos relevantes de forma explícita

`dateFrom` e `dateTo` afetam todas as agregações temporais do fluxo de caixa. `revenueType` e `legalArea` afetam entradas e remunerações relacionadas a contratos elegíveis, mas não afetam despesas standalone.

Rationale:
- despesas não possuem vínculo contratual, área jurídica ou tipo de receita;
- forçar esses filtros sobre despesas criaria falsa precisão;
- o dashboard já documenta aplicação consistente apenas aos datasets relevantes ao filtro selecionado.

Alternatives considered:
- ignorar filtros de área/tipo em todo o fluxo de caixa: tornaria entradas e saídas inconsistentes com o restante do dashboard;
- mapear despesas artificialmente para áreas/tipos: inventaria semântica inexistente no domínio.

## Risks / Trade-offs

- [Saldo admin-only reduz simetria entre perfis] → Mitigation: documentar explicitamente que fluxo de caixa completo depende de despesas firm-wide e por isso não aparece para usuários regulares.
- [Tabela mensal adiciona densidade visual ao dashboard] → Mitigation: manter componente dedicado, scroll já existente e priorizar rótulos compactos.
- [Filtros de área/tipo não afetam despesas, o que pode surpreender] → Mitigation: registrar comportamento no spec e nos docs como aplicação apenas a datasets relevantes.
- [Agregação adicional aumenta custo da summary query] → Mitigation: reaproveitar queries e baldes mensais existentes sempre que possível e validar cobertura focada do dashboard.
