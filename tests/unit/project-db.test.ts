// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

function makeIndexedDbHarness() {
  const request: {
    result?: unknown;
    error: Error | null;
    onsuccess?: (event: Event) => void;
    onerror?: (event: Event) => void;
  } = { result: undefined, error: null };
  const openRequest: {
    result?: unknown;
    error: Error | null;
    onsuccess?: (event: Event) => void;
    onerror?: (event: Event) => void;
  } = { result: undefined, error: null };
  const transaction: {
    error: Error | null;
    oncomplete?: (event: Event) => void;
    onerror?: (event: Event) => void;
    onabort?: (event: Event) => void;
    objectStore: () => { put: () => typeof request };
  } = {
    error: null,
    objectStore: () => ({ put: () => request }),
  };
  const db = {
    close: vi.fn(),
    objectStoreNames: { contains: () => true },
    transaction: () => transaction,
  };
  vi.stubGlobal('indexedDB', {
    open: () => {
      queueMicrotask(() => {
        openRequest.result = db;
        openRequest.onsuccess?.(new Event('success'));
      });
      return openRequest;
    },
  });
  return { request, transaction };
}

const project = {
  name: 'test',
  workspace: '<xml/>',
  format: 'xml' as const,
  language: 'python',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('project IndexedDB writes', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('resolves only after the read-write transaction commits', async () => {
    const { request, transaction } = makeIndexedDbHarness();
    const db = await import('@/composables/useProjectDB');
    const saving = db.saveProject(project);
    for (let i = 0; i < 5 && !request.onsuccess; i += 1) await Promise.resolve();

    request.result = 17;
    request.onsuccess?.(new Event('success'));
    let settled = false;
    void saving.then(() => { settled = true; }, () => { settled = true; });
    await Promise.resolve();
    expect(settled).toBe(false);

    transaction.oncomplete?.(new Event('complete'));
    await expect(saving).resolves.toBe(17);
  });

  it('rejects when IndexedDB aborts after the object-store request succeeds', async () => {
    const { request, transaction } = makeIndexedDbHarness();
    const db = await import('@/composables/useProjectDB');
    const saving = db.saveProject(project);
    for (let i = 0; i < 5 && !request.onsuccess; i += 1) await Promise.resolve();

    request.result = 17;
    request.onsuccess?.(new Event('success'));
    transaction.error = new Error('aborted');
    transaction.onabort?.(new Event('abort'));
    await expect(saving).rejects.toThrow('aborted');
  });
});
