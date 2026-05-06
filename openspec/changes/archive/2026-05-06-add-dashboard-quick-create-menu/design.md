## Context

O dashboard ja usa `Wrapper` e compoe filtros e superficies analiticas pela rota [src/routes/_app/index.tsx](/C:/Dev/hono-start/src/routes/_app/index.tsx). Os fluxos de criacao de clientes, contratos, honorarios e colaboradores ja existem como overlays locais nas rotas de lista, com formularios e hooks reutilizaveis expostos pelos respectivos barrels. A mudanca cruza a rota do dashboard com quatro features, mas nao exige novas APIs nem mudanca de schema de dados.

## Goals / Non-Goals

**Goals:**
- Adicionar acao `Novo` no cabecalho do dashboard.
- Permitir abrir overlays de criacao diretamente do dashboard usando os formularios ja existentes.
- Mostrar apenas entidades compativeis com a permissao da sessao atual.
- Preservar ownership: a rota compoe UI e overlays; as features continuam donas de formularios, hooks e mutacoes.

**Non-Goals:**
- Criar novo registry global de modais.
- Duplicar logica de formulario dentro do dashboard.
- Alterar regras server-side de autorizacao, queries ou mutacoes.
- Expor criacao direta de remuneracoes, anexos ou receitas avulsas.

## Decisions

- Implementar o menu `Novo` diretamente em [src/routes/_app/index.tsx](/C:/Dev/hono-start/src/routes/_app/index.tsx).
  Rationale: a rota ja e boundary de composicao e pode consumir multiplas features sem inverter dependencias.
  Alternative considered: mover para `src/features/dashboard`. Rejeitado porque faria a feature `dashboard` depender diretamente das internals de `clients`, `employees`, `contracts` e `fees`.

- Reusar `DropdownMenu` de `@/shared/components/ui` como trigger das acoes.
  Rationale: segue boundary de shared UI e padrao ja usado no app.
  Alternative considered: quatro botoes inline no header. Rejeitado por ocupar espaco demais e perder escalabilidade.

- Manter um `useOverlay<EntityId>()` separado para cada entidade criada pelo dashboard.
  Rationale: cada hook continua route-local, simples e totalmente compativel com o contrato atual de overlay.
  Alternative considered: criar um overlay polimorfico unico para varias entidades. Rejeitado porque exigiria nova abstracao compartilhada sem necessidade funcional.

- Filtrar itens do menu por permissao de sessao antes de renderizar o dropdown.
  Rationale: melhora UX sem substituir enforcement server-side existente.
  Alternative considered: renderizar todos itens e deixar falha ocorrer ao abrir/submeter. Rejeitado por expor affordances invalidas.

## Risks / Trade-offs

- Mais overlays montados na rota podem deixar o arquivo do dashboard mais verboso → Mitigacao: manter toda orquestracao no corpo da rota e reusar componentes/forms existentes sem logica duplicada.
- Usuario regular pode ver item de honorario mesmo sem contratos elegiveis → Mitigacao: formulario e option queries continuam escopados; ausencia de contratos validos resulta em estado vazio, nao em bypass de permissao.
- Reuso de formularios fora da rota original pode depender de queries nao prefetched → Mitigacao: os forms ja carregam suas proprias option queries via hooks suspense/query locais.
