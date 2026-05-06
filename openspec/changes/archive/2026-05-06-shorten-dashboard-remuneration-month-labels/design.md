## Context

O dashboard já agrupa evolução financeira e remunerações por buckets mensais equivalentes. A tabela de remunerações ainda monta labels com `yyyy`, enquanto o chart usa `yy`, o que quebra consistência de leitura mesmo sem alterar dados retornados.

## Goals / Non-Goals

**Goals:**

- Exibir labels da tabela mensal no formato curto `MMM/yy`.
- Preservar buckets, range, totais e demais contratos do read model.

**Non-Goals:**

- Alterar o label longo do range do chart.
- Mudar contratos de filtro, cálculos financeiros ou comportamento do dashboard fora da apresentação dos headers mensais.

## Decisions

- Introduzir formatter dedicado para labels curtos da tabela mensal.
  Rationale: o dashboard já usa mais de um formato temporal; isolar o formato curto evita impacto colateral no range label do chart.

- Aplicar a mudança apenas na montagem de `remunerationMonths`.
  Rationale: essa é a única superfície que precisa convergir para `Jan/26` sem mudar outros textos existentes.

## Risks / Trade-offs

- [Confusão entre range label e column labels] → Mitigation: manter testes explícitos para tabela e queries, deixando claro que só os headers da tabela mudam.
