## Context

Os formulários de edição dos principais slices seguem um padrão híbrido: o componente suspende pelas queries de opções, mas o detalhe da entidade é carregado com `useQuery` não-suspense dentro do hook de form e só depois aplica `form.reset(...)`. Isso permite uma janela em que o modal já abriu com defaults de criação, especialmente quando as opções estão em cache e o detalhe ainda não. Além disso, os `Autocomplete` atuais dependem de a opção selecionada existir na lista carregada; quando o registro persistido aponta para uma entidade de negócio hoje inativa, a lista de opções a filtra corretamente para novos vínculos e o campo fica visualmente vazio.

## Goals / Non-Goals

**Goals:**
- Garantir que overlays de edição só renderizem campos após a hidratação do detalhe persistido.
- Manter visível no edit o valor atualmente salvo quando ele não é mais selecionável para novos vínculos.
- Preservar o contrato atual do repositório: hooks de data/form locais, query option factories em `api/queries.ts`, e opções de entidade filtradas para criação.

**Non-Goals:**
- Não permitir seleção nova de clientes, colaboradores, contratos ou receitas inativos.
- Não generalizar um framework novo de “legacy options” para todo o sistema além do escopo validado por este bug.
- Não alterar o comportamento das listas, filtros ou detalhes fora dos modais de edição.

## Decisions

### 1. Edit hydration will move to suspense-first data hooks

Os hooks de formulário de edição para `clients`, `employees`, `contracts` e `fees` passarão a consumir o detalhe via hooks feature-local com `useSuspenseQuery` quando `id` existir. Isso elimina o render inicial com defaults de criação e converge com o contrato já documentado para hidratação de overlays.

Alternativas consideradas:
- Manter `useQuery` e esconder campos até `data` existir. Rejeitado porque preserva drift entre slices e espalha condição de loading dentro do form.
- Pré-carregar detalhe no route loader. Rejeitado porque edit overlay é id-driven e route loader não conhece seleção futura.

### 2. Legacy inactive selections will be merged into edit option lists as disabled options

Para `contracts` e `fees`, queries de opções continuarão retornando apenas entidades selecionáveis para novos vínculos. No edit, o hook de opções receberá contexto opcional do detalhe atual e anexará à lista a seleção persistida quando ela não estiver presente, marcada como desabilitada e com rótulo do detalhe.

Alternativas consideradas:
- Afrouxar a query base para sempre trazer inativos. Rejeitado porque quebra a regra documentada de opções selecionáveis.
- Resolver fallback apenas no `Autocomplete`. Rejeitado porque o componente não conhece rótulo autoritativo nem semântica de desabilitação da entidade ausente.

### 3. Shared autocomplete will render disabled persisted options without special fallback branches

O componente compartilhado continuará resolvendo o valor por `options.find(...)`. A correção principal será garantir que a option list entregue ao componente contenha o item selecionado quando o form está em modo de edição. Isso mantém o componente simples e evita acoplá-lo a tipos de domínio específicos.

## Risks / Trade-offs

- [Divergência entre create e edit option hooks] → Mitigação: manter a query base intacta e adicionar merge explícito apenas no caminho de edição.
- [Opção legada parecer “válida para seleção nova”] → Mitigação: marcar sempre como desabilitada quando vier apenas por preservação do vínculo atual.
- [Mudança ampla em hooks de form afetar testes de orchestration] → Mitigação: adicionar cobertura focada em defaults de edição e em listas de opções legadas.

## Migration Plan

Sem migração de banco. Deploy pode ser direto.

Rollback:
- Reverter mudanças nos hooks de form/data e no merge de opções legadas.

## Open Questions

- Nenhuma aberta para implementação inicial; se outros slices com entidades de negócio inativas apresentarem o mesmo padrão, o próximo passo é extrair helper shared após validação repetida.
