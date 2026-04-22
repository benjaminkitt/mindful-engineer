## ADDED Requirements

### Requirement: Canonical MDX content loading
The system SHALL load canonical published content from repository-managed MDX source files.

#### Scenario: Canonical content is read from the repository
- **WHEN** the site is built
- **THEN** published articles, notes, links, snippets, and pages are loaded from repository-managed canonical source files

### Requirement: Type-aware content validation
The system SHALL validate content metadata and structure according to the MVP entry types.

#### Scenario: Article metadata is validated
- **WHEN** an article is loaded
- **THEN** required article metadata such as title, slug, summary, and published date is validated before rendering

#### Scenario: Note metadata is validated
- **WHEN** a note is loaded
- **THEN** required note metadata such as type and published date is validated before rendering

#### Scenario: Link metadata is validated
- **WHEN** a link entry is loaded
- **THEN** required link metadata such as URL and published date is validated before rendering

#### Scenario: Snippet metadata is validated
- **WHEN** a snippet is loaded
- **THEN** required snippet metadata such as title, language, and published date is validated before rendering

### Requirement: Archive and listing generation from canonical content
The system SHALL generate public listing and archive data from canonical published content.

#### Scenario: Archive data is generated from content
- **WHEN** the site is built
- **THEN** the archive and relevant listing pages are generated from canonical published content rather than hard-coded fixtures

### Requirement: Link-title inference
The system SHALL support inferred or fetched titles for link entries when title is not explicitly provided.

#### Scenario: Missing link title is inferred
- **WHEN** a link entry does not define a title
- **THEN** the system attempts to infer or fetch the title for use in rendering and feed output
