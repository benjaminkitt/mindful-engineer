## ADDED Requirements

### Requirement: Static feed generation
The system SHALL generate feed outputs as static artifacts during the site build.

#### Scenario: Main feed is generated statically
- **WHEN** the site is built
- **THEN** the main feed is emitted as a static artifact from canonical published content

#### Scenario: Content-subset feeds are generated statically
- **WHEN** configured subset feeds are part of MVP output
- **THEN** those feeds are emitted as static artifacts during the site build

### Requirement: Feed content derives from canonical published content
The system SHALL generate feed items from the same canonical content source used by public site rendering.

#### Scenario: Feed output matches published content source
- **WHEN** a published entry appears on the public site
- **THEN** its feed representation is derived from the same canonical content source rather than a separate manual feed definition

### Requirement: Feed permalinks point to canonical URLs
The system SHALL emit feed items whose permalinks point to mindful.engineer canonical URLs.

#### Scenario: Feed item links point to canonical site URLs
- **WHEN** a feed reader opens an item from the generated feed
- **THEN** the item permalink resolves to the canonical mindful.engineer post or page URL
