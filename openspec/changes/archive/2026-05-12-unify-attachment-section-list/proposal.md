## Why

A seção de anexos já funciona, mas hoje usa uma lista manual com tratamento visual diferente do restante dos blocos expansíveis do produto. Isso aumenta a inconsistência visual nas drawers de detalhe e dificulta reaproveitar a mesma composição de cabeçalho e ações em outras listas compactas.

## What Changes

- Substituir a lista manual da seção de anexos por um wrapper accordion compartilhado.
- Renomear o shared wrapper para um nome genérico que reflita uso além de formulários.
- Exibir no cabeçalho de cada anexo apenas o nome do arquivo.
- Exibir os metadados do anexo apenas quando o item estiver aberto.
- Permitir ações no fim do cabeçalho do item por meio de uma prop compartilhada `actions`.

## Capabilities

### New Capabilities
- `entity-list-accordion`: wrapper accordion compartilhado para listas de entidades com cabeçalho, conteúdo expansível e ações no header.

### Modified Capabilities
- `attachment-management`: a listagem de anexos em detalhes passa a usar accordion compartilhado com nome do arquivo no cabeçalho e metadados no conteúdo expandido.

## Impact

- Shared UI em `src/shared/components`.
- Seção de anexos em `src/features/attachments/components/section`.
- Testes de shared component e da seção de anexos.
- Sem mudança de API externa, storage, modelo de dados ou regras de permissão.

## Non-goals

- Não adicionar metadado de autor do upload na UI.
- Não alterar regras de upload, download, exclusão ou permissões.
- Não introduzir nova fonte de dados ou migration para anexos.
