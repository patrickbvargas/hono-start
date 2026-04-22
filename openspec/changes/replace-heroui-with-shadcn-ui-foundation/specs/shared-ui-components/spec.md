## ADDED Requirements

### Requirement: Shared UI layer uses shadcn/ui as the component foundation
The system SHALL use shadcn/ui as the shared UI component foundation for new shared components and future feature migrations.

#### Scenario: Features consume shared UI through the shared barrel
- **WHEN** a feature or route imports reusable UI primitives
- **THEN** it SHALL import them from `@/shared/components/ui`
- **AND** it SHALL NOT import shadcn, Radix, or other vendor UI primitives directly unless the importing file is itself part of the shared UI implementation

#### Scenario: Existing HeroUI compatibility remains temporary
- **WHEN** existing code still imports from `src/shared/components/Hui`
- **THEN** the compatibility layer MAY remain during staged migration
- **AND** new shared UI implementation SHOULD live under `src/shared/components/ui`
- **AND** the compatibility layer SHALL NOT be treated as the long-term canonical UI entrypoint

### Requirement: shadcn/ui components cover the current HeroUI shared surface
The system SHALL provide shadcn/ui primitives or shared local composites for the components currently represented by `src/shared/components/Hui`.

#### Scenario: Direct shadcn equivalents are generated
- **WHEN** a current shared HeroUI component has a direct shadcn/ui equivalent
- **THEN** the implementation SHALL generate or add the shadcn/ui component under `src/shared/components/ui`
- **AND** the component SHALL be exported from the shared UI entrypoint

#### Scenario: Missing shadcn equivalents use local shared composites
- **WHEN** a current shared HeroUI component does not have a direct shadcn/ui equivalent
- **THEN** the implementation SHALL provide a small shared composite under `src/shared/components/ui`
- **AND** the composite SHALL be built from shadcn/ui primitives, supported shared utilities, or native accessible elements
- **AND** the composite SHALL avoid feature-specific business behavior

### Requirement: Shared UI components preserve shadcn/ui named exports
The system SHALL expose shared UI components using shadcn/ui's normal named export style instead of adding HeroUI-like dot-property composition.

#### Scenario: Composed components expose named parts
- **WHEN** a shared UI component has meaningful composition parts such as header, body, item, trigger, content, list, or panel
- **THEN** the shared UI module SHALL export the direct part components
- **AND** it SHALL preserve shadcn-style names such as `TableHeader`, `TableBody`, `CardHeader`, `TabsList`, or `AlertDialogContent`
- **AND** it SHALL NOT add dot-property aliases such as `Table.Header`, `Card.Header`, or `Tabs.List`

#### Scenario: Single primitive components stay direct
- **WHEN** a shared UI component is a single primitive without meaningful composition parts
- **THEN** the shared UI module SHALL export the component directly
- **AND** it SHALL NOT add artificial nested aliases solely for symmetry or HeroUI compatibility

### Requirement: Shared UI generated code remains repository-clean
The system SHALL keep shadcn/ui generated code and local shared UI wrappers compliant with repository formatting, linting, and TypeScript rules.

#### Scenario: Biome validates generated and wrapper code
- **WHEN** shadcn/ui components or local shared UI wrappers are added
- **THEN** `pnpm check` SHALL pass after applying formatting and lint fixes
- **AND** no known Biome errors SHALL remain

#### Scenario: TypeScript validates shared UI exports
- **WHEN** the shared UI foundation is complete
- **THEN** `npx tsc --noEmit` SHALL pass
- **AND** representative shadcn-native named exports SHALL type-check
