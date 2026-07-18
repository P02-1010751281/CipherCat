export * from './field';
export * from './mod-inverse';
export * from './ntt';
export * from './poly-add';
export * from './gf-mul';

import { FIELD_BLOCK_TYPES, type FieldBlockType } from './field';
import { MOD_INVERSE_BLOCK_TYPES, type ModInverseBlockType } from './mod-inverse';
import { NTT_BLOCK_TYPES, type NttBlockType } from './ntt';
import { POLY_ADD_BLOCK_TYPES, type PolyAddBlockType } from './poly-add';
import { GF_BLOCK_TYPES, type GfBlockType } from './gf-mul';

export const NT_BLOCK_TYPES = [
  ...FIELD_BLOCK_TYPES,
  ...MOD_INVERSE_BLOCK_TYPES,
  ...NTT_BLOCK_TYPES,
  ...POLY_ADD_BLOCK_TYPES,
  ...GF_BLOCK_TYPES,
] as const;

export type NtBlockType = FieldBlockType | ModInverseBlockType | NttBlockType | PolyAddBlockType | GfBlockType;
