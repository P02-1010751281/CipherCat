export * from './blocks';
import { X25519_BLOCK_TYPES, type X25519BlockType } from './blocks';

export const X25519_BLOCK_TYPES_LIST = [...X25519_BLOCK_TYPES] as const;
export type X25519BlockTypeList = (typeof X25519_BLOCK_TYPES_LIST)[number];

export type { X25519BlockType };
