## Context

Shell autenticado já usa camada compartilhada de `Sidebar`, mas `AppSidebar` monta componente sem `collapsible="icon"`. Com isso, toggle desktop segue comportamento `offcanvas`, escondendo painel inteiro. `NavMain` já usa `SidebarMenuButton` com ícones e também já oculta `SidebarGroup` em modo `icon`, então base necessária para navegação compacta existe, mas composição atual não ativa modo correto do shadcn/ui.

Doc oficial do shadcn/ui para `Sidebar` define `collapsible="icon"` como modo que colapsa para ícones, enquanto `offcanvas` desliza painel para fora da tela. A mesma doc mostra `SidebarMenuButton` com ícone + `span` de rótulo e recomenda esconder grupos inteiros via `group-data-[collapsible=icon]:hidden` apenas quando desejado.

## Goals / Non-Goals

**Goals:**

- Ativar comportamento desktop de colapso para ícones no shell autenticado.
- Preservar navegação principal acessível no estado colapsado.
- Manter composição existente via camada compartilhada `@/shared/components/ui`.
- Cobrir bug com testes pequenos e estáveis no feature slice do sidebar.

**Non-Goals:**

- Reestruturar seções de navegação.
- Alterar drawer mobile.
- Reescrever componente compartilhado `src/shared/components/ui/sidebar.tsx`.

## Decisions

### Use `collapsible="icon"` at `AppSidebar`

`AppSidebar` passará `collapsible="icon"` ao `Sidebar`. Razão: comportamento desejado já existe no shared UI local e é padrão documentado pelo shadcn/ui. Alternativa rejeitada: criar estado manual `isCollapsed` e classes próprias no feature. Isso duplicaria lógica já centralizada em `useSidebar` e abriria desvio do vendor pattern.

### Keep route items inside `SidebarMenuButton`

Navegação principal continuará usando `SidebarMenuButton` com ícone e rótulo no `Link`. Razão: shared sidebar já aplica classes para encolher botão para `size-8` e preservar `svg` em modo `icon`. Alternativa rejeitada: renderizar lista separada para modo compacto. Isso criaria duas árvores de navegação e mais risco de drift entre estados expandido e colapsado.

### Hide only non-essential text in collapsed mode

Cabeçalhos de grupo e textos de branding/usuário podem permanecer escondidos em modo `icon`, mas botões acionáveis precisam continuar visíveis. Razão: doc do shadcn/ui suporta esconder grupos inteiros ou textos específicos com seletor `group-data-[collapsible=icon]`, preservando affordance visual mínima. Alternativa rejeitada: esconder `NavMain` inteiro no colapso, porque isso reproduz bug atual.

### Add regression tests at feature boundary

Testes devem verificar que `AppSidebar` ativa modo `icon` e que `NavMain` não suprime `SidebarMenuItem` no estado compacto. Razão: bug nasce em composição do feature, não no shared primitive. Alternativa rejeitada: testar somente snapshot visual amplo do layout, porque seria mais frágil e menos focado.

## Risks / Trade-offs

- Estado compacto pode deixar header/footer visualmente apertados → ajustar apenas textos auxiliares e manter alvos clicáveis com tamanhos do shared sidebar.
- Testes podem acoplar a classes internas do shared UI → preferir assert em props/estrutura renderizada e seletor `data-sidebar`, não em detalhes visuais excessivos.
- Algumas seções hoje usam `group-data-[collapsible=icon]:hidden` no container inteiro → revisar para esconder apenas label estrutural, não navegação essencial.

## Migration Plan

Sem migração de dados. Deploy normal de frontend. Rollback simples: restaurar `collapsible` anterior caso compacto introduza regressão visual inesperada.

## Open Questions

- Nenhuma aberta no momento; doc do shadcn/ui e contrato local já convergem no comportamento desejado.
