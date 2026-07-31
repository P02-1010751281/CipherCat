export * from './field';
export * from './mod-inverse';
export * from './ntt';
export * from './poly-add';
export * from './poly-sub';
export * from './gf2m';

import { FIELD_BLOCK_TYPES, type FieldBlockType } from './field';
import { MOD_INVERSE_BLOCK_TYPES, type ModInverseBlockType } from './mod-inverse';
import { NTT_BLOCK_TYPES, type NttBlockType } from './ntt';
import { POLY_ADD_BLOCK_TYPES, type PolyAddBlockType } from './poly-add';
import { POLY_SUB_BLOCK_TYPES, type PolySubBlockType } from './poly-sub';
import { GF2M_BLOCK_TYPES, type Gf2mBlockType } from './gf2m';

export const NT_BLOCK_TYPES = [
  ...FIELD_BLOCK_TYPES,
  ...MOD_INVERSE_BLOCK_TYPES,
  ...NTT_BLOCK_TYPES,
  ...POLY_ADD_BLOCK_TYPES,
  ...POLY_SUB_BLOCK_TYPES,
  ...GF2M_BLOCK_TYPES,
] as const;

export type NtBlockType = FieldBlockType | ModInverseBlockType | NttBlockType | PolyAddBlockType | Gf2mBlockType;
