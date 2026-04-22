## ADDED Requirements

### Requirement: Canonical posts show outward destinations
The system SHALL display successful syndicated destinations on canonical posts.

#### Scenario: Elsewhere links appear after successful syndication
- **WHEN** a canonical post has one or more successful syndicated destinations
- **THEN** the public canonical post displays those destinations in an Elsewhere-style pattern

### Requirement: Elsewhere links reflect operational syndication outcomes
The system SHALL derive outward destination links from recorded syndication results.

#### Scenario: Elsewhere links are based on recorded posting results
- **WHEN** a syndicated destination has been successfully recorded in operational state
- **THEN** the canonical post can display the corresponding outward destination link
