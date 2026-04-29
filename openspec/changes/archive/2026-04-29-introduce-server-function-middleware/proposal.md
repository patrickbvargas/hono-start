## Why

O projeto já usa `createServerFn` extensivamente, mas ainda não tem uma camada padrão para concerns transversais como autenticação protegida, injeção de sessão, auditoria básica ou contexto comum. Sem middleware, cada feature tende a repetir wiring de sessão e verificação em handlers isolados, o que aumenta drift e dificulta evolução consistente.

## What Changes

- Introduzir middleware canônico para server functions TanStack Start onde houver concern transversal claro.
- Padronizar um caminho para server functions protegidas receberem contexto autenticado antes de entrar na lógica da feature.
- Definir limites de uso: middleware para concerns compartilhados, feature handlers para regras de domínio e mensagens locais.
- Preparar terreno para logging, auditoria e headers comuns sem espalhar plumbing por todas as features.

## Non-goals

- Não migrar imediatamente toda server function do projeto para middleware.
- Não mover regras de negócio, validação de domínio ou mensagens pt-BR das features para camada genérica.
- Não substituir BetterAuth, Prisma, nem os helpers atuais de sessão protegida no servidor.

## Capabilities

### New Capabilities
- `server-function-middleware`: define como server functions protegidas recebem contexto transversal compartilhado antes da lógica específica da feature.

### Modified Capabilities
- None.

## Impact

- Affected code: `src/shared/**` ligado a sessão/servidor, `createServerFn` protegidas em features, possíveis wrappers ou factories de middleware.
- Affected systems: TanStack Start server functions, autenticação protegida no servidor, futuro logging/auditoria.
- User roles: todos os usuários que executarem operações protegidas; impacto funcional esperado é neutro.
- Multi-tenant implications: escopo de firma continua vindo da sessão autenticada e passa a ter um ponto mais consistente de injeção.
