# AGENTS.md

Operational rules and constraints for Claude when working on react-component-generator.

## Operational Commands

All development uses **Bun exclusively**. npm, yarn, pnpm are forbidden.

```bash
# Development
bun install           # Install dependencies
bun run dev           # Start both frontend (Vite:5173) and backend API concurrently
bun run server        # Backend only (Bun watch mode)

# Build & Quality
bun run build         # Compile TypeScript and bundle Vite
bun run preview       # Run production build locally
bun run lint          # Run ESLint
```

## Golden Rules

### Component Generation (Non-Negotiable)

Generated component code MUST follow these constraints exactly:

1. **Inline styles only** — No CSS imports, no CSS modules, no external stylesheets
2. **Plain JavaScript** — No TypeScript syntax, no type annotations in generated code
3. **Hooks via React namespace** — Use `React.useState`, `React.useEffect`, not direct imports
4. **Single export + render** — Exactly one component function + `render(<Component />)` call
5. **Self-contained** — No dependencies outside React, no async imports

These constraints exist because generated code runs in `react-live` sandbox which enforces strict isolation.

### Source Code vs Generated Code

| Location | Language | Constraints |
|----------|----------|-------------|
| Source (`src/`, `server/`) | TypeScript | Full type system allowed, imports encouraged |
| Generated (output) | Plain JS | No types, inline styles only, `React.*` namespace |

### API Provider Switching

- Backend (`server/index.ts`) abstracts provider selection
- Frontend never handles API keys directly (except optional UI input)
- System prompt in `server/index.ts` enforces generation constraints
- Supported: Anthropic Claude (haiku-4-5-20251001), Google Gemini (2.5-flash)

## Context Map (Action-Based Routing)

- **[Frontend changes (React/TypeScript)](./src/AGENTS.md)** — UI components, hooks, state management, styling
- **[Backend changes (Provider integration)](./server/AGENTS.md)** — API endpoints, system prompt, provider logic

## Development Standards

### Testing Generated Components

After prompt submission:
1. Check browser console for errors in sandbox execution
2. Verify inline styles render correctly (no missing stylesheets)
3. Test React.useState/useEffect work in react-live context
4. If animation/async: test component remount behavior

### When Adding Features

- Frontend changes: hot-reload at http://localhost:5173 (no restart needed)
- Backend changes: restart `bun run server` automatically via watch mode
- New prompts: validate they produce valid react-live code (test in UI)

### Code Review Criteria

- Does generated code meet constraint checklist above?
- Are TypeScript/type annotations absent from generation output?
- Does system prompt in `server/index.ts` cover the new scenario?
- No hardcoded API keys anywhere (use .env or UI input only)

## Maintenance Policy

If code behavior conflicts with these rules, update AGENTS.md immediately. Don't add workarounds.
