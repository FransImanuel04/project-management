# Project Workspace Homepage

## Goal

Build the responsive project workspace homepage on top of the existing Next.js, Tailwind, shadcn/ui, SQLite, and Drizzle foundation.

## Scope

- Add the Project Workspace header.
- Add project search and a New Project action.
- Add Workspace Insights based on real project data.
- Render project cards from SQLite.
- Add a light/dark theme toggle using `next-themes`.
- Add responsive layouts and a useful empty state.

## Requirements

- Do not use mocked projects.
- The homepage must read projects from the SQLite `projects` table.
- Creating a project from the New Project flow must write to SQLite.
- Search must filter the loaded project records.
- Do not include All / Private / Public filters, Settings, the party/cone icon, or a user menu.

## Acceptance Criteria

- The homepage renders correctly on narrow and wide viewports.
- Project cards show persisted project names, descriptions, slugs, and timestamps.
- Search provides a clear no-results state.
- An empty database provides a clear empty state and New Project action.
- New Project validates input with Zod and persists a project through Drizzle.
- The theme toggle switches between light and dark modes.
- `npm run build` completes successfully.