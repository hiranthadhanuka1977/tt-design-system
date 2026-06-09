# Task Tracker Design System

A complete **HTML/CSS design system** for building JIRA-style project management applications. It includes design tokens, 40+ UI components, JIRA domain patterns (issue types, kanban, sprints), five sample app pages, and Figma MCP integration artifacts.

**Live showcase:** open [`index.html`](index.html) in a browser (or serve locally — see [Quick start](#quick-start)).

**Figma file:** [JIRA Replacement Tool](https://www.figma.com/design/coHas1OKnJQZghD2I4ZK9q/JIRA-Replacement-Tool)

---

## Features

- **Design tokens** — colors, typography, spacing, radius, shadows, and layout variables with light/dark mode
- **Component library** — buttons, inputs, cards, modals, tables, navigation, and more
- **JIRA domain components** — issue types, priorities, statuses, issue cards, kanban columns, sprint metrics, comments
- **Interactive showcase** — every component demo includes copyable **HTML** and **Next.js (JSX)** markup tabs
- **Sample pages** — five fully composed app screens (dashboard, kanban, backlog, issue detail, sprint reports)
- **Figma-ready** — `tokens.json`, Code Connect stubs, MCP import scripts, and component build manifests

This project uses **plain CSS** (BEM-style classes + CSS custom properties). It does **not** use Tailwind, React, or a build step for the design system itself.

---

## Quick start

### View the showcase

```bash
# From the repo root
python -m http.server 8765
```

Then open [http://localhost:8765/index.html](http://localhost:8765/index.html).

### Use in an HTML project

Link the main stylesheet in your page:

```html
<link rel="stylesheet" href="css/main.css">
```

Use component classes directly:

```html
<button class="btn btn--primary">Create Issue</button>
<span class="status status--in-progress">In Progress</span>
```

Browse [`index.html`](index.html) for live previews and copyable markup under each component.

### Use in a Next.js project

1. Copy the `css/` folder (and optionally `icons/`) into your Next.js app, e.g. `styles/jrt/`.
2. Import once in `app/layout.tsx`:

```tsx
import '@/styles/jrt/main.css';
```

3. Use the same class names via `className`:

```tsx
<button className="btn btn--primary">Create Issue</button>
```

The showcase generates ready-to-copy Next.js component snippets on every demo (switch to the **Next.js** tab).

---

## Project structure

```
.
├── index.html              # Design system showcase & documentation
├── tokens.json             # Machine-readable token export
├── figma.config.json       # Figma Code Connect configuration
├── css/
│   ├── tokens.css          # Design token definitions (light/dark)
│   ├── components.css      # All UI components
│   ├── utilities.css       # Layout utility classes
│   ├── showcase.css        # Showcase page layout
│   ├── app.css             # App shell (sidebar, topbar)
│   ├── pages.css           # Sample page styles
│   └── main.css            # Entry point (@import bundle)
├── pages/                  # Five sample application pages
├── js/showcase.js          # HTML + Next.js markup tabs
├── icons/                  # 14 SVG icons
└── figma/
    ├── mcp-session-plan.json
    ├── component-build-order.json
    ├── component-variants.json
    ├── scripts/              # Figma MCP token import scripts
    └── code-connect/         # Code Connect mapping stubs
```

---

## Design tokens

Tokens live in [`css/tokens.css`](css/tokens.css) and are exported to [`tokens.json`](tokens.json).

| Category | Examples |
|----------|----------|
| Colors | `--color-brand-500`, `--color-neutral-*`, semantic success/warning/danger |
| Typography | `--font-size-md`, `--font-weight-semibold`, heading scales |
| Spacing | `--space-1` … `--space-12` (4px grid) |
| Radius | `--radius-sm` … `--radius-full` |
| Shadows | `--shadow-xs` … `--shadow-2xl` |
| Layout | `--sidebar-width`, `--topbar-height`, `--kanban-column-width` |

Toggle dark mode by setting `data-theme="dark"` on the `<html>` element (the showcase includes a toggle button).

---

## Components

### General UI

Buttons, form inputs, badges, tags, chips, avatars, cards, alerts, toasts, modals, drawers, dropdowns, tooltips, tabs, breadcrumbs, pagination, tables, progress bars, spinners, skeletons, dividers, accordion, stepper, empty states, navigation, and page headers.

### JIRA domain

| Component | CSS classes |
|-----------|-------------|
| Issue types | `.issue-type`, `.issue-type--story`, `.issue-type--bug`, … |
| Priorities | `.priority`, `.priority--high`, … |
| Statuses | `.status`, `.status--in-progress`, … |
| Issue cards | `.issue-card` |
| Kanban | `.kanban`, `.kanban__column` |
| Sprint / metrics | `.sprint-header`, `.metric-card` |
| Activity | `.timeline`, `.comment` |
| Filters | `.filter-bar`, `.chip` |
| Command palette | `.command-palette` |

Variant mappings for Figma are documented in [`figma/component-variants.json`](figma/component-variants.json).

---

## Sample pages

| Page | File |
|------|------|
| Project Dashboard | [`pages/project-dashboard.html`](pages/project-dashboard.html) |
| Kanban Board | [`pages/kanban-board.html`](pages/kanban-board.html) |
| Backlog | [`pages/backlog.html`](pages/backlog.html) |
| Issue Detail | [`pages/issue-detail.html`](pages/issue-detail.html) |
| Sprint Reports | [`pages/sprint-dashboard.html`](pages/sprint-dashboard.html) |

All sample pages share a consistent app shell (sidebar + topbar) and link to each other.

---

## Figma integration

The design system is paired with a Figma file built via Figma MCP:

| Asset | Location |
|-------|----------|
| Figma file | [JIRA Replacement Tool](https://www.figma.com/design/coHas1OKnJQZghD2I4ZK9q/JIRA-Replacement-Tool) |
| Token import scripts | [`figma/scripts/`](figma/scripts/) |
| Build order | [`figma/component-build-order.json`](figma/component-build-order.json) |
| Session plan / status | [`figma/mcp-session-plan.json`](figma/mcp-session-plan.json) |
| Code Connect stubs | [`figma/code-connect/`](figma/code-connect/) |

### Publish Code Connect (optional)

```bash
npx figma connect publish
```

Ensure `FIGMA_FILE_KEY` in [`figma.config.json`](figma.config.json) matches your Figma file.

---

## CSS architecture

| Layer | File | Purpose |
|-------|------|---------|
| Tokens | `tokens.css` | Variables only |
| Reset / base | `reset.css`, `base.css` | Normalize and element defaults |
| Components | `components.css` | BEM component styles |
| Utilities | `utilities.css` | Small helper classes (`flex`, `gap-4`, …) |
| App / pages | `app.css`, `pages.css` | Composed layouts for sample app |

Import order is defined in [`css/main.css`](css/main.css).

---

## Browser support

Modern evergreen browsers (Chrome, Firefox, Safari, Edge). Uses CSS custom properties, flexbox, and grid — no polyfills included.

---

## License

All rights reserved unless otherwise specified by the repository owner.
