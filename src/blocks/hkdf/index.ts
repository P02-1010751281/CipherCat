export * from './blocks';
import { HKDF_BLOCK_TYPES, type HkdfBlockType } from './blocks';

export const HKDF_BLOCK_TYPES_LIST = [...HKDF_BLOCK_TYPES] as const;
export type HkdfBlockTypeList = (typeof HKDF_BLOCK_TYPES_LIST)[number];

export type { HkdfBlockType };
