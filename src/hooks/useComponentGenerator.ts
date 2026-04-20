import { useState, useCallback } from 'react';
import type { GeneratedComponent, Provider } from '../types';
import { parseSSEChunk } from '../utils/sseParser';

interface UseComponentGeneratorReturn {
  components: GeneratedComponent[];
  isLoading: boolean;
  error: string | null;
  generate: (prompt: string, apiKey: string | undefined, provider: Provider) => Promise<void>;
  removeComponent: (id: string) => void;
  clearAll: () => void;
}

export function useComponentGenerator(): UseComponentGeneratorReturn {
  const [components, setComponents] = useState<GeneratedComponent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string, apiKey: string | undefined, provider: Provider) => {
    setIsLoading(true);
    setError(null);

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    setComponents((prev) => [
      { id, prompt, code: '', createdAt: new Date(), isStreaming: true },
      ...prev,
    ]);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...(apiKey && { apiKey }), provider }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate component');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 완결된 SSE 라인들만 처리하고 나머지는 buffer에 유지
        const lastNewline = buffer.lastIndexOf('\n');
        if (lastNewline === -1) continue;

        const toProcess = buffer.slice(0, lastNewline + 1);
        buffer = buffer.slice(lastNewline + 1);

        for (const event of parseSSEChunk(toProcess)) {
          if (event.type === 'chunk') {
            setComponents((prev) =>
              prev.map((c) => (c.id === id ? { ...c, code: c.code + event.text } : c))
            );
          } else if (event.type === 'done') {
            setComponents((prev) =>
              prev.map((c) => (c.id === id ? { ...c, code: event.code, isStreaming: false } : c))
            );
          } else if (event.type === 'error') {
            throw new Error(event.message);
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setComponents((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setComponents([]);
  }, []);

  return { components, isLoading, error, generate, removeComponent, clearAll };
}
