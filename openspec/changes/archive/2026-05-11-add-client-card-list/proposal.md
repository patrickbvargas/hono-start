## Why

A rota de clientes hoje dependia apenas da superfície tabular, o que reduz usabilidade em telas menores e força a feature a tratar visualização mobile como problema da tabela. Também faltavam um contrato shared para listas em cards que preserve o mesmo fluxo de paginação, URL state e abertura de details sem misturar `TanStack Table` com renderização custom de cards, e um controller shared para alternar entre superfícies sem acoplar tabela e cards no mesmo componente de feature.

## What Changes

- Adicionar uma segunda superfície de listagem para clientes baseada em cards, voltada principalmente para mobile e também disponível como opção no desktop.
- Ajustar a rota `/clientes` para compor um controller shared que escolhe entre tabela e cards conforme o contexto responsivo e a preferência global salva em `localStorage`, preservando filtros, ordenação, paginação e overlays já dirigidos por URL.
- Fazer o clique no card abrir o mesmo drawer de details já usado pela tabela.
- Introduzir um componente shared dedicado para listas em cards paginadas, separado de `DataTable` e sem reutilizar `ColumnDef` ou estrutura interna do `TanStack Table`.
- Extrair o contrato visual de campos hoje usado em `EntityDetail.Fields` para um bloco shared reutilizável entre drawer de details e cards de listagem.
- Introduzir um `EntityView` shared com `EntityView.Toggle` para manter tabela e lista como superfícies separadas e sincronizadas.

## Non-goals

- Não substituir a tabela de clientes em desktop.
- Não alterar semântica de filtros, ordenação, search params, permissões, ou queries da feature.
- Não aplicar o layout em cards para outras rotas nesta mudança.
- Não criar uma camada híbrida onde o mesmo componente misture `TanStack Table` com renderização custom de cards.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `client-management`: a listagem de clientes passa a oferecer uma superfície alternativa em cards para mobile e desktop, mantendo paginação em URL, preferência global de visualização no desktop e abertura do drawer de details ao clicar no card.
- `entity-foundation`: os padrões shared de gestão de entidades passam a suportar uma lista em cards paginada, um contrato reutilizável de fields e um controller shared de alternância entre tabela e cards, separados da implementação de `DataTable`.

## Impact

- Código afetado: `src/routes/_app/clientes.tsx`, `src/features/clients/components/table`, `src/features/clients/components/list`, shared components ligados a listagem, paginação, fields de details e controle de visualização.
- UX afetada: usuários autenticados na rota de clientes ganham uma visualização em cards com clique direto para details, com mobile sempre em cards e desktop com alternância persistida entre tabela e cards.
- Permissões e multi-tenant: sem mudança; escopo por firma, visibilidade e lifecycle continuam derivados da sessão autenticada.
- Dependências e APIs: sem mudança de dependências externas, contrato HTTP, schema de banco, ou query params canônicos.
