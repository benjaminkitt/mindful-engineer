## ADDED Requirements

### Requirement: Syndication begins after canonical publish
The system SHALL prepare reviewed syndication only after a canonical mindful.engineer publication exists.

#### Scenario: Syndication follows canonical publish
- **WHEN** an entry is eligible for outbound syndication
- **THEN** reviewed syndication preparation occurs only after the canonical mindful.engineer publication exists

### Requirement: Review before send
The system SHALL provide a review step before sending outbound platform variants.

#### Scenario: Outbound variant is reviewed before send
- **WHEN** a platform variant is prepared
- **THEN** the author can review and approve, skip, or leave it unsent before any outbound posting occurs

### Requirement: First-class reviewed Mastodon and Bluesky integration
The system SHALL support first-class reviewed outbound posting to Mastodon and Bluesky in MVP.

#### Scenario: Mastodon reviewed posting is supported
- **WHEN** an approved Mastodon variant is sent
- **THEN** the system posts the reviewed variant and records the posting outcome in operational state

#### Scenario: Bluesky reviewed posting is supported
- **WHEN** an approved Bluesky variant is sent
- **THEN** the system posts the reviewed variant and records the posting outcome in operational state

### Requirement: Assisted/manual LinkedIn and X outputs
The system SHALL support assisted/manual reviewed outputs for LinkedIn and X in MVP.

#### Scenario: LinkedIn reviewed output is available
- **WHEN** the author prepares a LinkedIn variant
- **THEN** the system provides a reviewed output suitable for assisted/manual posting

#### Scenario: X reviewed output is available
- **WHEN** the author prepares an X variant
- **THEN** the system provides a reviewed output suitable for assisted/manual posting

### Requirement: Syndication does not block canonical publishing
The system SHALL keep syndication optional and non-blocking relative to canonical publish.

#### Scenario: Canonical publish succeeds without syndication success
- **WHEN** external platform posting fails or is skipped
- **THEN** the canonical mindful.engineer publication remains published and valid
