## ADDED Requirements

### Requirement: Repository-backed canonical publish
The system SHALL publish canonical content by committing it into the repository-backed content source.

#### Scenario: Published content is committed to repository
- **WHEN** an entry is canonically published through the control plane
- **THEN** the resulting canonical content is committed into the repository-backed content source rather than stored only in operational data storage

### Requirement: GitHub API publishing path
The system SHALL use GitHub API as the MVP remote publishing path for repository-backed canonical publish.

#### Scenario: Remote canonical publish uses GitHub API
- **WHEN** the control plane publishes canonical content remotely
- **THEN** the repository commit is performed through a GitHub API-driven publishing path

### Requirement: Operational state remains non-canonical
The system SHALL keep D1 operational state distinct from canonical repository content.

#### Scenario: D1 does not become a second source of truth
- **WHEN** publish workflow state is stored for the editorial application
- **THEN** D1 stores workflow and operational metadata without replacing the repository as the canonical content source
