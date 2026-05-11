## Why

O padrão de card list criado em `clientes` ainda não existe nas demais entidades principais, o que mantém `contratos`, `colaboradores` e `remuneracoes` presos à visualização tabular mesmo em telas menores. Isso cria uma experiência inconsistente entre listas equivalentes e deixa de reaproveitar o controller shared de alternância entre tabela e cards já introduzido no foundation.

## What Changes

- Adicionar superfícies de listagem em cards para `contracts`, `employees`, `fees` e `remunerations`, seguindo o mesmo contrato shared já usado por `clients`.
- Ajustar as rotas `/contratos`, `/colaboradores`, `/honorarios` e `/remuneracoes` para compor `EntityView.Toggle` e `EntityView`, preservando filtros, ordenação, paginação e overlays dirigidos por URL.
- Fazer o clique nos cards abrir o mesmo drawer de details já usado pelas respectivas tabelas.
- Manter ações de lifecycle, regras de permissão e escopo de visibilidade alinhados entre tabela e cards.
- Adicionar cobertura focada para garantir que as features mantenham tabela e lista como superfícies separadas, com orquestração de view mode no route file.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `entity-foundation`: o controller shared de entity view passa a ser reutilizado por múltiplas entidades principais, não apenas por clientes, consolidando a alternância global entre tabela e cards como padrão shared.
- `contract-management`: a listagem de contratos passa a oferecer uma superfície alternativa em cards, com a mesma paginação, contexto de rota e abertura de details já existentes na tabela.
- `employee-management`: a listagem de colaboradores passa a oferecer uma superfície alternativa em cards, mantendo o mesmo escopo administrativo, paginação, ações e abertura de details.
- `fee-management`: a listagem de honorários passa a oferecer uma superfície alternativa em cards, mantendo o mesmo escopo, paginação, ações e abertura de details.
- `remuneration-management`: a listagem de remunerações passa a oferecer uma superfície alternativa em cards, preservando filtros, paginação, escopo por papel e abertura de details.

## Impact

- Código afetado: `src/routes/_app/contratos.tsx`, `src/routes/_app/colaboradores.tsx`, `src/routes/_app/honorarios.tsx`, `src/routes/_app/remuneracoes.tsx`, componentes de lista nas features `contracts`, `employees`, `fees` e `remunerations`, respectivos barrels públicos e testes de contrato de view composition.
- UX afetada: usuários ganham visualização em cards consistente entre entidades principais, com mobile priorizando cards e desktop respeitando a preferência global persistida.
- Permissões e multi-tenant: sem mudança de regra; autoridade, escopo de firma e visibilidade por papel continuam derivados da sessão autenticada.
- Dependências e APIs: sem mudança de dependências externas, query params canônicos, contratos HTTP ou schema de banco.
