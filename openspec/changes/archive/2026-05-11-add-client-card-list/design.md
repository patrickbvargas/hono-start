## Context

A rota `clientes` segue o contrato canônico de lista com `DataTable`, filtros em URL, paginação shared e overlays orquestrados no route file. Esse formato funciona bem em desktop, mas força telas menores a consumirem uma grade tabular larga, com baixa legibilidade e pouca área clicável para abrir details. Ao mesmo tempo, `EntityDetail.Fields` já consolidou um layout consistente para pares rótulo/valor, mas esse contrato ainda estava preso ao drawer de details. Também faltava um controller shared para alternar entre superfícies mantendo tabela e cards como componentes independentes.

## Goals / Non-Goals

**Goals:**

- Introduzir uma superfície shared de listagem em cards, independente de `DataTable` e de `TanStack Table`.
- Reaproveitar o mesmo contrato visual de fields entre cards e details para manter consistência de informação.
- Ajustar a feature de clientes para alternar entre tabela e cards conforme viewport e preferência global persistida no desktop, sem alterar queries, search params, paginação, ou overlays.
- Fazer o card inteiro abrir o mesmo drawer de details já existente na rota de clientes.
- Permitir que o toggle de visualização viva em outro ponto do layout e continue sincronizado com a superfície renderizada.

**Non-Goals:**

- Generalizar a listagem em cards para todas as features neste change.
- Substituir a tabela desktop de clientes.
- Redesenhar filtros, ordenação, regras de lifecycle, permissões, ou contratos de dados da feature.
- Criar um componente híbrido que aceite `ColumnDef` e renderize tabela e card pelo mesmo pipeline.

## Decisions

### Criar `DataCardList` como componente shared separado de `DataTable`
Cards e tabelas têm contratos diferentes. `DataTable` recebe `ColumnDef`, depende de `useReactTable` e modela cabeçalhos/sort visual de tabela. A listagem em cards precisa partir de um contrato explícito de `renderFields`, `renderTitle`, `renderDescription` e `renderActions`, sem herdar semântica tabular.

Alternativa considerada:
- Adicionar um `variant="card"` em `DataTable`. Rejeitada porque mistura `TanStack Table` com renderização custom de cards e acopla dois modelos de UI distintos ao mesmo componente shared.

### Extrair `EntityFields` de `EntityDetail`
O bloco `EntityDetail.Fields` já resolve o layout de pares termo/definição com bom encaixe para cards de entidade. A extração para um shared explícito preserva o contrato visual e evita duplicar classes e skeletons em outro componente.

Alternativa considerada:
- Duplicar a implementação de fields dentro do card list. Rejeitada por aumentar drift visual entre detail e list surfaces.

### Separar superfície da feature e controller shared de visualização
A feature deve continuar dona das superfícies de tabela e cards, mas a escolha entre elas precisa virar um controller reutilizável para outras entidades. Assim, `ClientTable` permanece responsável apenas pela superfície tabular, `ClientList` permanece responsável apenas pela superfície em cards, e a rota compõe `EntityView` shared com `EntityView.Toggle` em qualquer ponto do layout.

Alternativa considerada:
- Decidir no route file qual componente renderizar. Rejeitada porque empurra detalhe de apresentação para fora da feature e enfraquece o boundary já documentado.

### Persistir escolha desktop por `localStorage` com sincronização shared
O toggle de visualização precisa poder viver em outro ponto da tela sem depender do componente que renderiza a view ativa. Para isso, o estado de preferência de visualização deve ser armazenado em uma chave global shared e sincronizado entre múltiplos consumidores através de um hook shared, enquanto o mobile continua forçando a visão em cards.

Alternativa considerada:
- Manter `useLocalStorage` como hook genérico com sincronização embutida. Rejeitada porque espalha responsabilidade específica de entity-view para um hook shared genérico em vez de concentrá-la no `useEntityViewMode`.

### Reusar `Pagination` via `footerContent`
`Pagination` já lê `page` e `limit` da URL por meio de hook shared. `DataCardList` deve expor `footerContent` igual a `DataTable` para preservar comportamento, layout e integração com as rotas existentes.

Alternativa considerada:
- Embutir paginação dentro de `DataCardList`. Rejeitada porque duplica responsabilidade e quebra o padrão shared de composição de footer.

## Risks / Trade-offs

- [Card list ficar específico demais para clientes] → Mitigation: modelar contrato shared genérico com título, descrição, fields e actions, sem labels de domínio no componente base.
- [Feature tests assumirem uso exclusivo de `DataTable`] → Mitigation: atualizar testes de boundary para aceitar a nova composição shared sem remover a exigência de padrões de lifecycle e id-based callbacks.
- [Hydration responsiva gerar troca visual entre SSR e client] → Mitigation: usar o hook mobile já existente e manter ambos os layouts semanticamente equivalentes quanto a dados, paginação e actions.
- [Ação de clique no card conflitar com botões internos] → Mitigation: isolar menu de ações em área própria e interromper propagação do clique nas ações internas.
