@AGENTS.md

# src/CLAUDE.md

React TypeScript frontend implementation.

## Structure

```
src/
├── App.tsx                    # Main component
├── components/                # UI components
│   ├── PromptInput.tsx       # Input field + button
│   ├── ComponentCard.tsx     # Container for generated components
│   ├── LivePreview.tsx       # react-live sandbox
│   └── CodeView.tsx          # Syntax-highlighted code display
├── hooks/
│   └── useComponentGenerator.ts  # State management
├── types/
│   └── index.ts             # TypeScript definitions
├── App.css, index.css        # Styles (source only)
└── main.tsx                  # Entry point
```

## Key Dependencies

- **React 19**: Latest hooks, automatic JSX
- **react-live**: Runtime code execution (used by LivePreview)
- **Vite**: Hot module reload during development

## Development

Frontend auto-reloads via Vite. Edit files in `src/` and changes appear instantly at `http://localhost:5173`.
