@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

```bash
# Install dependencies
bun install

# (Optional) Set up environment variables
cp .env.example .env
# Add ANTHROPIC_API_KEY or GOOGLE_API_KEY to .env

# Run frontend + backend server together
bun run dev

# Frontend will be available at http://localhost:5173
```

## Architecture Overview

This is a full-stack React component generator with a dual-process architecture:

### Frontend (React + TypeScript + Vite)
- **Location**: `src/`
- **Key Files**:
  - `App.tsx` - Main component, handles UI layout and provider/API key management
  - `hooks/useComponentGenerator.ts` - Core state management for generated components
  - `components/` - UI components (PromptInput, ComponentCard, LivePreview, CodeView)
  - `types/index.ts` - TypeScript type definitions
- **State Flow**: User input → API call → Component generation → Display with live preview
- **Live Preview**: Uses `react-live` to render generated component code in the browser

### Backend (Bun Server)
- **Location**: `server/index.ts`
- **Purpose**: 
  - Acts as an API proxy to abstract provider switching
  - Enforces React component generation constraints via system prompt
  - Supports multiple AI providers (Anthropic Claude, Google Gemini)
- **Key Features**:
  - Configures system prompt for consistent React component generation
  - Uses inline styles only (no CSS imports)
  - Generates plain JavaScript (no TypeScript syntax)
  - Components use react-live scope for execution
- **API Endpoints**:
  - `GET /api/config` - Returns which providers have API keys configured in .env
  - `POST /api/generate` - Accepts `{prompt, apiKey?, provider}` and returns `{code}`

## Common Commands

```bash
# Development
bun run dev          # Run both frontend and backend with live reload
bun run server       # Run backend only (with watch mode)

# Build & Deploy
bun run build        # Compile TypeScript and build Vite bundle
bun run preview      # Preview production build locally

# Code Quality
bun run lint         # Run ESLint on the project
```

## Development Workflow

1. **Frontend Changes**: Edit files in `src/`, Vite auto-reloads at http://localhost:5173
2. **Backend Changes**: Edit `server/index.ts`, Bun watch mode auto-restarts the server
3. **Test Component Generation**: 
   - Use the UI to enter a prompt
   - Component code is generated via AI and displayed in live preview
   - Check browser console for errors in generated component code

## Provider Integration

The project supports two AI providers:
- **Anthropic Claude**: Model `claude-haiku-4-5-20251001`
- **Google Gemini**: Model `gemini-2.5-flash`

API keys can be:
- Set in `.env` file (preferred for development)
- Entered directly in the UI (for testing without .env)

The backend automatically determines which provider to use based on the `provider` field in the request.

## Component Generation Constraints

The system prompt in `server/index.ts` enforces:
- **Inline styles only** (no CSS imports/modules)
- **Plain JavaScript** (no TypeScript, no type annotations)
- **Self-contained components** that don't require external dependencies
- **React.useState and React.useEffect** for hooks (not direct imports)
- **Single component function** followed by `render(<Component />)` call

These constraints ensure generated code works in the react-live sandbox environment.

## Key Dependencies

- **React 19**: UI framework
- **Vite**: Frontend bundler and dev server
- **TypeScript**: Type safety for source code
- **react-live**: Runtime component rendering
- **Bun**: JavaScript runtime for backend server
- **concurrently**: Runs frontend and backend processes together
