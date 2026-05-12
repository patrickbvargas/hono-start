## 1. Shared accordion wrapper

- [x] 1.1 Renomear o shared wrapper de `entity-form-list` para `entity-list-accordion` e atualizar imports consumidores existentes.
- [x] 1.2 Adicionar suporte opcional a `actions` no header do wrapper preservando semântica válida do accordion.

## 2. Attachment section

- [x] 2.1 Migrar a seção de anexos para usar o wrapper compartilhado com nome do arquivo no header e metadados no conteúdo expandido.
- [x] 2.2 Posicionar ações de download e delete de anexo usando o novo slot de `actions` do header conforme permissão.

## 3. Verification

- [x] 3.1 Atualizar ou adicionar testes focados do wrapper compartilhado e da seção de anexos.
- [x] 3.2 Rodar `pnpm check` e `npx tsc --noEmit`, corrigindo eventuais erros relacionados antes de concluir.
