export * from './sha256';
export * from './sha3';
export * from './sm3';
export * from './shake';

import { SHA256_BLOCK_TYPES, type Sha256BlockType } from './sha256';
import { SHA3_BLOCK_TYPES, type Sha3BlockType } from './sha3';
import { SM3_BLOCK_TYPES, type Sm3BlockType } from './sm3';
import { SHAKE_BLOCK_TYPES, type ShakeBlockType } from './shake';

export const ALL_BLOCK_TYPES = [
  ...SHA256_BLOCK_TYPES,
  ...SM3_BLOCK_TYPES,
  ...SHA3_BLOCK_TYPES,
  ...SHAKE_BLOCK_TYPES,
] as const;

export type HashBlockType =
  | Sha256BlockType
  | Sha3BlockType
  | Sm3BlockType
  | ShakeBlockType;
