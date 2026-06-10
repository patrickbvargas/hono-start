## Why

O dashboard já resume receitas e remunerações, mas ainda não mostra o fluxo de caixa completo da firma agora que o produto também registra saídas por remunerações e despesas. Sem essa leitura consolidada, administradores seguem dependendo de controles externos para enxergar saldo, entrada, saída e variação mensal de caixa no mesmo contexto analítico.

## What Changes

- Adicionar ao dashboard uma leitura analítica de fluxo de caixa derivada de honorários recebidos, remunerações e despesas.
- Expor no dashboard um card de saldo total, um gráfico mensal de saldo e um resumo mensal com entrada, saída e saldo.
- Quebrar as entradas mensais por tipo de receita já existente no domínio: `Administrativo`, `Judicial` e `Sucumbência`.
- Tratar o fluxo de caixa como dado somente leitura no dashboard, sem criar ações de edição, exportação nova ou drill-down transacional nesta mudança.
- Restringir a visualização completa de fluxo de caixa a administradores, porque despesas são dados firm-wide e usuários regulares não podem visualizar despesas.
- Atualizar os docs canônicos em `docs/` para registrar a nova superfície analítica e seu escopo de permissão.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `dashboard`: o dashboard passa a exibir resumo read-only de fluxo de caixa com saldo total, evolução mensal e tabela mensal consolidada de entrada, remuneração, despesa, saída e saldo, respeitando o escopo da sessão.

## Impact

- Affected code: `src/features/dashboard/*`, `src/routes/_app/index.tsx`, read models e testes focados do dashboard.
- Affected docs: `docs/domain/FEATURE_BEHAVIOR.md`, `docs/domain/ROLES_AND_PERMISSIONS.md`, `docs/domain/GLOSSARY.md` e capability `openspec/specs/dashboard/spec.md`.
- Affected roles: administradores ganham visão firm-wide read-only de fluxo de caixa; usuários regulares não ganham acesso a despesas nem a saldo consolidado da firma.
- Multi-tenant: todas as agregações continuam estritamente firm-scoped e derivadas da sessão autenticada.

## Non-goals

- Não criar rota nova de relatórios ou tela separada de balanço.
- Não permitir criação, edição ou exclusão de honorários, remunerações ou despesas a partir da nova superfície do dashboard.
- Não alterar regras de cálculo de honorários, remunerações ou despesas; a mudança é apenas de agregação e apresentação read-only.
- Não expandir a visibilidade de despesas para usuários regulares.
