# Pendências antes da produção

Revisão: 2026-10-23. Esta revisão não constitui aprovação de implantação.

## Bloqueadores de liberação

- [x] Suíte completa passou: 114 arquivos e 460 testes, tanto no projeto quanto na instalação limpa isolada.
- [x] Instalação isolada executada com frozen-lockfile e ignore-scripts; tipos e 460 testes passaram. Build final validado separadamente. Scripts de instalação não foram executados; Prisma gerado foi copiado do projeto.
- [ ] Validar interface autenticada em homologação: CRUD, filtros, paginação, exclusão/restauração, permissões Clerk, isolamento entre empresas e acesso por vínculo a contratos. Validar anexos PDF/JPG/PNG e limite de 10 MB com conta permitida e negada.
- [ ] Ensaiar migrations e seed em cópia descartável do banco e testar restauração conjunta do banco e diretório ATTACHMENTS_DIR. Não executar reset no banco real.

## Dependências e APIs

- [ ] Tratar alerta alto de `braces` transitivo do CLI shadcn quando houver versão corrigida ou substituição compatível. Auditoria consultada não fornece versão corrigida. CLI movido para devDependencies; risco continua no ambiente de desenvolvimento/build.
- [x] Override lodash@4.18.1 instalado em ambiente isolado; tipos e suíte completa passaram. Remover override quando upstream resolver versão segura.
- [ ] Completar auditoria semântica de APIs deprecated contra SDKs instalados. Busca textual não encontrou marcações próprias, mas isso não comprova ausência de chamadas depreciadas em dependências. Tentativa via API JS do TypeScript instalado não expôs `ts.sys`, impedindo essa varredura.
- [ ] Avaliar estabilidade do `nitro@3.0.260903-beta` para ambiente alvo e revisar avisos de bundling `use client`; não alterar versão sem validar compatibilidade com TanStack Start.

## Robustez e contrato

- [x] Publicação atômica sem sobrescrita implementada com hard link; teste concorrente passou no Windows fora do sandbox.
- [x] Entrega de arquivos distingue falhas operacionais (500), acesso negado (403) e arquivo ausente (404); teste de falha de disco passou.
- [x] Exclusão preserva cópia temporária em memória e tenta restaurar arquivo quando transação falha; teste passou. Falha adicional de restauração é registrada no servidor e exige recuperação pelo backup.
- [ ] Completar alinhamento de QUERY_BEHAVIOR com schemas de todas as features; filtros/sort legados de colaboradores e status de exclusão foram corrigidos nesta revisão.

## Corrigido nesta revisão

- Autorização de anexos movida de rules para api; eliminada dependência de dados em regras puras.
- Entrypoint server-only extraído do barrel para api/file-entry; barrel voltou a apenas exportar.
- Nomes legados Supabase em mocks de colaboradores substituídos por Clerk.
- Removidos TODOs imprecisos; corrigida orientação de conexão direta para migrations.
- Contrato de persistência alinhado com data/ e exceção de endpoints HTTP documentada.
- Gerador shadcn movido para desenvolvimento; lodash vulnerável substituído no lockfile.

## Evidências e limites

- `pnpm check` e `npx tsc --noEmit`: passaram após correções.
- Nenhum banco real, sessão de usuário, deploy ou configuração remota foi alterado.

Validação final: 460 testes completos passaram em instalação limpa; tipos passaram. Operações de hard link exigiram execução fora do sandbox. Não houve conexão ao banco real.
