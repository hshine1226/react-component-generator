export type SSEEvent =
  | { type: 'chunk'; text: string }
  | { type: 'done'; code: string }
  | { type: 'error'; message: string };

export function parseSSEChunk(raw: string): SSEEvent[] {
  const events: SSEEvent[] = [];
  for (const line of raw.split('\n')) {
    if (!line.startsWith('data: ')) continue;
    try {
      events.push(JSON.parse(line.slice(6)) as SSEEvent);
    } catch {
      // 파싱 불가 라인 무시
    }
  }
  return events;
}
