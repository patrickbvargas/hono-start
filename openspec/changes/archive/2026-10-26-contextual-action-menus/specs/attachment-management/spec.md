## ADDED Requirements

### Requirement: Attachment items expose equivalent action menus
Attachment items SHALL offer Baixar arquivo and permitted Excluir through right-click and visible overflow menus. The existing download shortcut SHALL remain. Existing authorization, download URL and deletion-confirmation behavior SHALL apply identically to all surfaces.

#### Scenario: Download
- **WHEN** the user selects Baixar arquivo from either menu
- **THEN** the same authorized file URL SHALL open as the existing download shortcut

#### Scenario: Restricted deletion
- **WHEN** the viewer cannot delete attachments
- **THEN** Excluir SHALL be absent from both menus while the download choice remains accessible

#### Scenario: Unavailable download
- **WHEN** an attachment has no download URL
- **THEN** Baixar arquivo SHALL be disabled in both menus and the shortcut

#### Scenario: Delete with confirmation
- **WHEN** the user selects Excluir
- **THEN** the existing delete confirmation SHALL open for the selected attachment ID

#### Scenario: Keyboard access
- **WHEN** a focused attachment item receives Shift+F10 or ContextMenu
- **THEN** its context menu SHALL open and Escape SHALL close it with focus returned to the item
