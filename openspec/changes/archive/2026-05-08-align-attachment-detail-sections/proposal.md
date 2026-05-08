## Why

Os drawers de detalhes já são o contexto canônico para trabalho com entidades, mas a seção de anexos ainda não está alinhada com esse padrão em todas as entidades suportadas. Isso cria inconsistência visual, quebra a expectativa do fluxo documentado de anexos e deixa os estados de carregamento menos precisos do que o restante dos detalhes.

## What Changes

- Alinhar a seção de anexos ao mesmo tratamento visual de títulos usado nas seções de detalhes.
- Exibir a seção de anexos diretamente nos drawers de detalhes de cliente, colaborador e contrato.
- Ajustar o loading da seção de anexos para usar skeletons consistentes com o restante do drawer.
- Atualizar os skeletons dos drawers de detalhes afetados para refletir a nova seção de anexos sem deslocamentos visuais.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `attachment-management`: a listagem de anexos em contextos suportados passa a exigir seção visual alinhada aos drawers de detalhes e loading por skeleton.
- `client-management`: o drawer de detalhes do cliente passa a incluir a seção de anexos no fluxo padrão.
- `contract-management`: o drawer de detalhes do contrato passa a incluir a seção de anexos no fluxo padrão.
- `employee-management`: o drawer de detalhes do colaborador passa a incluir a seção de anexos no fluxo padrão.

## Impact

- Código afetado em `src/features/attachments`, `src/features/clients`, `src/features/contracts` e `src/features/employees`.
- Ajustes em testes de contrato visual/composicional e validação dos barrels públicos já existentes.
- Sem mudanças de API externa, dependências, banco de dados ou migrações.

## Non-goals

- Não alterar regras de permissão, upload, exclusão ou armazenamento de anexos.
- Não introduzir uma nova abstração compartilhada fora do padrão já existente em `EntityDetail` e `SectionTitle`.
- Não expandir anexos para entidades fora de cliente, colaborador e contrato.
