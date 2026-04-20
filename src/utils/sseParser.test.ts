import { describe, it, expect } from 'vitest';
import { parseSSEChunk } from './sseParser';

describe('parseSSEChunk', () => {
  it('빈 문자열은 빈 배열 반환', () => {
    expect(parseSSEChunk('')).toEqual([]);
  });

  it('chunk 이벤트 파싱', () => {
    const input = 'data: {"type":"chunk","text":"const"}\n\n';
    expect(parseSSEChunk(input)).toEqual([{ type: 'chunk', text: 'const' }]);
  });

  it('done 이벤트 파싱', () => {
    const input = 'data: {"type":"done","code":"render(<App />)"}\n\n';
    expect(parseSSEChunk(input)).toEqual([{ type: 'done', code: 'render(<App />)' }]);
  });

  it('error 이벤트 파싱', () => {
    const input = 'data: {"type":"error","message":"API failed"}\n\n';
    expect(parseSSEChunk(input)).toEqual([{ type: 'error', message: 'API failed' }]);
  });

  it('한 청크에 여러 이벤트가 있을 때 모두 반환', () => {
    const input =
      'data: {"type":"chunk","text":"a"}\n\ndata: {"type":"chunk","text":"b"}\n\n';
    expect(parseSSEChunk(input)).toEqual([
      { type: 'chunk', text: 'a' },
      { type: 'chunk', text: 'b' },
    ]);
  });

  it('JSON 파싱 불가 라인은 무시', () => {
    const input = 'data: not-valid-json\n\n';
    expect(parseSSEChunk(input)).toEqual([]);
  });
});
