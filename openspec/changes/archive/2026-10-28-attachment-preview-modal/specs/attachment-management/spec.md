## ADDED Requirements

### Requirement: Preview attachments within their owner context
The system SHALL open an accessible modal when the attachment identity area is activated by click, Enter or Space in any supported owner context. The modal SHALL preserve the originating page/drawer and list state, display filename, type, size, creation date and uploader in its header, and place download, permitted deletion and close actions on the right. Row action buttons and context menus SHALL operate independently of preview activation. Dismissal SHALL restore focus to the originating trigger.

#### Scenario: Read a PDF
- **WHEN** a user activates a readable PDF attachment
- **THEN** the modal displays it using the application PDF reader and exposes an open-in-new-tab alternative
- **AND** it renders one page at a time with previous/next navigation, page count and the same floating zoom controls as images, including 100% and fit-to-width
- **AND** page changes return scrolling to the top and stale page renders are canceled

#### Scenario: Inspect an image
- **WHEN** a user activates a readable JPG or PNG attachment
- **THEN** the modal fits the complete image inside its preview area without cropping

#### Scenario: Zoom and pan an image
- **WHEN** the user operates the image's floating zoom controls
- **THEN** the viewer exposes the current percentage, zoom out/in up to 800%, 100% actual size and Ajustar à tela
- **AND** enlarged images support bounded mouse/touch dragging and arrow-key panning, with position reset after scale or viewport changes

#### Scenario: Print an image
- **WHEN** the reader chooses Imprimir after image loading finishes
- **THEN** the browser print dialog receives only the complete image with preserved proportions, excluding metadata, controls and zoom/pan transforms
- **AND** temporary print content is released after printing or preview dismissal

#### Scenario: Operate row actions
- **WHEN** a user downloads or opens an attachment action menu
- **THEN** the action operates without opening the preview

#### Scenario: Preview from a menu
- **WHEN** the user selects Visualizar in the overflow or context menu
- **THEN** the same preview opens with the attachment identity as its return-focus target

#### Scenario: Scan and hover an attachment
- **WHEN** an attachment row is rendered or hovered
- **THEN** metadata and actions are vertically centered and the row has light padding and a unified hover highlight

#### Scenario: Delete from preview
- **WHEN** an authorized user chooses deletion from the preview
- **THEN** the existing explicit confirmation opens, cancellation/failure preserves the preview, and successful deletion removes the attachment and closes the preview

#### Scenario: Restricted actions
- **WHEN** the reader lacks attachment deletion permission
- **THEN** preview remains readable and deletion is absent

### Requirement: Preview failure recovery and private resource lifetime
The system SHALL load attachment content only on preview activation through existing authenticated owner-authorized delivery. It SHALL show a skeleton through binary download and the image/PDF load event, including explicit retries, safe pt-BR errors for failed responses or image rendering, and an open-in-new-tab alternative when a URL exists. Missing URLs and unsupported types SHALL produce explicit feedback. Binary preview resources SHALL be released when the preview closes or changes, and stale requests SHALL NOT replace the current preview.

#### Scenario: Failed delivery
- **WHEN** delivery returns an unauthorized, absent-file or server error response
- **THEN** the modal displays safe failure feedback without exposing the response body and allows an explicit retry

#### Scenario: Close while loading
- **WHEN** the user closes the preview before delivery completes
- **THEN** the pending request is canceled and no stale preview appears

#### Scenario: Browser cannot embed PDF
- **WHEN** a browser cannot render a successfully delivered PDF inside the modal
- **THEN** the user can still open the original authenticated URL in a new tab or download it
