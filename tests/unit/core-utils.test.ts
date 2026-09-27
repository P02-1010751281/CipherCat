import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  errorHandler,
  safeExecute,
  safeExecuteAsync,
} from '@/utils/errorHandler';
import {
  getTypeCoercion,
} from '@/constants/block-types';

describe('core utility behavior', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    errorHandler.clearErrors();
  });

  afterEach(() => {
    consoleError.mockClear();
  });

  it('returns successful synchronous and asynchronous results', async () => {
    expect(safeExecute(() => 42)).toBe(42);
    await expect(safeExecuteAsync(async () => 'ok')).resolves.toBe('ok');
  });

  it('records failures and returns undefined', async () => {
    expect(
      safeExecute(() => {
        throw new Error('sync failure');
      }),
    ).toBeUndefined();
    await expect(
      safeExecuteAsync(async () => {
        throw new Error('async failure');
      }),
    ).resolves.toBeUndefined();
    expect(errorHandler.getErrors()).toHaveLength(2);
  });

  it('returns explicit generator coercions when available', () => {
    expect(getTypeCoercion('Number', 'Bytes', 'value', 'python')).toBe(
      'bytes(value)',
    );
    expect(getTypeCoercion('Number', 'SBox', 'value', 'javascript')).toBeNull();
  });
});
