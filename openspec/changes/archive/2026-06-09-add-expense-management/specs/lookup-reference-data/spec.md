## MODIFIED Requirements

### Requirement: Lookup catalogs expose stable categorical values
The system SHALL expose global lookup catalogs through stable application-facing `value` identifiers and localized pt-BR `label` values. The expense-management category catalog SHALL be part of this lookup contract.

#### Scenario: Expense categories are seeded as stable lookup values
- **WHEN** the system seeds or loads the expense-category catalog
- **THEN** it exposes the following stable values and labels:
- **AND** `PAYROLL_LAWYERS` => `Folha Advogados`
- **AND** `PAYROLL_INTERNS` => `Folha Estagiários`
- **AND** `PAYROLL_STAFF` => `Folha Funcionários`
- **AND** `TAX_PIS` => `PIS`
- **AND** `TAX_IRPJ` => `IRPJ`
- **AND** `TAX_COFINS` => `COFINS`
- **AND** `TAX_ISSQN` => `ISSQN`
- **AND** `TAX_CSLL` => `CSLL`
- **AND** `TAX_OTHER` => `Outros Impostos`
- **AND** `PHONE` => `Telefone`
- **AND** `MEDIA` => `Mídia`
- **AND** `POSTAGE` => `Correio`
- **AND** `CONDOMINIUM` => `Condomínio`
- **AND** `ELECTRICITY` => `RGE`
- **AND** `MEALS` => `Refeitório`
- **AND** `ASSETS` => `Patrimônio`
- **AND** `SUPPLIES` => `Insumos`
- **AND** `NOTARY` => `Tabelionato`
- **AND** `COURT_COSTS` => `Custos Judiciais`
- **AND** `OTHER` => `Outros`

#### Scenario: Expense category fields bind by stable value
- **WHEN** the expense form or expense filter reads or writes a selected category
- **THEN** the application binds the selection by stable lookup `value`
- **AND** user-facing surfaces display the pt-BR `label`

#### Scenario: Inactive expense categories remain visible but disabled
- **WHEN** an expense category is marked inactive after being used by existing expense records
- **THEN** lookup queries still return that category row
- **AND** create flows do not allow selecting it for new choices
- **AND** edit flows may render the persisted inactive category as visible but disabled
