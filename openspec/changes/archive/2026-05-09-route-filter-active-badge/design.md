## Context

As superfícies de lista e dashboard já usam search state validado na rota como fonte de verdade para filtros. Os campos primários de busca ficam inline, enquanto filtros secundários ficam agrupados em `FilterPopover`. Hoje o gatilho visual desse popover é estático, então o usuário não consegue distinguir rapidamente entre estado default e estado filtrado.

O ajuste é transversal porque o mesmo componente compartilhado é reutilizado por clientes, contratos, honorários, remunerações, auditoria, dashboard e colaboradores. Ao mesmo tempo, cada superfície precisa decidir quais campos contam para o indicador, porque alguns filtros ficam fora do popover.

## Goals / Non-Goals

**Goals:**
- Centralizar a detecção de "valor não-default" a partir do schema validado do filtro.
- Permitir que `FilterPopover` renderize um indicador visual opcional sem assumir regra de negócio.
- Permitir que cada feature defina quais chaves do filtro pertencem ao popover.
- Preservar URL state como fonte de verdade, inclusive para defaults dinâmicos como período atual do dashboard.

**Non-Goals:**
- Não introduzir contador de filtros ativos.
- Não mudar serialização de rota, defaults de search, ou comportamento de submit do formulário.
- Não mover campos entre área inline e popover.

## Decisions

### Decision: Derivar defaults a partir do schema do filtro
`useFilter` passará a calcular o estado default via `schema.parse({})` e comparará o filtro atual contra esse valor default.

Rationale:
- Reusa a fonte canônica já existente para defaults de URL state.
- Suporta defaults dinâmicos do dashboard sem duplicar regra.
- Evita propagar objetos de defaults separados por feature.

Alternatives considered:
- Passar defaults manualmente por feature. Rejeitado porque duplicaria regra e aumentaria drift entre schema e UI.
- Comparar contra search params crus. Rejeitado porque ignora canonicalização e normalização já feitas pelo schema.

### Decision: Manter `FilterPopover` como componente visual com props explícitas
`FilterPopover` receberá props explícitas para ligar o indicador e receber o estado calculado, em vez de conhecer schemas ou hooks de rota.

Rationale:
- Mantém boundary compartilhado simples e reutilizável.
- Evita acoplamento entre shared UI e TanStack Router/Zod.
- Permite desligar o comportamento em usos futuros.

Alternatives considered:
- Fazer `FilterPopover` inspecionar children ou contexto de form. Rejeitado por fragilidade e alto acoplamento.

### Decision: Contar apenas campos pertencentes ao popover
Cada hook/componente de filtro usará uma lista explícita de chaves para indicar quais campos representam filtros avançados do popover.

Rationale:
- Busca principal continua visível inline e já comunica estado por si só.
- Evita sinal falso quando apenas o campo de busca muda.
- Permite rotas híbridas como dashboard, onde `employeeId` e shortcuts ficam fora do popover.

Alternatives considered:
- Considerar todos os campos do schema. Rejeitado porque misturaria filtros inline com filtros avançados.

## Risks / Trade-offs

- Comparação rasa de arrays/objetos pode falhar se um filtro futuro usar estruturas mais complexas → Mitigação: usar comparação profunda estável no helper compartilhado.
- Defaults dinâmicos dependem de `schema.parse({})` ser determinístico no instante da renderização → Mitigação: reaproveitar o mesmo schema já usado para ler o search state; não introduzir fonte paralela.
- Aplicação parcial só em algumas telas deixaria UX inconsistente → Mitigação: atualizar todas as superfícies atuais que usam `FilterPopover`.

## Migration Plan

Sem migração de dados. Deploy seguro como mudança apenas de UI:
1. adicionar helper compartilhado e props do popover;
2. ligar indicador nas superfícies existentes;
3. validar por testes e checks;
4. rollback simples revertendo componente compartilhado e consumidores.

## Open Questions

- Nenhuma pendente para implementação atual. O único ponto opcional futuro é decidir se algum produto quer contador em vez de bolinha, mas isso fica fora deste change.
