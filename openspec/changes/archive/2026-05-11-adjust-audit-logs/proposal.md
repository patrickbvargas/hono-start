## Why

O audit log ainda foge do contrato principal do produto em três pontos relevantes: a rota usa a exceção `/audit-log`, a tela não oferece visualização em cards como as demais entidades e o conteúdo exibido ao usuário mistura inglês com pt-BR. Isso aumenta drift de navegação, reduz consistência visual e enfraquece a clareza operacional da trilha de auditoria.

## What Changes

- Ajustar a rota autenticada de auditoria para `/_app/auditoria`, com URL final `/auditoria`.
- Alinhar a tela de auditoria ao contrato de visualização das entidades, adicionando `EntityView` com `DataCardList` e toggle entre cards e tabela.
- Traduzir para pt-BR os labels exibidos no audit log, incluindo tipos de entidade e descrições, mantendo os códigos de ação `CREATE`, `UPDATE`, `DELETE` e `RESTORE` como exceção operacional.
- Atualizar navegação, testes e documentação que ainda referenciam o caminho anterior.

## Capabilities

### New Capabilities

- `audit-log-localization`: Exibir auditoria com labels e descrições em pt-BR sem alterar os códigos operacionais de ação.

### Modified Capabilities

- `audit-log-management`: A rota e a apresentação da listagem de auditoria passam a seguir o mesmo contrato visual e de navegação das demais entidades.

## Impact

- Código afetado: `src/routes/_app`, `src/shared/config/routes.ts`, `src/features/audit-logs/**`, testes de rota/contrato e documentação de rotas.
- APIs e persistência: sem migração de banco; o ajuste principal ocorre na camada de leitura/apresentação.
- Papéis afetados: administradores, únicos usuários autorizados a acessar auditoria.
- Multi-tenant: sem mudança; a listagem continua escopada por `firmId`.

## Non-goals

- Não alterar a política de acesso do audit log.
- Não reescrever registros históricos persistidos no banco.
- Não mudar o contrato interno dos valores de ação usados para filtro e auditoria.
