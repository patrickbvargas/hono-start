## Context

O repositório já tem um pattern consolidado para entidades operacionais: rota autenticada fina, slice própria em `src/features/<feature>`, busca validada via URL, tabela/lista paginada, modal para create/edit, drawer para details, e confirmações separadas para delete/restore. `clientes` é a referência principal, e `honorarios` é a referência mais próxima do contexto financeiro.

`Despesas` precisa entrar nesse mesmo shape, mas com uma diferença importante: ao contrário de `Honorários`, a despesa não nasce de um contrato nem herda visibilidade por assignment. É uma saída financeira da firma como um todo. Isso afeta modelagem, autorização e integração com anexos.

Também existe um requisito funcional adicional: o drawer de detalhes deve conter uma seção de anexos. Hoje `Attachment` suporta apenas `client`, `employee`, e `contract` como owner context. Para atender `Despesas` sem criar um segundo sistema de arquivos, o correto é expandir a capability já existente.

Para uma nova sessão conseguir implementar sem reler toda a conversa, o contrato desta change precisa deixar explícitos os pontos que normalmente ficam espalhados em `clientes` e `honorarios`: shape da rota, search params, sort default, colunas esperadas, campos do form, sections do drawer, owner-context de anexos e docs canônicos que precisam ser atualizados junto.

## Goals / Non-Goals

**Goals:**

- Introduce a first-class `expenses` feature slice following the documented schema-first workflow and the `clients` reference anatomy.
- Add a standalone `/despesas` route with URL-driven list state, modal create/edit flows, details drawer, and lifecycle confirmations.
- Persist expense records with stable expense-category selection, firm scoping, active state, soft-delete lifecycle, and audit coverage.
- Reuse the shared attachment section inside expense details by extending owner-context support to `expense`.
- Keep room for future cash-flow reporting without forcing that reporting scope into the first CRUD release.

**Non-Goals:**

- Build dashboards, charts, or reconciliations for income minus expenses in this change.
- Infer or distribute expenses across collaborators, contracts, or legal areas.
- Introduce a second bespoke pattern for financial entities outside the existing route + slice + overlay contract.

## Decisions

### D1. Expense is a standalone firm-scoped financial entity, not a child of contract or fee

The requested fields (`categoria`, `data`, `valor`, `observação`) and the provided category catalog describe a firm-level operational expense, not a contract financial event. The first version should therefore model `Expense` as its own entity under the tenant boundary, with no required contract, client, revenue, or employee foreign key.

Why:

- The business request is to control outflows of the firm, not contract-linked deductions.
- This keeps the first version aligned with the stated goal of future cash-flow visibility.
- It avoids inventing fake parent links just to reuse an existing financial feature.

Alternative considered:

- Attach every expense to a contract or client.
  Rejected because the current requirement does not define such a relationship and it would create artificial validation complexity.

### D2. Expense categories should be seeded stable lookup data, not local enums

The repository contract already prefers lookup-backed categorical values at the application boundary. Even though the current expense categories are known up front, they should still be seeded as a stable catalog resolved by `value` and displayed by pt-BR `label`.

Why:

- It matches the existing lookup strategy used throughout the product.
- It keeps form options, filters, and persisted values stable across environments.
- It allows future category activation/deactivation without redesigning the feature boundary.

Alternative considered:

- Hard-code categories in the form component or in a TypeScript enum only.
  Rejected because it drifts from the repository lookup strategy and makes future category lifecycle changes harder.

### D3. Expense access should default to administrator-only until a broader role rule is documented

Unlike fees, expenses do not inherit visibility from contract assignments. The existing domain docs also state that financial visibility is role-sensitive and that regular users should not gain broad firm-wide confidential financial access by default. The safest first contract is therefore to make the route and mutations administrator-scoped.

Why:

- It preserves the product identity around role-aware financial visibility.
- It avoids exposing all firm outflows to regular users without a documented business rule.
- It keeps the first implementation secure by default.

Alternative considered:

- Let all authenticated users list and edit expenses.
  Rejected because the current role model does not justify broad firm-wide expense visibility.

Open question:

- If the business wants a scoped non-admin expense workflow later, what rule defines that scope?

### D4. Expense details should reuse `AttachmentSection` by extending attachment owner context to `expense`

The user explicitly wants the details drawer to contain an attachment section. The existing attachment capability already solves upload, listing, deletion, storage, and permission checks. Expense details should therefore reuse `AttachmentSection` instead of building a parallel attachment implementation.

Why:

- It preserves one file-handling capability and one storage path.
- It keeps the expense drawer aligned with the established detail rhythm used by clients, employees, and contracts.
- It avoids duplicating storage, form, and delete logic.

Alternative considered:

- Store expense attachments in a custom expense-only subfeature.
  Rejected because it duplicates an existing cross-entity capability with no product benefit.

### D5. First release should mirror `clientes` surface structure and borrow financial UI cues from `honorarios`

