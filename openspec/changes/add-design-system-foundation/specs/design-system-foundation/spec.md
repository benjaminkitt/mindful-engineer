## ADDED Requirements

### Requirement: Monastery-first visual system
The system SHALL define a monastery-first visual system that serves as the default visual identity for mindful.engineer.

#### Scenario: Default identity is unambiguous
- **WHEN** future implementation work references the design system
- **THEN** monastery is defined as the default identity through explicit typography, color, spacing, linework, and motif guidance

#### Scenario: Accent systems remain secondary
- **WHEN** graph and enso are included in the design system
- **THEN** they are defined as accent or lens vocabularies rather than co-equal site identities

### Requirement: Reusable design tokens
The system SHALL define reusable design tokens for the MVP site’s typography, color, spacing, rule styles, and motif usage.

#### Scenario: Core visual primitives are available
- **WHEN** implementation work begins on the public site
- **THEN** the design system provides reusable token definitions for serif and mono typography, monastery-first color values, spacing scale, border/rule styles, and motif intensity or usage guidance

### Requirement: Reusable public-site components
The system SHALL define reusable component patterns for the MVP public reading experience.

#### Scenario: Reading components are specified
- **WHEN** frontend implementation work references the design system
- **THEN** component definitions exist for the site shell, navigation, article header, metadata row, archive row, note row, link row, snippet row, figure, aside, pull quote, and footer/colophon

#### Scenario: Components include usage guidance
- **WHEN** a component is handed off from the design system
- **THEN** it includes enough structure, states, or notes to guide implementation consistently

### Requirement: Reference layouts for MVP pages
The system SHALL include reference layouts for the primary MVP public pages.

#### Scenario: Core pages have reference layouts
- **WHEN** implementation begins on the public site
- **THEN** reference layouts exist for at least the home page, article detail page, archive page, notes/links stream, and static page template

### Requirement: Prototype-informed Pencil source of truth
The system SHALL be created in Pencil based on the approved prototype and planning docs.

#### Scenario: Pencil is used as the design source
- **WHEN** the design-system foundation is produced
- **THEN** the reusable design artifacts and reference layouts exist in Pencil and are traceable to the prototype and monastery-first planning guidance
