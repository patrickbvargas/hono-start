## Context

O projeto já trata search state como fonte canônica de filtros, paginação e ordenação. Isso é bom e está alinhado com o TanStack Router. O ponto pendente é higiene da URL: vários parâmetros continuam aparecendo mesmo quando equivalem ao estado inicial validado pela própria rota.

Como as telas já usam schemas com defaults seguros, a melhoria natural é usar `stripSearchParams` para que a URL represente apenas desvios do default. O esforço cruza várias rotas, mas não altera comportamento de dados.

## Goals / Non-Goals

**Goals:**
- Remover parâmetros default redundantes das URLs das rotas com search state validado.
- Preservar a restauração correta de estado em refresh e compartilhamento.
- Manter uma forma única de definir defaults por rota.

**Non-Goals:**
- Implementar retenção automática de search entre rotas distintas.
- Mudar as regras de reset de filtros.
- Reescrever todos os hooks compartilhados de navegação neste mesmo change.

## Decisions

### 1. Canonicalização será feita no nível da rota
Cada rota com `validateSearch` e defaults conhecidos poderá declarar `search.middlewares` com `stripSearchParams`.

Rationale:
- É o ponto nativo do Router para transformação da query string.
- Evita espalhar limpeza de URL por componentes e hooks.

Alternatives considered:
- Limpar params manualmente nos hooks de filtro/paginação: mais repetição e mais chance de drift.
- Não canonicalizar: mantém comportamento atual, mas conserva ruído.

### 2. Defaults precisam ser explícitos e reaproveitáveis
Sempre que possível, a rota usará um objeto de defaults explícito compatível com o schema para que `stripSearchParams` compare contra a mesma fonte de verdade do estado inicial.

Rationale:
- Evita inconsistência entre schema, UI reset e middleware.

Alternatives considered:
- Duplicar literals inline em cada middleware: simples, mas propenso a drift.

### 3. Só parâmetros default serão removidos
Parâmetros não-default permanecerão na URL. O change não altera o shape validado dos schemas.

Rationale:
- Mantém compartilhamento e reload intactos.
- Limita escopo a higiene da URL.

## Risks / Trade-offs

- [Defaults duplicados entre schema e middleware] → Extrair ou centralizar objetos default por rota quando necessário.
- [Mudança de URL quebrar testes frágeis] → Atualizar testes de navegação e search state para validar canonicalização.
- [Rotas sem defaults claros ficarem inconsistentes] → Aplicar middleware apenas onde o estado default estiver explicitamente documentado e validado.
