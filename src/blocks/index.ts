export * from './core';
export * from './bitwise';
export * from './sbox';
export * from './hash';
export * from './number-theory';
export * from './post-quantum';

import { CORE_BLOCK_TYPES, type CoreBlockType } from './core';
import { BIT_BLOCK_TYPES, type BitBlockType } from './bitwise';
import { ALL_SBOX_BLOCK_TYPES, type AllSBoxBlockType } from './sbox';
import { ALL_BLOCK_TYPES as HASH_BLOCK_TYPES, type HashBlockType } from './hash';
import { ECC_BLOCK_TYPES, NT_BLOCK_TYPES, type EccBlockType, type NtBlockType } from './number-theory';
import { PQ_BLOCK_TYPES, type PostQuantumBlockType } from './post-quantum';

export const ALL_BLOCK_TYPES = [
  ...CORE_BLOCK_TYPES,
  ...BIT_BLOCK_TYPES,
  ...ALL_SBOX_BLOCK_TYPES,
  ...HASH_BLOCK_TYPES,
  ...NT_BLOCK_TYPES,
  ...ECC_BLOCK_TYPES,
  ...PQ_BLOCK_TYPES,
] as const;

export type AllBlockType = 
  | CoreBlockType 
  | BitBlockType 
  | AllSBoxBlockType 
  | HashBlockType 
  | NtBlockType
  | EccBlockType 
  | PostQuantumBlockType;
