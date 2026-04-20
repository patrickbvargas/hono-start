## MODIFIED Requirements

### Requirement: Client feature keeps pure business validation in one canonical file
The system SHALL implement the client feature so pure client business validation is easy to locate and evolve without changing behavior.

#### Scenario: Client rules are discoverable from one file
- **WHEN** a contributor needs to change a pure client business rule
- **THEN** the authoritative implementation SHALL be discoverable in `src/features/clients/rules.ts`
- **AND** the feature SHALL NOT keep the same pure rule implementation split between `utils/validation.ts` and other files

#### Scenario: Client write handlers reuse the canonical rules file
- **WHEN** the client create API mutation executes
- **THEN** the write handler SHALL reuse the canonical functions from `src/features/clients/rules.ts` for pure document and type validation
- **AND** persisted lookup and stored-state checks MAY remain in `api/lookups.ts`

#### Scenario: Client schema refinements reuse the canonical rules file
- **WHEN** the client create or update schema performs database-free refinement
- **THEN** the schema SHALL reuse the canonical functions from `src/features/clients/rules.ts`
- **AND** the schema SHALL NOT become the authoritative home of the rule logic

### Requirement: Client writes preserve authoritative rule placement
The system SHALL keep client validation rules authoritative in the canonical rule file so the same client rule is not redefined across unrelated files.

#### Scenario: Pure client document rules live in rules.ts
- **WHEN** client CPF/CNPJ and type-dependent document rules are evaluated
- **THEN** the authoritative pure rule implementation SHALL live in `src/features/clients/rules.ts`
- **AND** other layers MAY reuse those rules for UX or orchestration without becoming the source of truth

#### Scenario: Client exported rule entrypoints use validate naming
- **WHEN** `src/features/clients/rules.ts` exports authoritative business-rule functions
- **THEN** those exported entrypoints SHALL use a `validate...` prefix
- **AND** helper predicates MAY remain unexported or use narrower names when they support the main validators

#### Scenario: Client rules expose a small explicit validation API
- **WHEN** the client feature defines exported validators in `src/features/clients/rules.ts`
- **THEN** `validateClientDocumentRules` SHALL exist as the canonical validator for pure document and type-dependent document validation
- **AND** `validateClientBusinessRules` MAY exist as an aggregate validator only if it composes narrower `validate...` functions without duplicating rule logic
- **AND** `validateClientTypeRules` SHALL NOT be introduced unless the feature gains pure type rules that are meaningfully separate from document validation

#### Scenario: Persisted-state client checks stay outside rules.ts
- **WHEN** a client write depends on the current stored client, lookup activity state, or related contracts
- **THEN** those checks SHALL execute outside `rules.ts` using the existing API-side lookup and persisted-state helpers
- **AND** they SHALL NOT be implemented as schema-only validation or route-level logic
