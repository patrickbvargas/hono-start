## Context

O dashboard atual agrega métricas, gráficos, tabela mensal de remunerações e fluxo de caixa administrativo. A lógica de receitas já conhece `paymentStartDate`, `totalInstallments` e honorários ativos (`Fee`), mas hoje só usa esses dados para progresso por valor e quantidade paga, sem materializar quais parcelas mensais já venceram e seguem sem lançamento de honorário.

A mudança precisa caber no slice `dashboard`, sem criar um novo padrão de listagem nem uma nova rota. O cálculo deve continuar tenant-safe e role-scoped, reaproveitando a lógica existente de contratos atribuídos para usuários não administradores.

## Goals / Non-Goals

**Goals:**
- Acrescentar uma tabela no dashboard com parcelas vencidas e sem honorário ativo correspondente.
- Calcular inadimplência em nível de parcela, não apenas por diferença agregada de quantidade.
- Reutilizar o escopo atual do dashboard para administrador e usuário comum.
- Manter a regra auditável: cada linha deve explicar qual receita, qual parcela e por que ela está pendente.

**Non-Goals:**
- Não criar cobrança automática, alerta, notificação ou mudança de status contratual.
- Não alterar regras de criação de honorários, receitas ou remunerações.
- Não introduzir novo filtro independente da busca atual do dashboard.
- Não inferir atraso por valor financeiro recebido; a regra será por parcela vencida sem `Fee` ativo.

## Decisions

### 1. Calcular parcelas vencidas por mês completo decorrido
O sistema tratará cada parcela `n` como vencida em `paymentStartDate + n meses`. A quantidade de parcelas esperadas será `min(totalInstallments, meses completos decorridos desde paymentStartDate)`.

Rationale:
- Alinha com o raciocínio de negócio definido para o dashboard.
- Combina com os fixtures atuais, em que parcela 1 ocorre um mês após `paymentStartDate`.
- Evita marcar inadimplência no próprio dia de início do plano.

Alternatives considered:
- Contar o mês corrente como parcela imediatamente devida. Rejeitado porque antecipa atraso no instante de criação da receita.
- Calcular por valor recebido esperado. Rejeitado porque o sistema não armazena valor previsto individual por parcela.

### 2. Materializar faltas por `installmentNumber`
Em vez de apenas comparar `fees.length` com parcelas esperadas, o dashboard vai enumerar os números de parcelas de `1..parcelasEsperadas` que não possuem `Fee` ativo correspondente.

Rationale:
- Detecta lacunas reais, inclusive quando existe lançamento fora de ordem.
- Produz uma tabela mais auditável e acionável.

Alternatives considered:
- Mostrar só total de parcelas faltantes. Rejeitado porque esconde quais competências precisam conferência.

### 3. Manter tudo dentro do summary payload do dashboard
Os dados da nova tabela serão adicionados ao payload de `getDashboardSummary`, com novo contrato em `schemas/model.ts` e novo componente analítico no dashboard.

Rationale:
- Preserva o padrão já existente do dashboard: uma rota, um summary carregado no loader, várias superfícies analíticas derivadas.
- Evita introduzir query paralela ou novo padrão de paginação dentro do dashboard.

Alternatives considered:
- Nova query dedicada da tabela. Rejeitado porque adiciona complexidade sem necessidade para o volume esperado da superfície analítica.

## Risks / Trade-offs

- [Regra de vencimento mensal implícita] -> Mitigar documentando a regra no spec delta e centralizando cálculo em helper explícito.
- [Receitas com parcelas de valores desiguais não são representadas] -> Mitigar limitando a detecção a atraso por lançamento de parcela, sem estimar inadimplência por valor.
- [Payload maior no dashboard] -> Mitigar selecionando apenas campos necessários para a tabela e reutilizando filtros/escopo já existentes.
- [Possível discrepância em fusos/data parcial] -> Mitigar usando utilitários UTC já existentes no slice para cálculo de mês e corte temporal.
