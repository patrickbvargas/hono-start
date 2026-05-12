## Context

A seção de anexos hoje usa uma lista manual própria, enquanto o produto já possui um wrapper accordion compartilhado usado em formulários complexos. O ajuste precisa melhorar coerência visual sem alterar dados, permissões ou fluxo de overlays já existentes. Também surgiu uma necessidade adicional: permitir ações no fim do header do item para suportar casos como exclusão sem empurrar tudo para o conteúdo expandido.

## Goals / Non-Goals

**Goals:**
- Reaproveitar um wrapper accordion compartilhado para a seção de anexos.
- Renomear o wrapper para um nome genérico coerente com uso além de formulários.
- Suportar `actions` por item no header do wrapper compartilhado.
- Manter header de anexos enxuto com apenas nome do arquivo.

**Non-Goals:**
- Não adicionar dados de autor do upload.
- Não mudar queries, mutations, storage ou permissões.
- Não redesenhar outras listas compartilhadas fora do escopo necessário.

## Decisions

### Reaproveitar wrapper compartilhado existente
O componente atual em `src/shared/components/entity-form-list.tsx` já resolve estado de accordion, chaves por item e conteúdo expansível. Em vez de criar outro wrapper paralelo, ele será renomeado para `entity-list-accordion` e continuará centralizando essa composição.

Alternativas consideradas:
- Manter nome atual e só reutilizar. Rejeitada porque o nome fica enganoso fora de formulários.
- Criar novo wrapper e manter o antigo. Rejeitada por duplicar comportamento compartilhado.

### Adicionar slot `actions` ao header compartilhado
O wrapper passará a aceitar renderização opcional de ações no header por item. Isso preserva composição controlada pelo consumidor e evita acoplar regras de negócio ao shared component.

Alternativas consideradas:
- Embutir botão de delete diretamente na seção de anexos fora do wrapper. Rejeitada porque perderia alinhamento visual com outros usos futuros.
- Colocar ações apenas no conteúdo expandido. Rejeitada porque o delete precisa ficar acessível sem exigir expansão.

### Manter ações de download e delete na seção de anexos
A seção de anexos decide quais ações aparecem. O wrapper só fornece slot visual. O header mostrará apenas nome do arquivo; metadados ficam no conteúdo aberto.

## Risks / Trade-offs

- [Ações no header podem conflitar com toggle do accordion] → Implementar área de ações fora do botão disparador e impedir nesting inválido de botões.
- [Rename do shared component pode quebrar importações atuais] → Atualizar todos os consumidores do wrapper no mesmo change e cobrir com testes.
- [Layout do header pode ficar apertado em mobile] → Manter ações compactas e conteúdo textual truncável.
