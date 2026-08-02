export * from './blocks';
import { ASCON_BLOCK_TYPES, type AsconBlockType } from './blocks';

export const ASCON_BLOCK_TYPES_LIST = [...ASCON_BLOCK_TYPES] as const;
export type AsconBlockTypeList = (typeof ASCON_BLOCK_TYPES_LIST)[number];

export type { AsconBlockType };
