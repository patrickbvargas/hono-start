## ADDED Requirements

### Requirement: Authenticated list bodies keep table overflow inside the shared table region
The authenticated app layout SHALL keep canonical operational list pages inside the fixed shell height and SHALL prevent large tables from making the wrapper body itself become the primary vertical scrolling surface. Shared list tables SHALL consume the available wrapper body height and confine overflow to their own content region.

#### Scenario: Large list keeps page chrome fixed
- **WHEN** a user opens an authenticated operational list route with enough rows to exceed the available body height
- **THEN** the page title area and route header controls SHALL remain fixed within the shell
- **AND** the wrapper body SHALL not introduce a page-level vertical scroll for the table content
- **AND** the table content region SHALL become vertically scrollable within the available body height

### Requirement: Shared list tables keep headers sticky while content scrolls
Shared list tables SHALL keep their header visible while list content scrolls inside the table region, and shared pagination SHALL remain inside that same bounded table content block.

#### Scenario: User scrolls a long list
- **WHEN** a user scrolls through a long shared list table
- **THEN** the table header SHALL remain visible at the top of the table region
- **AND** only the table content region SHALL move vertically
- **AND** the shared pagination block SHALL remain associated with the same bounded table container
