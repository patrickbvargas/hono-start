## Context

O feature `audit-logs` já possui listagem, filtros e escopo administrativo corretos, mas ainda usa uma rota excepcional (`/audit-log`) e só renderiza tabela. Além disso, `entityType` e `description` são persistidos em inglês nos writes de várias features, o que vaza para a interface apesar do contrato exigir UI em pt-BR.

## Goals / Non-Goals

**Goals:**

- Padronizar a rota autenticada para `/_app/auditoria` com URL `/auditoria`.
- Reaproveitar o padrão existente de `EntityView` para suportar cards e tabela na auditoria.
- Traduzir labels exibidos do audit log na leitura, preservando os valores persistidos e o filtro por códigos estáveis.
- Atualizar documentação e testes para o novo caminho.

**Non-Goals:**

- Não introduzir nova estrutura de persistência para auditoria.
- Não alterar o mecanismo de criação dos audit logs nas mutações de outras features.
- Não traduzir os códigos de ação usados como valor de filtro.

## Decisions

### 1. Traduzir auditoria na camada de leitura

Os registros já persistem `entityType` e `description` em inglês em múltiplas mutações. Reescrever cada write e retrocompatibilizar dados históricos aumentaria risco e escopo. A decisão é mapear labels pt-BR no `data/queries.ts`, expondo ao frontend valores amigáveis sem mudar o dado persistido.

Alternativas consideradas:

- Traduzir apenas writes novos: rejeitada porque manteria histórico misto.
- Migrar dados históricos: rejeitada por custo e risco desnecessários.

### 2. Manter `action` como valor operacional

O pedido explicitamente preserva `CREATE/UPDATE/DELETE` como exceção. A interface continuará exibindo esses códigos como valor principal de ação, inclusive nos filtros.

Alternativas consideradas:

- Traduzir ações na UI e manter código interno oculto: rejeitada porque contraria o pedido e perderia o valor operacional atual.

### 3. Aplicar contrato de `EntityView` já usado por outras entidades

Em vez de trocar tabela por cards, a auditoria ganhará `AuditLogList` e `EntityView.Toggle`, seguindo o mesmo padrão de clientes, contratos, honorários e remunerações.

Alternativas consideradas:

- Renderizar só cards: rejeitada porque seria outra exceção visual.
- Embutir responsividade no próprio componente de lista/tabela: rejeitada porque o contrato do repositório já centraliza isso em `EntityView`.

## Risks / Trade-offs

- [Risk] Descrições antigas podem não seguir um formato totalmente uniforme. → Mitigation: gerar descrição exibida a partir de `action`, `entityType`, `entityName` e `changeData`, com fallback seguro para o texto persistido.
- [Risk] Rename de rota pode deixar referências antigas em testes e geração de rotas. → Mitigation: atualizar referências textuais do caminho e validar com `pnpm check`, `tsc` e testes focados.
- [Risk] Ordenação por tipo passa a ordenar pelo valor persistido em inglês, não pelo label pt-BR. → Mitigation: manter ordenação estável atual; não há mudança contratual de sorting localizável neste ajuste.
