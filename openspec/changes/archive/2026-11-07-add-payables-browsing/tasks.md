## 1. Preparação

- [x] 1.1 Conferir contratos, receivables, pontes e política read_own; consultar Context7. Sem migração de banco.

## 2. Consulta e autorização

- [x] 2.1 Criar schemas, queries protegidas, hooks e saldos/estados com seleção autorizada antes de filtros, opções, totais e paginação.
- [x] 2.2 Integrar owner payable em anexos somente leitura e auditoria com proteção de beneficiário/contrato/filial.

## 3. Interface

- [x] 3.1 Compor filtros, tabela/cards, menus, resumo e workspace com abas no padrão de receivables.
- [x] 3.2 Integrar rotas, navegação e related-records, preservando estado da coleção e máscaras.

## 4. Prova

- [x] 4.1 Cobrir schemas, consultas, API, read_own, anexos/auditoria e abas com Vitest; revisar convenções e documentação.
- [ ] 4.2 Executar pnpm check e depois npx tsc --noEmit; executar build e verificar layout quando ambiente permitir. Registrar resultados e limitações sem suprimir erros.

Resultados em `verification.md`. Tarefa 4.2 permanece aberta pelos 124 erros TypeScript legados; formatação, testes pertinentes e build passaram.
