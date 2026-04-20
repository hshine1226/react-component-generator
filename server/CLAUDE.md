@AGENTS.md

# server/CLAUDE.md

Backend server implementation using Bun runtime.

## Overview

Single-file Bun HTTP server (`index.ts`) serving on port 3002. Acts as proxy to AI providers (Anthropic Claude, Google Gemini) and enforces component generation constraints via system prompt.

## Key Responsibilities

1. **Provider Abstraction**: Routes requests to appropriate API (Anthropic or Google)
2. **SYSTEM_PROMPT Enforcement**: Defines rules for generated React components
3. **Code Cleanup**: Strips markdown fences, ensures render() calls
4. **Error Handling**: Rate limiting, API errors, missing keys
5. **CORS Support**: Allows requests from frontend (http://localhost:5173)

## API Contract

- **GET /api/config**: Returns available providers based on .env keys
- **POST /api/generate**: Accepts prompt + provider, returns generated code

## Development

```bash
bun run server      # Watch mode (auto-restart on file changes)
```

Server runs at `http://localhost:3002`. Frontend proxies to this for AI requests.
