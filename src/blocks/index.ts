export * from './ctrl';
export * from './data';
export * from './array';
export * from './logic';
export * from './bitwise';
export * from './sbox';
export * from './hash';
export * from './numtheory';
export * from './ecc';
export * from './zuc';
export * from './post-quantum';
export * from './procedure';
export * from './symmetric';
export * from './remaining';

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
import { ZUC_BLOCK_TYPES, type ZucBlockType } from './zuc';
import { PQ_BLOCK_TYPES, type PostQuantumBlockType } from './post-quantum';
import {
  PROCEDURE_BLOCK_TYPES,
  type ProcedureBlockType,
} from './procedure';
import {
  SYMMETRIC_BLOCK_TYPES,
  type SymmetricBlockType,
} from './symmetric';
import {
  REMAINING_BLOCK_TYPES,
  type RemainingBlockType,
} from './remaining';

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
  ...ZUC_BLOCK_TYPES,
  ...PQ_BLOCK_TYPES,
  ...PROCEDURE_BLOCK_TYPES,
  ...SYMMETRIC_BLOCK_TYPES,
  ...REMAINING_BLOCK_TYPES,
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
  | ZucBlockType
  | PostQuantumBlockType
  | ProcedureBlockType
  | SymmetricBlockType
  | RemainingBlockType;
