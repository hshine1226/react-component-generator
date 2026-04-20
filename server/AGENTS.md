# server/AGENTS.md

Governance rules for backend AI provider integration and component generation.

## Module Context

Single-file Bun server (`index.ts`) acts as provider abstraction layer. Enforces react-live component generation constraints via system prompt. Routes requests to Anthropic Claude or Google Gemini based on provider field.

## API Endpoints

### GET /api/config
Returns which providers have API keys configured in .env.

```json
{
  "envKeys": {
    "anthropic": true,
    "google": false
  }
}
```

Frontend uses this to enable/disable provider buttons.

### POST /api/generate
Accepts `{prompt, apiKey?, provider}`. Returns `{code}` or error.

**Request:**
```json
{
  "prompt": "A button with gradient background",
  "provider": "anthropic",
  "apiKey": "sk-ant-..." // optional if .env is set
}
```

**Response (success):**
```json
{
  "code": "const GradientButton = () => { ... };\nrender(<GradientButton />);"
}
```

**Response (error):**
```json
{
  "error": "API key is required..."
}
```

## SYSTEM_PROMPT Modifications

SYSTEM_PROMPT defines component generation constraints. When modifying:

1. **Never remove inline-styles-only rule** — react-live cannot import CSS modules
2. **Never allow TypeScript syntax** — Browsers executing in react-live cannot parse TS
3. **Never allow bare imports** — Must use `React.useState`, not `import { useState }`
4. **Always include render() call** — Code must include `render(<ComponentName />)`
5. **Test changes in UI** — Generate a sample component and verify it renders

If changing constraints, test against known-good examples in git history.

## Provider Integration Rules

### Anthropic Claude (haiku-4-5-20251001)

- Model size: 4B parameters, optimized for speed
- Max tokens: 4096 (limited by model)
- Headers required: `x-api-key`, `anthropic-version: 2023-06-01`
- Error handling: Check `response.status` for rate limits (429), overload (503)
- Response format: `content[0].text` is the generated code

### Google Gemini (2.5-flash)

- Model: Flash version (faster than Pro)
- Max tokens: 8192 (server-side config)
- API format: Different from Anthropic (system_instruction vs messages)
- Error handling: Check `finishReason === 'MAX_TOKENS'` for truncation
- Response format: `candidates[0].content.parts[0].text`

Do not mix provider APIs — keep handlers separate.

## Helper Functions

### stripCodeFences(text)
Removes markdown code fences (e.g. \`\`\`jsx ... \`\`\`). Some providers wrap output in fences, others don't.

### ensureRenderCall(code)
Appends `render(<ComponentName />)` if missing. Detects first PascalCase function name.

### resolveApiKey(provider, clientKey)
Priority: clientKey (from UI) > .env > null. Returns null if no key found.

## Error Handling Patterns

- **400 Bad Request**: Missing API key or prompt
- **429 Too Many Requests**: Rate limit — return user-friendly message
- **503 Service Unavailable**: Provider overload — return user-friendly message
- **Other 5xx**: Return error message from API response

All error responses include CORS headers.

## Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-...      # Optional (can be entered in UI)
GOOGLE_API_KEY=AIza...            # Optional (can be entered in UI)
```

Store in `.env` or pass via deployment secrets. Never hardcode.

## Testing Checklist

When modifying provider logic or system prompt:

1. Generate 3 different components via UI (each provider)
2. Verify no TypeScript syntax appears in output
3. Verify inline styles only (no `import` statements)
4. Check browser console for react-live execution errors
5. Test with invalid API key — confirm error message is clear
6. Test missing prompt — confirm validation fires

## Maintenance

If provider API changes (deprecation, new model), update:
1. Model name in `callAnthropic()` or `callGoogle()`
2. API endpoint if moved
3. Response format if schema changed
4. SYSTEM_PROMPT if new constraints required
5. This file with updated rules

Do not add provider-specific workarounds in frontend — solve in backend.
