export * from './blocks';
import { MLDSA_BLOCK_TYPES, type MldsaBlockType } from './blocks';

export const MLDSA_BLOCK_TYPES_LIST = [...MLDSA_BLOCK_TYPES] as const;
export type MldsaBlockTypeList = (typeof MLDSA_BLOCK_TYPES_LIST)[number];

export type { MldsaBlockType };
