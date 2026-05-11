## Context

O projeto já introduziu um foundation shared para cards de entidade através de `DataCardList`, `EntityFields` e `EntityView`, mas esse padrão ainda está aplicado apenas à rota de clientes. `contracts`, `employees`, `fees` e `remunerations` seguem o shape canônico de lista com tabela, paginação shared e overlays id-based, então o trabalho agora é expandir a segunda superfície visual sem alterar queries, regras de acesso ou orquestração de lifecycle.

## Goals / Non-Goals

**Goals:**

- Aplicar o padrão existente de card list às quatro entidades principais restantes que já seguem o fluxo canônico de list route.
- Manter cada feature dona de sua superfície `Table` e de sua nova superfície `List`, deixando a seleção da view ativa no route file via `EntityView`.
- Reusar `EntityActions`, `EntityStatus`, `Pagination`, `formatter` e lifecycle helpers já existentes para evitar drift entre tabela e cards.
- Preservar callbacks id-based para details, edit, delete e restore em todas as superfícies.

**Non-Goals:**

- Não alterar queries, search schemas, filtros, loaders, ordenação, paginação ou permissão das rotas afetadas.
- Não redesenhar `DataCardList`, `EntityView` ou `EntityFields`.
- Não expandir o padrão para features fora de `contracts`, `employees`, `fees` e `remunerations`.
- Não criar um componente híbrido que una tabela e cards dentro do mesmo arquivo de superfície.

## Decisions

### Seguir o mesmo shape de `ClientList` em cada feature
Cada feature nova terá um `components/list/index.tsx` próprio, paralelo ao `components/table/index.tsx`, usando `DataCardList` e os mesmos callbacks id-based. Isso preserva o boundary documentado onde a feature continua dona da apresentação, enquanto a rota apenas compõe superfícies.

Alternativa considerada:
- Generalizar um builder shared para listas de cards. Rejeitada porque ainda não há repetição suficiente de campos e formatação para justificar nova abstração acima de `DataCardList`.

### Colocar `EntityView.Toggle` no header e `EntityView` no body das rotas
O padrão já existente em `clientes` mantém o toggle desacoplado da superfície renderizada. Repetir essa composição em `contracts`, `employees` e `remunerations` consolida o contrato shared de alternância de view e evita lógica ad hoc em cada feature.

Alternativa considerada:
- Trocar a superfície direto na feature ou embutir o toggle na lista. Rejeitada porque move orquestração para dentro da feature e quebra o contrato de rota declarativa.

### Manter campos dos cards derivados do summary model já usado pela tabela
Cada card usará somente dados já presentes nos modelos de lista (`ContractSummary`, `EmployeeSummary`, `Remuneration`). Isso evita novas queries, não muda o loader e mantém equivalência de informação entre tabela e cards.

Alternativa considerada:
- Enriquecer cards com dados extras carregados por detail query. Rejeitada porque mudaria custo e contrato da listagem sem necessidade.

### Cobrir o padrão com testes de composição por feature
Clientes já possuem um teste de contrato garantindo separação entre `ClientList` e `EntityView`. O mesmo padrão será replicado para `contracts`, `employees` e `remunerations`, reduzindo risco de regressão estrutural quando futuras refatorações mexerem nas rotas.

Alternativa considerada:
- Confiar apenas em testes visuais ou de runtime indiretos. Rejeitada porque a mudança principal é de composição arquitetural e boundary, não só de comportamento interativo.

## Risks / Trade-offs

- [Cards perderem equivalência de informação com tabelas] → Mitigation: derivar campos diretamente das colunas/resumos já existentes e revisar cada feature contra seu summary model.
- [Rota de remunerações ter header mais carregado por causa do export] → Mitigation: manter `RemunerationExportMenu` em `actions` do `Wrapper` e colocar apenas `EntityView.Toggle` junto ao filtro no header, como concern separado.
- [Drift entre superfícies quanto a lifecycle actions] → Mitigation: reusar os mesmos helpers `get...LifecycleActions` e `EntityActions` já usados nas tabelas.
- [Cobertura incompleta do padrão shared] → Mitigation: adicionar testes de contrato específicos por feature e executar `pnpm check` + `npx tsc --noEmit`.
