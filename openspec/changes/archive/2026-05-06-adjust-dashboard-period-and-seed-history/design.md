## Context

O dashboard usa atalhos de período em `src/features/dashboard/utils/period-shortcuts.ts`. Hoje, o atalho anual sempre resolve para `01/01` até `31/12` do ano corrente, e esse intervalo é reutilizado pelos filtros, estado ativo do shortcut, gráfico de evolução e tabela mensal. Em paralelo, o seed Prisma gera contratos, receitas, fees e remunerações apenas com datas de 2026, o que limita validação visual e funcional de comparativos contra 2025.

## Goals / Non-Goals

**Goals:**

- Fazer o atalho do ano corrente refletir apenas meses até hoje.
- Manter o estado ativo do shortcut coerente com o novo intervalo padrão.
- Gerar fixtures determinísticas de 2025 com fees e remunerações válidas para comparativos anuais.
- Preservar seed idempotente e sem duplicação em reruns.

**Non-Goals:**

- Não alterar agregações financeiras fora do recorte temporal recebido.
- Não introduzir novas tabelas, migrations, ou lookups.
- Não remodelar os cenários funcionais já cobertos pelo seed atual.

## Decisions

### 1. O shortcut anual usará `referenceDate` como limite superior quando o ano for corrente

Rationale: resolve meses futuros vazios na origem do filtro, sem hacks na query ou na renderização. Também mantém URL, estado ativo do shortcut e agregações alinhados.

Alternativas consideradas:

- Cortar meses futuros apenas no gráfico/tabela. Rejeitada porque deixaria o filtro anual semanticamente incorreto e manteria métricas com período diferente do visual.
- Manter `31/12` e esconder meses futuros na UI. Rejeitada porque mascara o problema e cria divergência entre filtro e resultado.

### 2. O seed passará a gerar fixtures por ano com helper compartilhado

Rationale: o dataset de 2025 deve repetir cenários de negócio válidos sem duplicar grandes blocos manuais. Um helper por ano reduz drift entre 2025 e 2026 e facilita evolução futura.

Alternativas consideradas:

- Duplicar manualmente todo o bloco de contratos para 2025. Rejeitada por custo de manutenção e maior chance de inconsistência.
- Mover o ano para `Date.now()`. Rejeitada porque quebra determinismo do seed e previsibilidade dos testes locais.

### 3. O identificador de contrato seed continuará determinístico e incluirá ano

Rationale: contratos de 2025 e 2026 precisam coexistir sem colisão no `processNumber`, preservando reruns idempotentes via `upsert`.

Alternativas consideradas:

- Reusar os mesmos process numbers com outro cliente. Rejeitada por conflito na chave única de contrato por firma.

## Risks / Trade-offs

- [Mudança no default anual altera asserts existentes] -> Atualizar testes de shortcut, filtro e queries para o novo range canônico.
- [Seed maior aumenta tempo de execução] -> Reusar helpers e manter apenas anos necessários para comparativo.
- [Mudança parcial no seed pode gerar histórico inconsistente] -> Reaplicar os mesmos cenários e fórmulas já usadas em 2026 para 2025.
