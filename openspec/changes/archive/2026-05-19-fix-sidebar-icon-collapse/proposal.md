## Why

O sidebar autenticado hoje fecha em modo off-canvas no desktop, então navegação principal desaparece em vez de encolher para modo compacto com ícones. Isso quebra expectativa de uso do shell e contraria comportamento suportado pelo componente `Sidebar` do shadcn/ui e pelo contrato atual de navegação colapsada.

## What Changes

- Ajustar shell autenticado para usar colapso desktop em modo `icon` no `Sidebar` compartilhado.
- Garantir que itens de navegação continuem visíveis por ícone quando sidebar estiver colapsado.
- Manter grupos, branding e footer com comportamento compacto consistente, escondendo apenas texto que não cabe no modo colapsado.
- Cobrir comportamento com testes focados em configuração do sidebar e renderização de navegação no estado colapsado.

## Non-goals

- Não redesenhar estrutura de rotas, taxonomia de navegação ou ordem das seções.
- Não alterar comportamento mobile em drawer.
- Não introduzir nova biblioteca de navegação ou novos componentes fora da camada compartilhada existente.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `app-layout`: refinar requisito de colapso desktop para usar modo compacto baseado no sidebar compartilhado, preservando navegação acessível durante colapso.
- `sidebar-nav`: explicitar que colapso desktop deve manter ícones de rotas visíveis mesmo quando rótulos e cabeçalhos de grupo forem ocultados.

## Impact

- Affected specs: `openspec/specs/app-layout/spec.md`, `openspec/specs/sidebar-nav/spec.md`
- Affected code: `src/routes/_app/route.tsx`, `src/features/app-sidebar/components/*.tsx`, shared sidebar composition usage
- Dependencies: comportamento documentado do `Sidebar` do shadcn/ui com `collapsible="icon"`
- User roles: todos usuários autenticados que usam shell principal
- Multi-tenant: nenhum impacto em isolamento ou dados; mudança somente de navegação e layout
