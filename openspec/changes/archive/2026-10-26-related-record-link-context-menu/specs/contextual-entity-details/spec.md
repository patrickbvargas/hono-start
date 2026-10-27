## ADDED Requirements

### Requirement: Related links offer direct page access
Every RelatedRecordLink SHALL default to primary-click summary opening and offer a context menu with Abrir página followed by Ver resumo. Page access SHALL target the same record and overview tab using the destination entity's validated collection return context, without opening its summary. Existing read permissions and server resource checks SHALL remain enforced.

#### Scenario: Open related client page
- **WHEN** an authorized user right-clicks a client link on a contract and chooses Abrir página
- **THEN** the client page opens directly without mounting the client summary

#### Scenario: Inspect a related record
- **WHEN** the user clicks a summary-default link or selects Ver resumo
- **THEN** the related summary opens while the originating URL and context remain intact

#### Scenario: Keyboard menu access
- **WHEN** a focused related link receives Shift+F10 or ContextMenu
- **THEN** its menu opens and Escape closes it with focus returned to the link

#### Scenario: Restricted read access
- **WHEN** the viewer lacks the related entity read grant
- **THEN** the context menu SHALL NOT expose page or summary actions


#### Scenario: Configurable primary action
- **WHEN** a link specifies page as its primary action
- **THEN** primary click SHALL open the page directly, its tooltip SHALL describe page access, and its context menu SHALL still offer both actions
- **AND** links without an override SHALL follow the central default, initially summary

## MODIFIED Requirements

### Requirement: Singular related details preserve their parent context
The system SHALL open supported singular client, employee, contract and fee relationships above the current detail without navigating to the related entity list. Summary-default triggers SHALL expose dialog semantics and SHALL NOT display a route-navigation icon. Nested details SHALL use “Voltar”. An explicit page primary action SHALL instead navigate directly and omit dialog accessibility attributes.

#### Scenario: Return from a related record
- **WHEN** a user opens a related record and chooses “Voltar”
- **THEN** the related detail closes and the original detail remains available on the same route

#### Scenario: Operate on a related record
- **WHEN** a permitted user edits, deletes or restores a related record
- **THEN** existing feature permission and data-isolation rules apply, with the mutation dialog visible above the details
