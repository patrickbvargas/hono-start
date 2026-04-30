## Context

As rotas de listas operacionais usam `createFileRoute`, validam search params, executam `queryClient.ensureQueryData(...)` no loader e consomem dados por hooks suspense-first. Sem `pendingComponent`, o TanStack Router segura a renderização da rota até o loader resolver, o que produz uma tela vazia antes da UI final aparecer.

O contrato do repositório pede estados de loading explícitos com skeleton-style placeholders e convergência entre telas equivalentes. Como clientes, colaboradores, contratos, honorários, remunerações e audit log compartilham o mesmo shape estrutural, a solução deve nascer em `shared/` e ser ligada nas rotas.

## Goals / Non-Goals

**Goals:**
- Exibir fallback estrutural durante o carregamento inicial das rotas de lista.
- Reaproveitar um componente compartilhado que represente o layout comum de listas.
- Preservar o padrão atual das rotas: loader, header com filtro, body com tabela e paginação.

**Non-Goals:**
- Cobrir overlays, drawers ou formulários.
- Criar skeletons específicos por feature.
- Mudar regras de dados, permissões ou estratégia de prefetch.

## Decisions

Criar um componente compartilhado de skeleton de lista em `src/shared/components`.
Rationale: padrão já se repete em várias rotas e o contrato permite extração quando o uso cruzado está provado.
Alternativa considerada: duplicar `pendingComponent` em cada rota com JSX local. Rejeitada por repetir markup e abrir drift visual.

Usar `pendingComponent` nas rotas, não `Suspense` dentro da tabela.
Rationale: problema acontece antes de a rota montar; o boundary correto é o do TanStack Router.
Alternativa considerada: skeleton dentro da tabela. Rejeitada porque não cobre o sumiço da página inteira no primeiro load.

Representar a UI final de forma genérica: action bar opcional, busca/filtro no header, cabeçalho de tabela, linhas e paginação no body.
Rationale: entrega rápida com fidelidade suficiente ao layout comum, sem complexidade por feature.
Alternativa considerada: props detalhadas por rota para espelhar cada tela. Rejeitada por custo alto e pouco ganho agora.

## Risks / Trade-offs

[Skeleton genérico não refletir exatamente todas as listas] → Manter shape canônico e aceitar pequenas diferenças visuais nesta primeira versão.

[Flicker em loads muito curtos] → Usar o `pendingComponent` padrão do router; se necessário depois, ajustar `pendingMs`/`pendingMinMs`.

[Escopo crescer para telas não canônicas] → Limitar aplicação inicial às rotas principais já alinhadas ao padrão de listas.
