## ADDED Requirements

### Requirement: Separate public site application
The system SHALL provide a separate public site application for the mindful.engineer reading experience.

#### Scenario: Public app is distinct from admin
- **WHEN** the MVP architecture is implemented
- **THEN** the public reading surface exists as a separate application from the protected admin/control-plane app

### Requirement: Monastery-first public rendering
The system SHALL render the public reading experience using the monastery-first visual system as the default identity.

#### Scenario: Default public pages use monastery-first presentation
- **WHEN** a visitor loads the public site
- **THEN** the site shell, typography, layout, and component presentation use the monastery-first design system by default

### Requirement: MVP public route structure
The system SHALL provide public routes for the MVP information architecture.

#### Scenario: Core public routes exist
- **WHEN** a visitor navigates the public site
- **THEN** routes exist for home, articles index, article detail, notes index, note detail, links index, link detail, snippet detail, archive, about, and now

### Requirement: Shared public site shell
The system SHALL provide a shared site shell for public pages.

#### Scenario: Shared shell is applied consistently
- **WHEN** a visitor navigates between public pages
- **THEN** navigation, page framing, and footer/colophon are applied consistently across the public site

### Requirement: Content-type-aware page templates
The system SHALL provide public templates appropriate to the MVP content types and static pages.

#### Scenario: Article pages use article-oriented template
- **WHEN** an article is rendered
- **THEN** the page includes article-specific structure for title, metadata, body, and reading-oriented presentation

#### Scenario: Short-form pages use short-form template behavior
- **WHEN** notes, links, or snippets are rendered
- **THEN** each is displayed with template behavior appropriate to its content type

#### Scenario: Static pages use shared static-page template
- **WHEN** about or now pages are rendered
- **THEN** they use a consistent static-page template within the public site shell

### Requirement: Cloudflare Pages deployment target
The system SHALL be deployable to Cloudflare Pages as the public hosting target.

#### Scenario: Public site build targets Cloudflare Pages
- **WHEN** the public site is built for deployment
- **THEN** the output is compatible with deployment to Cloudflare Pages
