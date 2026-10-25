## ADDED Requirements

### Requirement: Delete contract from workspace
The workspace SHALL offer Excluir contrato to actors with contract delete permission when the contract is not already deleted. It SHALL reuse the existing explicit confirmation, protected soft-delete operation and active-revenue deletion protection. Only successful deletion SHALL return to the validated originating collection with filters preserved.

#### Scenario: Successful confirmation
- **WHEN** an authorized actor confirms deletion of an eligible contract from its page
- **THEN** the existing soft-delete flow executes and returns to the originating contract list or pending queue with validated filters preserved

#### Scenario: Unauthorized or already deleted contract
- **WHEN** the actor lacks delete permission or the contract is already deleted
- **THEN** the delete button is absent

#### Scenario: Cancelled confirmation or blocked deletion
- **WHEN** confirmation is cancelled or the server rejects deletion because active revenues exist
- **THEN** the user remains on the contract page and the existing failure feedback is preserved
