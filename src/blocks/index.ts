export * from './ctrl';
export * from './data';
export * from './array';
export * from './logic';
export * from './bitwise';
export * from './sbox';
export * from './hash';
export * from './numtheory';
export * from './ecc';
export * from './post-quantum';

import { CTRL_BLOCK_TYPES, type CtrlBlockType } from './ctrl';
import { DATA_BLOCK_TYPES, type DataBlockType } from './data';
import { ARRAY_BLOCK_TYPES, type ArrayBlockType } from './array';
import { LOGIC_BLOCK_TYPES, type LogicBlockType } from './logic';
import { BIT_BLOCK_TYPES, type BitBlockType } from './bitwise';
import { ALL_SBOX_BLOCK_TYPES, type AllSBoxBlockType } from './sbox';
import {
  ALL_BLOCK_TYPES as HASH_BLOCK_TYPES,
  type HashBlockType,
} from './hash';
import { NT_BLOCK_TYPES, type NtBlockType } from './numtheory';
import { ECC_BLOCK_TYPES, type EccBlockType } from './ecc';
import { PQ_BLOCK_TYPES, type PostQuantumBlockType } from './post-quantum';

export const ALL_BLOCK_TYPES = [
  ...CTRL_BLOCK_TYPES,
  ...DATA_BLOCK_TYPES,
  ...ARRAY_BLOCK_TYPES,
  ...LOGIC_BLOCK_TYPES,
  ...BIT_BLOCK_TYPES,
  ...ALL_SBOX_BLOCK_TYPES,
  ...HASH_BLOCK_TYPES,
  ...NT_BLOCK_TYPES,
  ...ECC_BLOCK_TYPES,
  ...PQ_BLOCK_TYPES,
] as const;

export type AllBlockType =
  | CtrlBlockType
  | DataBlockType
  | ArrayBlockType
  | LogicBlockType
  | BitBlockType
  | AllSBoxBlockType
  | HashBlockType
  | NtBlockType
  | EccBlockType
  | PostQuantumBlockType;
