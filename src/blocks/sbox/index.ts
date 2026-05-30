export * from './sbox';
import './sbox_variables';

import { SBOX_BLOCK_TYPES, type SBoxBlockType } from './sbox';
import { SBOX_VAR_BLOCK_TYPES, type SBoxVarBlockType } from './sbox_variables';

export const ALL_SBOX_BLOCK_TYPES = [
  ...SBOX_BLOCK_TYPES,
  ...SBOX_VAR_BLOCK_TYPES,
] as const;

export type AllSBoxBlockType = SBoxBlockType | SBoxVarBlockType;
