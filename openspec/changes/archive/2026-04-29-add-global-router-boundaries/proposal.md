## Why

O projeto hoje repete `errorComponent` em várias rotas e ainda não define uma resposta global clara para erros não tratados e URLs não encontradas na raiz do TanStack Router. Isso espalha tratamento de falha pela árvore e deixa 404/500 sem um contrato global explícito.

## What Changes

- Adicionar boundary global de erro na root route do TanStack Router.
- Adicionar boundary global de not-found na root route.
- Definir um fallback consistente para erros e URLs não mapeadas, mantendo possibilidade de override local quando necessário.
- Reduzir repetição de tratamento de erro onde o fallback global já for suficiente.

## Non-goals

- Não redesenhar toda a linguagem visual de estados de erro do produto.
- Não substituir boundaries específicos de rota que tenham comportamento realmente distinto e justificado.
- Não alterar regras de dados, autenticação ou permissões.

## Capabilities

### New Capabilities
- `router-boundaries`: define o contrato global de erro e not-found para a árvore de rotas TanStack Router.

### Modified Capabilities
- None.

## Impact

- Affected code: `src/routes/__root.tsx`, componentes compartilhados de erro/not-found, leaves de rota que repetem boundaries.
- Affected systems: renderização de 404, tratamento de erro de rota, shell global do documento.
- User roles: todos os usuários que encontrem erro não tratado ou URL inválida.
- Multi-tenant implications: nenhuma mudança.
