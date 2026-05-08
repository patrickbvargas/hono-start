## Why

Fluxo atual de upload de anexo exige que usuário escolha um tipo e depois selecione um arquivo, mesmo quando o sistema já consegue inferir esse tipo pelo arquivo. Isso adiciona atrito desnecessário, aumenta chance de erro e destoa do fluxo de upload documentado, no qual usuário apenas seleciona um arquivo suportado.

## What Changes

- Substituir a seleção manual de tipo de anexo por um campo visual de arquivo com CTA e área de drop alinhados ao padrão desejado.
- Fazer o fluxo de upload identificar automaticamente o tipo do anexo a partir do arquivo selecionado.
- Introduzir um componente compartilhado `file.tsx` em `src/shared/components/form` para uso com `useAppForm` e valor `File | null`.
- Ajustar validação e submissão do attachment para derivar metadados do arquivo sem depender de lookup selecionado manualmente.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `attachment-management`: o upload passa a aceitar um único gesto de seleção de arquivo e o sistema identifica automaticamente o tipo suportado antes da persistência.

## Impact

- Código afetado em `src/shared/components/form`, `src/shared/hooks/use-app-form`, `src/features/attachments` e testes relacionados de formulário, queries e mutações.
- Remoção de dependência do lookup de tipos de anexo no fluxo de upload da UI.
- Sem mudanças de API externa, banco de dados, migrações ou dependências novas.

## Non-goals

- Não alterar permissões, owner context, storage backend ou regras de exclusão de anexos.
- Não ampliar tipos suportados além de `PDF`, `JPG` e `PNG`.
- Não redesenhar outros campos de formulário além do novo componente compartilhado de arquivo.
