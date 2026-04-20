# src/AGENTS.md

Governance rules for React TypeScript frontend implementation.

## Module Context

React 19 + TypeScript application using Vite. Main entry: `App.tsx`. Manages UI state (provider selection, API keys), displays generated components, handles API communication with backend.

## Component Architecture

### App.tsx (Top Level)
- Provider selection (Anthropic/Google)
- API key input (with .env detection)
- Delegates generation to `useComponentGenerator` hook
- Routes to sub-components: PromptInput, ComponentCard, LivePreview, CodeView
- Handles errors and loading state

### Custom Hooks

**useComponentGenerator.ts**
- Core state: `components[]`, `isLoading`, `error`
- Methods: `generate(prompt, apiKey?, provider)`, `removeComponent(id)`, `clearAll()`
- Calls `/api/generate` endpoint, stores results
- Handles error from backend

### UI Components
- **PromptInput**: Text input for component description + generate button
- **ComponentCard**: Container for each generated component (title, actions)
- **LivePreview**: Renders code in react-live environment
- **CodeView**: Displays syntax-highlighted generated code

## TypeScript Standards

- All source files typed (no `any`)
- Use `import type` for type-only imports
- Type definitions in `types/index.ts`
- Props interfaces named `{ComponentName}Props`

## State Management

Do not add Redux, Zustand, or external state libraries. Keep state local to components or in custom hooks. `useComponentGenerator` is the single source of truth for generated components.

## API Communication

Frontend communicates with backend at `http://localhost:3002`:
- **GET /api/config**: On mount, detect which providers have .env keys
- **POST /api/generate**: Send prompt + provider, receive generated code

Never:
- Hardcode API endpoints (use relative paths or env vars)
- Store API keys in localStorage permanently
- Make direct calls to Anthropic/Google APIs (proxy through backend)

## Live Preview Integration

`LivePreview` uses react-live to execute generated code in sandbox. Code MUST:
- Be valid plain JavaScript (no TypeScript)
- Use inline styles only
- Include `render(<Component />)` call
- Not import external modules

If generated code fails to execute, error message appears in browser console. Check backend SYSTEM_PROMPT if pattern is broken.

## CSS Strategy

Source code uses CSS modules (`App.css`, `index.css`). Generated component code never imports these. Keep source styles separate from generated scope.

## Error Handling

Errors from backend appear in error banner. User-friendly messages:
- Missing API key: prompt for key entry or .env setup
- Rate limit (429): "Too many requests, try again later"
- Overload (503): "API service temporarily unavailable"
- Invalid code: React-live console shows execution error

## Development Checklist

When modifying:
1. Type check: `bun run build` (tsc)
2. Lint: `bun run lint`
3. Test flow: Provider selection → API key → Prompt → Code generation → Preview
4. Browser console: No errors during component render
5. Dark mode / light mode: Check CSS contrast (if theme added)

## Maintenance

If adding features:
- Keep hook interface simple (avoid callback hell)
- Use TypeScript for source, but respect generated code constraints
- Test with both providers (they may format code slightly differently)
- Update `types/index.ts` if new types emerge
