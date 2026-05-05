## Context

O dashboard ja usa busca validada por URL com `dateFrom` e `dateTo` defaultando para o ano atual. O header tambem ja tem o filtro inline de colaborador e um popover de filtros avancados onde o periodo manual continua editavel. Pedido novo adiciona um grupo de atalhos de periodo ao lado do input de colaborador, visualmente parecido com chips/botoes curtos, sem trocar contrato atual do popover.

Mudanca e local de frontend: nao exige nova query, nao muda schema de dados retornados e nao altera regras de escopo. O estado canonico continua sendo `dateFrom` e `dateTo` na URL.

## Goals / Non-Goals

**Goals:**
- renderizar botoes de atalho `6 meses`, `12 meses` e `2026` no header do dashboard;
- fazer cada atalho escrever o intervalo correspondente em `dateFrom` e `dateTo`;
- manter `2026` como default inicial no ano atual;
- preservar edicao manual no popover com reflexo imediato na URL.

**Non-Goals:**
- nao adicionar parametro novo de busca como `periodPreset`;
- nao mudar queries do dashboard ou agregacao backend;
- nao alterar o comportamento admin-only do filtro de colaborador inline.

## Decisions

### 1. URL stays source of truth; shortcuts derive from `dateFrom` and `dateTo`

Os atalhos nao vao persistir estado proprio. O componente calcula qual preset esta ativo comparando `dateFrom/dateTo` atuais com tres ranges canonicos:
- ultimos 6 meses;
- ultimos 12 meses;
- ano atual completo (`2026-01-01` ate `2026-12-31` no ambiente atual).

Rationale:
- evita duplicar estado entre form e rota;
- preserva compartilhamento/restauro de URL;
- deixa filtro manual e atalhos sincronizados pelo mesmo contrato.

Alternatives considered:
- adicionar `periodPreset` na busca: mais estado, mais limpeza, sem necessidade real;
- manter estado local de botao ativo: quebra restauro de URL e pode divergir do periodo manual.

### 2. Shortcut clicks will submit canonical date ranges directly through existing form flow

O hook de filtro do dashboard deve expor uma acao para aplicar um preset escrevendo `dateFrom` e `dateTo` no form e submetendo pelo fluxo atual.

Rationale:
- reusa `useAppForm` e `handleFilter`;
- mantem um unico caminho de submit/normalizacao;
- reduz risco de branches de navegacao diferentes entre clique e input manual.

Alternatives considered:
- navegar direto pela rota no clique: duplica logica de serializacao;
- atualizar URL fora do form: quebra encapsulamento do hook.

### 3. Manual popover edits clear visual shortcut selection when range no longer matches a preset

Se usuario editar datas manualmente e o range nao bater exatamente com um preset canonico, nenhum botao fica ativo. Se bater exatamente, botao correspondente pode ficar ativo novamente.

Rationale:
- deixa UI honesta;
- preserva liberdade do filtro manual;
- evita sugestao errada de que range customizado pertence a preset.

Alternatives considered:
- sempre manter ultimo atalho clicado ativo: mascara range real;
- nunca reativar atalho apos ajuste manual equivalente: perde feedback util.

## Risks / Trade-offs

- [Calculo de "ultimos 6/12 meses" pode variar conforme regra de inclusao] → fixar ranges canonicos no design de implementacao e cobrir com testes de schema/UI.
- [Comparacao entre range atual e preset pode falhar por timezone] → comparar strings ISO `YYYY-MM-DD` ja usadas no search schema, nao `Date` locais soltas.
- [Layout do header pode apertar em telas menores] → usar grupo de botoes responsivo com wrap e sem remover popover manual.
