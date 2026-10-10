const getTypedArrayName = Object.getOwnPropertyDescriptor(
  Object.getPrototypeOf(Uint8Array.prototype),
  Symbol.toStringTag,
)?.get;

export function isNativeUint8Array(value: unknown): value is Uint8Array {
  return ArrayBuffer.isView(value)
    && getTypedArrayName?.call(value) === 'Uint8Array'
    && Object.getPrototypeOf(value) === Uint8Array.prototype;
}