The route composition should follow `clientes`: `Wrapper`, header filter, body table/list, `useOverlay`, create/edit modals, details drawer, and delete/restore confirmations. The financial field formatting and date range filtering should mirror `honorarios`.

Why:

- The docs define `clientes` as the canonical slice reference.
- `Honorários` already proves the expected BRL/date formatting patterns for financial records.
- Using both references minimizes implementation drift.

Alternative considered:

- Create a new full-page details experience because expenses are financial.
  Rejected because it would bypass the documented overlay pattern.

### D6. Expense route contract should be explicit rather than inferred

The first implementation should not force a future contributor to derive behavior from analogy alone. The route contract should be fixed now:

- route path: `/_app/despesas`
- route title and navigation label: `Despesas`
- search fields: `query`, `category`, `dateFrom`, `dateTo`, `active`, `status`, `page`, `pageSize`, `sortBy`, `sortDir`
- query semantics: `query` matches `notes`
- filters: category uses stable lookup value; date range uses expense date; `active` and `status` remain independent as on other entity routes
- default sort: `expenseDate` descending with stable id tiebreaker
- desktop table columns: internal id, category, expense date, amount, active state, created date
- mobile card summary: category, expense date, amount, active state, created date
- details drawer sections: general fields, `Observação`, `Anexos`, `Registro`
- create/edit modal fields: category, expense date, amount, notes, `Ativo`
- list display policy: `Observação` stays out of the default list and appears in details/form only

Why:

- It removes guesswork for filters, defaults, and presentation details.
- It keeps the implementation aligned with existing route boundaries while still documenting the expense-specific differences.

Alternative considered:

- Leave list and search behavior to be inferred from `clientes` and `honorarios`.
  Rejected because a new session could make different reasonable guesses and still drift.

### D7. Canonical docs must be updated in the same implementation change

Because `Despesas` introduces new product truth, implementation must update the owning docs in `docs/` in addition to the OpenSpec change artifacts. The minimum expected doc updates are:

- `docs/domain/DOMAIN_MODEL.md`: add `Expense` and its responsibility
- `docs/domain/BUSINESS_RULES.md`: add core expense rules and lifecycle behavior
- `docs/domain/ROLES_AND_PERMISSIONS.md`: add expense route and action permissions
- `docs/domain/FEATURE_BEHAVIOR.md`: add `Despesas` to product surface, route inventory, and feature expectations
- `docs/domain/QUERY_BEHAVIOR.md`: add expense filter and sort contracts
- `docs/domain/LOOKUP_VALUES.md`: add expense-category lookup family
- `docs/domain/USER_FLOWS.md`: add create/view expense flow
- `docs/domain/EDGE_CASES.md`: add expense validation and access edge cases

Why:

- A future contributor should be able to rebuild the feature from canonical docs after this change is archived.
- The project contract says product truth must not live only in code or in archived change history.

Alternative considered:

- Rely only on the OpenSpec delta and postpone docs updates.
  Rejected because it would make the canonical contract incomplete again after implementation lands.

### D8. First release should stop at CRUD plus attachments, not future cash-flow aggregation

`Despesas` is prerequisite data for future cash-flow features, but that future aggregation should remain a later capability. The first change should focus on the missing authoritative source records and the standard operational workflow.

Why:

- It keeps scope aligned with the immediate request.
- It avoids coupling entity introduction with reporting design decisions that are not yet documented.
- It reduces risk while still unlocking the later cash-flow roadmap.

Alternative considered:

- Add dashboard summaries and net cash calculations immediately.
  Rejected because it widens the change beyond the requested CRUD feature.

## Risks / Trade-offs

- [Risk] Administrator-only scope may be narrower than the business eventually wants. → Mitigation: document the assumption now and keep the slice boundaries clean so role broadening later touches policy and query scope, not the whole UI pattern.
- [Risk] Extending attachments to `expense` touches a shared capability. → Mitigation: reuse the existing owner-context pattern and add focused tests for the new owner kind instead of rewriting attachment orchestration.
- [Risk] Expense categories may evolve after implementation starts. → Mitigation: treat them as seeded lookup data so activation and future additions stay manageable.
- [Risk] Teams may expect cash-flow outputs immediately after CRUD lands. → Mitigation: keep the proposal explicit that this change creates the outflow source-of-truth layer only.

## Migration Plan

1. Add the new `expense-management` capability and the attachment delta for expense owner-context support.
2. Extend lookup and persistence schema with expense categories and the new `Expense` entity.
3. Seed the provided expense categories with stable values and pt-BR labels.
4. Build the `expenses` feature slice in the standard sequence: schemas, API, hooks, components, route.
5. Extend attachment queries and mutations to accept `expense` as a valid owner context and persist the new owner foreign key.
6. Wire `/despesas` into route config and navigation.
7. Update the canonical `docs/` files that own the new product truth.
8. Add focused tests for expense validation, list queries, mutations, lifecycle actions, and expense attachments.

## Open Questions

- Should future cash-flow reporting treat `Despesas` purely by payment date, or will it also need a separate competence/competência concept later?
