import { describe, expect, it } from 'vitest';

import { isNativeUint8Array } from './helpers/native-bytes';

describe('native Uint8Array contract', () => {
  it('accepts a native Uint8Array', () => {
    expect(isNativeUint8Array(new Uint8Array([0, 255]))).toBe(true);
  });

  it.each([
    ['Int8Array', () => new Int8Array([-1])],
    ['Uint8ClampedArray', () => new Uint8ClampedArray([255])],
    ['Int16Array', () => new Int16Array([255])],
    ['Float32Array', () => new Float32Array([255])],
    ['DataView', () => new DataView(new ArrayBuffer(1))],
    ['Buffer', () => Buffer.from([255])],
    ['prototype forgery', () => Object.create(Uint8Array.prototype)],
    ['Proxy-wrapped view', () => new Proxy(new Uint8Array(1), {})],
  ])('rejects %s', (_label, createValue) => {
    expect(isNativeUint8Array(createValue())).toBe(false);
  });

  it('rejects an Int8Array even if its prototype and toStringTag are forged', () => {
    const value = new Int8Array([-1]);
    Object.setPrototypeOf(value, Uint8Array.prototype);
    Object.defineProperty(value, Symbol.toStringTag, { value: 'Uint8Array' });

    expect(ArrayBuffer.isView(value)).toBe(true);
    expect(Object.getPrototypeOf(value)).toBe(Uint8Array.prototype);
    expect(isNativeUint8Array(value)).toBe(false);
  });
});
