## ADDED Requirements

### Requirement: Separate protected editorial application
The system SHALL provide a separate protected editorial application for remote publishing workflows.

#### Scenario: Editorial app is distinct from the public site
- **WHEN** the MVP is deployed
- **THEN** remote publishing workflows are served from a separate application from the public reading site

### Requirement: Access-protected editorial entry
The system SHALL protect the editorial application with Cloudflare Access in MVP.

#### Scenario: Protected access is enforced
- **WHEN** an unauthenticated or unauthorized user requests the editorial application
- **THEN** access is controlled through Cloudflare Access before editorial workflows are available

### Requirement: Mobile-friendly note creation
The system SHALL support mobile-friendly creation of notes from the editorial application.

#### Scenario: Note can be created from a mobile device
- **WHEN** the author creates a note from the editorial application on a mobile device
- **THEN** the note workflow allows body-first creation and save or publish actions without requiring a title

### Requirement: Mobile-friendly link creation
The system SHALL support mobile-friendly creation of links from the editorial application.

#### Scenario: Link can be created from a mobile device
- **WHEN** the author creates a link from the editorial application on a mobile device
- **THEN** the workflow supports URL entry, optional commentary, and save or publish actions

### Requirement: Draft, preview, and canonical publish workflow
The system SHALL support editorial draft, preview, and canonical publish workflow states.

#### Scenario: Draft can be saved before publish
- **WHEN** the author is not ready to publish
- **THEN** the editorial application allows the entry to remain in draft workflow state

#### Scenario: Canonical publish completes through the control plane
- **WHEN** the author publishes an entry from the editorial application
- **THEN** the entry is advanced through canonical publish workflow rather than being stored only as transient UI state
