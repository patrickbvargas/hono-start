## Context

O componente compartilhado `src/shared/components/pagination.tsx` já deriva `page` e `limit` do URL state via `useSearch` do TanStack Router. O resumo textual adicionado recentemente, porém, mostra apenas a quantidade de itens da página atual e não a faixa absoluta dentro do total, o que faz o texto permanecer igual em várias páginas cheias consecutivas mesmo quando o `page` muda.

Trata-se de uma mudança transversal de UI compartilhada: várias listas de features reutilizam o mesmo componente de paginação, então o ajuste precisa acontecer uma vez no componente compartilhado e continuar alinhado ao contrato de paginação orientada por URL.

## Goals / Non-Goals

**Goals:**
- Tornar o resumo textual da paginação dependente do `page` e do `limit` atuais.
- Exibir uma faixa absoluta compreensível, como `Exibindo 26-50 de 100 registros`.
- Preservar a navegação, o seletor de page size e o contrato atual de URL state.

**Non-Goals:**
- Não alterar a estratégia de busca/paginação no backend.
- Não redesenhar o layout da paginação além do necessário para manter o resumo ao lado dos controles.
- Não introduzir estado local espelhado para a paginação.

## Decisions

### Derivar a faixa diretamente do URL state atual
O resumo será calculado a partir de `page`, `limit` e `totalRecords` já expostos ao componente. Isso mantém a UI reativa ao search state atual e evita duplicar estado local.

Alternativas consideradas:
- Reusar a contagem atual da página: rejeitado, porque não informa progresso entre páginas cheias.
- Passar `start` e `end` do backend: rejeitado, porque a faixa já pode ser derivada localmente com os dados existentes.

### Mostrar faixa absoluta em vez de contagem da página
O texto passará de `Exibindo x de y registros` para `Exibindo a-b de y registros`, onde:
- `a = (page - 1) * limit + 1`
- `b = min(page * limit, totalRecords)`

Alternativas consideradas:
- Mostrar `Página N de M`: rejeitado, porque isso duplica a navegação e não informa quantos registros do total estão visíveis.
- Mostrar ambos contagem e faixa: rejeitado por aumentar ruído visual sem benefício claro.

### Manter listas vazias sem resumo
O componente continuará retornando `null` quando `totalRecords === 0`, preservando o comportamento atual de não renderizar paginação para listas vazias.

Alternativas consideradas:
- Renderizar `Exibindo 0 de 0 registros`: possível, mas fora do escopo porque mudaria o comportamento vazio atual.

## Risks / Trade-offs

- [Texto mais longo em telas menores] → Mitigado mantendo o layout responsivo já existente e sem adicionar novos controles.
- [Página fora do intervalo por URL manual] → Mitigado pelo cálculo com `min` e pelo contrato existente de paginação validada no search state.
- [Mudança compartilhada afeta múltiplas listas] → Mitigado centralizando a alteração no componente compartilhado e validando tipagem/contratos.
