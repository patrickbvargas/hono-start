## Context

A root route já concentra `head`, `shellComponent` e `RootDocument`, então ela é o lugar natural para também concentrar boundaries globais. Hoje várias rotas definem `errorComponent`, mas não existe um fallback global para erros não cobertos nem para rotas inexistentes.

O ajuste é arquiteturalmente simples, porém afeta experiência transversal do app inteiro e precisa manter compatibilidade com boundaries locais quando realmente necessários.

## Goals / Non-Goals

**Goals:**
- Fornecer fallback global para erro e not-found na root route.
- Garantir que estados 404/500 sempre renderizem dentro do documento compartilhado.
- Reduzir repetição desnecessária de `errorComponent` em folhas de rota.

**Non-Goals:**
- Reescrever todos os estados locais de loading/error.
- Remover boundaries específicos que encapsulem comportamento diferenciado válido.
- Introduzir uma camada paralela de tratamento fora do Router.

## Decisions

### 1. Root route será a boundary global canônica
`__root.tsx` concentrará `errorComponent` e `notFoundComponent`, embrulhados pelo mesmo documento raiz usado pelo app.

Rationale:
- É o ponto mais alto da árvore.
- Garante shell e head consistentes mesmo em falha.

Alternatives considered:
- Continuar só com boundaries por folha: mais repetição e menor previsibilidade.

### 2. Boundaries locais continuam permitidos por exceção
Rotas específicas poderão manter override local apenas quando precisarem de comportamento ou copy distintos.

Rationale:
- Mantém flexibilidade sem abrir mão do contrato global.

### 3. Not-found deve ser explícito
URLs inválidas não devem cair em erro genérico; devem ter estado próprio de rota não encontrada.

Rationale:
- Separa erro operacional de navegação inválida.

## Risks / Trade-offs

- [Boundary global conflitar com cópia local existente] → Manter overrides locais apenas onde houver diferença intencional.
- [404 renderizar fora da linguagem visual atual] → Reusar componentes compartilhados e o RootDocument.
- [Rotas antigas dependerem de errorComponent local] → Revisar cada repetição antes de removê-la.
