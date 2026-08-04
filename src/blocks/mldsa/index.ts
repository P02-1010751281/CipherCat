export * from './blocks';
export * from './primitives';
import { MLDSA_BLOCK_TYPES, type MldsaBlockType } from './blocks';
import { MLDSA_PRIMITIVE_BLOCK_TYPES, type MldsaPrimitiveBlockType } from './primitives';

export const MLDSA_BLOCK_TYPES_LIST = [...MLDSA_BLOCK_TYPES, ...MLDSA_PRIMITIVE_BLOCK_TYPES] as const;
export type MldsaBlockTypeList =
  | MldsaBlockType
  | MldsaPrimitiveBlockType;

export type { MldsaBlockType, MldsaPrimitiveBlockType };
