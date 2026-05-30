export * from './curve';
export * from './field';
export * from './mod-inverse';
export * from './ntt';
export * from './poly-add';

import { CURVE_BLOCK_TYPES, type CurveBlockType } from './curve';
import { FIELD_BLOCK_TYPES, type FieldBlockType } from './field';
import { MOD_INVERSE_BLOCK_TYPES, type ModInverseBlockType } from './mod-inverse';
import { NTT_BLOCK_TYPES, type NttBlockType } from './ntt';
import { POLY_ADD_BLOCK_TYPES, type PolyAddBlockType } from './poly-add';

export const ECC_BLOCK_TYPES = CURVE_BLOCK_TYPES;
export const NT_BLOCK_TYPES = [
  ...FIELD_BLOCK_TYPES,
  ...MOD_INVERSE_BLOCK_TYPES,
  ...NTT_BLOCK_TYPES,
  ...POLY_ADD_BLOCK_TYPES,
] as const;

export type EccBlockType = CurveBlockType;
export type NtBlockType = FieldBlockType | ModInverseBlockType | NttBlockType | PolyAddBlockType;
