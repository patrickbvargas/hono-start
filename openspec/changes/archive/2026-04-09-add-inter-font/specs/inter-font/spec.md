## ADDED Requirements

### Requirement: Inter font variable is defined
The system SHALL define `--font-inter` as a CSS custom property in `:root` with value `"Inter", sans-serif`.

#### Scenario: Font variable resolves
- **WHEN** the browser parses the global stylesheet
- **THEN** `--font-inter` resolves to the Inter font family with a sans-serif fallback

### Requirement: Body renders in Inter
The system SHALL apply `font-family: var(--font-sans)` to the `body` element so all text defaults to Inter.

#### Scenario: Body font family is Inter
- **WHEN** the page is rendered
- **THEN** the `body` element's computed `font-family` is `"Inter", sans-serif`

#### Scenario: Fallback on font load failure
- **WHEN** the Google Fonts stylesheet fails to load
- **THEN** the `body` element's computed `font-family` falls back to `sans-serif`
