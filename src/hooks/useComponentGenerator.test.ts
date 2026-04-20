import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useComponentGenerator } from './useComponentGenerator';

function makeSSEStream(events: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let i = 0;
  return new ReadableStream({
    pull(controller) {
      if (i < events.length) {
        controller.enqueue(encoder.encode(events[i++]));
      } else {
        controller.close();
      }
    },
  });
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useComponentGenerator', () => {
  it('초기 상태: 컴포넌트 없음, 로딩 아님, 에러 없음', () => {
    const { result } = renderHook(() => useComponentGenerator());
    expect(result.current.components).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('generate 호출 즉시 isStreaming:true 컴포넌트가 리스트에 추가됨', async () => {
    const stream = makeSSEStream([
      'data: {"type":"done","code":"render(<App/>)"}\n\n',
    ]);
    vi.mocked(fetch).mockResolvedValue({ ok: true, body: stream } as unknown as Response);

    const { result } = renderHook(() => useComponentGenerator());

    act(() => {
      result.current.generate('버튼 컴포넌트', undefined, 'anthropic');
    });

    await waitFor(() => {
      expect(result.current.components.length).toBe(1);
    });

    // 호출 직후 isStreaming이 true였거나, 완료 후 false인지 확인
    await waitFor(() => {
      expect(result.current.components[0].isStreaming).toBe(false);
    });
  });

  it('chunk 이벤트 수신 시 code가 누적됨', async () => {
    const stream = makeSSEStream([
      'data: {"type":"chunk","text":"const "}\n\n',
      'data: {"type":"chunk","text":"App"}\n\n',
      'data: {"type":"done","code":"const App=()=><div/>;render(<App/>)"}\n\n',
    ]);
    vi.mocked(fetch).mockResolvedValue({ ok: true, body: stream } as unknown as Response);

    const { result } = renderHook(() => useComponentGenerator());

    await act(async () => {
      await result.current.generate('앱 컴포넌트', undefined, 'google');
    });

    expect(result.current.components[0].code).toBe('const App=()=><div/>;render(<App/>)');
    expect(result.current.components[0].isStreaming).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('done 이벤트 후 isStreaming=false, isLoading=false', async () => {
    const stream = makeSSEStream([
      'data: {"type":"done","code":"render(<Done/>)"}\n\n',
    ]);
    vi.mocked(fetch).mockResolvedValue({ ok: true, body: stream } as unknown as Response);

    const { result } = renderHook(() => useComponentGenerator());

    await act(async () => {
      await result.current.generate('완료 테스트', undefined, 'anthropic');
    });

    expect(result.current.components[0].isStreaming).toBe(false);
    expect(result.current.components[0].code).toBe('render(<Done/>)');
    expect(result.current.isLoading).toBe(false);
  });

  it('error 이벤트 수신 시 error 상태 세팅, streaming 컴포넌트 제거', async () => {
    const stream = makeSSEStream([
      'data: {"type":"error","message":"API 오류"}\n\n',
    ]);
    vi.mocked(fetch).mockResolvedValue({ ok: true, body: stream } as unknown as Response);

    const { result } = renderHook(() => useComponentGenerator());

    await act(async () => {
      await result.current.generate('에러 테스트', undefined, 'anthropic');
    });

    expect(result.current.error).toBe('API 오류');
    expect(result.current.components).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});
