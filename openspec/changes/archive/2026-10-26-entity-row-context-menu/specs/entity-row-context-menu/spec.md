## ADDED Requirements

### Requirement: Primary collection rows expose contextual actions
Client, employee, contract, fee, expense, remuneration and audit tables SHALL open contextual actions at the pointer on right click without navigating. Their existing overflow actions SHALL remain available.

#### Scenario: Open summary from a row
- **WHEN** a user right-clicks a row and selects Ver resumo
- **THEN** the existing summary opens for that exact record while preserving collection filters, sorting and pagination

#### Scenario: Preserve primary navigation
- **WHEN** a user left-clicks a noninteractive row cell or presses Enter/Space on the row
- **THEN** the existing record-page navigation occurs once

### Requirement: Menu actions retain authorization and lifecycle rules
Both menu surfaces SHALL offer the same actions allowed by the current grants, row lifecycle and available callbacks. Audit records SHALL expose no mutations. Excluir SHALL open the existing confirmation.

#### Scenario: Restricted or deleted record
- **WHEN** a record permits only a subset of actions
- **THEN** both menus expose that subset, including Restaurar only where allowed, without granting access to another firm or expanding own/assigned scopes

#### Scenario: Choose deletion
- **WHEN** an authorized user selects Excluir
- **THEN** the existing confirmation opens without navigating or deleting immediately

### Requirement: Contextual menus are keyboard accessible and preserve nested controls
Focused rows SHALL support ContextMenu and Shift+F10, menu arrow navigation and Escape dismissal with focus returning to the row. Nested interactive controls SHALL preserve their own behavior. Tables without the new opt-in SHALL preserve current behavior.

#### Scenario: Keyboard access
- **WHEN** the user focuses a row and presses Shift+F10 or ContextMenu
- **THEN** its actions open and Escape dismisses the menu and restores row focus

#### Scenario: Nested interaction
- **WHEN** the user interacts with an embedded link, button, input or open menu
- **THEN** the row does not navigate or hijack its context interaction

#### Scenario: Sorted or paginated records
- **WHEN** the user invokes contextual actions after sorting or pagination
- **THEN** actions target the displayed record rather than its visible page position
