## ADDED Requirements

### Requirement: Equivalent shared entity sections use a unified title style
The system SHALL render the default title of equivalent shared entity sections through one shared title treatment so entity forms and entity detail drawers present the same section-heading typography.

#### Scenario: Form section renders titled heading
- **WHEN** a shared `FormSection` receives a `title`
- **THEN** it MUST render the title with the same shared heading treatment used by entity detail sections
- **AND** the default treatment MUST use uppercase text, visible letter spacing, muted foreground color, and a font size slightly larger than base body text

#### Scenario: Entity detail section renders titled heading
- **WHEN** a shared `EntityDetail.Section` receives a `title`
- **THEN** it MUST render the title with the same shared heading treatment used by form sections
- **AND** section-specific class overrides MAY extend that shared treatment without replacing the shared component contract

#### Scenario: Sections without titles preserve existing layout behavior
- **WHEN** a shared section omits `title`
- **THEN** the section MUST preserve its existing content, description, and action layout behavior
- **AND** the system MUST NOT introduce placeholder heading space solely because the title is absent
