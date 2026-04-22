## Why

The prototype already expresses a strong editorial identity, but it exists as an exploratory artifact rather than a reusable system. Before building the production site, we need a formal design system that captures the monastery-first visual language, defines reusable tokens and components, and gives future implementation work a stable visual contract.

## What Changes

- Create a monastery-first design system derived from the existing prototype and planning docs.
- Use Pencil to translate prototype patterns into reusable design assets, layout primitives, and component definitions.
- Define core visual tokens for typography, color, spacing, linework, and motif usage.
- Define reusable components for navigation, article headers, metadata rows, archive rows, note/link cards, figures, asides, pull quotes, and footer/colophon blocks.
- Produce reference layouts for the core MVP page types so implementation work can build against a coherent system instead of one-off interpretations.

## Capabilities

### New Capabilities
- `design-system-foundation`: Establishes the canonical visual system, component library, and reference layouts for mindful.engineer.

### Modified Capabilities
- None.

## Impact

- Affects prototype translation, UI implementation, and all future frontend work.
- Establishes the visual contract for the Astro public site and the separate admin/control-plane app.
- Uses Pencil as the source of truth for reusable visual definitions during the design phase.
