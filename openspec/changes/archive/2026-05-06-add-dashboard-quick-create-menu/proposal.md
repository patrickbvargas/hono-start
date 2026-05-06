## Why

O dashboard ja e rota de entrada autenticada, mas hoje obriga usuario a navegar para outra lista antes de iniciar cadastros comuns. Isso aumenta friccao em fluxos operacionais repetidos e contradiz expectativa do produto de usar overlays como ponto principal de trabalho.

## What Changes

- Add acao `Novo` no cabecalho do dashboard.
- Open dropdown no dashboard com atalhos de criacao para entidades suportadas.
- Permitir abrir modais de criacao de cliente, contrato, honorario e colaborador diretamente do dashboard.
- Restringir itens do menu conforme permissao da sessao, mantendo colaborador disponivel apenas para administradores.
- Manter remuneracoes, anexos e receitas fora desse menu por dependerem de regras ou contexto adicional.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `dashboard`: o dashboard passa a expor um menu de criacao rapida no cabecalho com overlays de cadastro alinhados ao modelo de permissao da sessao.

## Impact

- Affected code: `src/routes/_app/index.tsx`, barrels e componentes/formularios consumidos no dashboard, testes de rota/dashboard.
- APIs: nenhuma API nova; reuso de query options e mutation/form hooks existentes.
- Dependencies: nenhuma dependencia nova.
- Systems: UI do dashboard, orquestracao de overlays locais e regras de visibilidade por sessao.

## Non-goals

- Nao transformar dashboard em lista CRUD completa.
- Nao adicionar criacao direta de remuneracoes, anexos ou receitas avulsas.
- Nao alterar regras de autorizacao existentes nem fluxo interno de cada formulario.
