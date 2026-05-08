## Context

O upload de anexos hoje usa um `Autocomplete` para `type` e um `input type="file"` separado, embora o próprio schema já saiba inferir o tipo a partir de `fileName` e `mimeType`. Isso cria duplicidade entre UI e validação, mantém um hook de opções só para attachment types e dificulta reaproveitar um campo de arquivo consistente em outros formulários.

## Goals / Non-Goals

**Goals:**
- Criar um componente compartilhado de arquivo compatível com `createFormHook` e `useFieldContext`.
- Fazer o formulário de attachment trabalhar com `File | null` no campo visual e derivar `type`, `fileName`, `mimeType`, `fileSize` e `fileBase64` antes do submit.
- Remover a seleção manual de tipo da experiência do usuário sem mudar o contrato persistido do servidor.
- Preservar validações de tipo e tamanho com mensagens pt-BR.

**Non-Goals:**
- Mudar o modelo Prisma ou a tabela de attachment types.
- Refatorar todos os formulários para o novo campo de arquivo no mesmo trabalho.
- Alterar o formato persistido do payload do upload no server boundary.

## Decisions

### Registrar um `FormFile` compartilhado no `useAppForm`
O novo campo viverá em `src/shared/components/form/file.tsx` e seguirá o mesmo padrão de `input.tsx`: `useFieldContext<T>()`, `FieldWrapper`, metadados de erro/blur e registro em `createFormHook`. Isso preserva a API atual de `<field.X />` e mantém tipagem do TanStack Form.

Alternativas consideradas:
- Manter implementação inline no formulário de attachment: rejeitado por repetir integração com TanStack Form e impedir reuse.
- Criar um wrapper fora do sistema de `createFormHook`: rejeitado por quebrar o padrão documentado de shared form primitives.

### Tratar `File | null` como estado visual e manter payload serializável no submit
O componente compartilhado controlará apenas o valor `File | null`. O hook `useAttachmentForm` continuará submetendo o shape serializável já aceito pelo server boundary, convertendo o arquivo para base64 e inferindo `type` imediatamente antes de validar/submeter.

Alternativas consideradas:
- Alterar schema de upload para aceitar `File`: rejeitado porque `File` não atravessa o server boundary atual e complicaria o contrato já testado.
- Espalhar metadados do arquivo em múltiplos campos desde o `onChange`: rejeitado por duplicar estado derivado durante edição.

### Inferir tipo por helper único reutilizado entre schema e hook
A inferência de tipo por `mimeType` e extensão será extraída para helper exportado no módulo de schema do attachment. O schema usará esse helper para validar o payload serializável e o hook o usará para montar `type` antes do submit, evitando drift entre UI e validação.

Alternativas consideradas:
- Duplicar lógica de inferência no hook e no schema: rejeitado por risco de divergência.
- Resolver tipo somente no backend: rejeitado porque removeria feedback imediato de validação no formulário.

## Risks / Trade-offs

- [Componente de arquivo ficar acoplado ao caso de attachment] → manter API genérica (`File | null`, `accept`, textos configuráveis) e lógica de metadados fora dele.
- [Conversão para base64 atrasar submissão perceptivelmente] → conversão ocorrer apenas no submit e para arquivos limitados a 10 MB.
- [Remoção do hook de opções quebrar testes de boundary] → atualizar testes focados que hoje exigem `useAttachmentOptions`.

## Migration Plan

Sem migração de banco ou rollout incremental. Mudança local de UI, hook e testes.

## Open Questions

- Nenhuma para esta implementação.
