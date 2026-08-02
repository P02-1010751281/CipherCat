export * from './blocks';
import { CMAC_BLOCK_TYPES, type CmacBlockType } from './blocks';

export const CMAC_BLOCK_TYPES_LIST = [...CMAC_BLOCK_TYPES] as const;
export type CmacBlockTypeList = (typeof CMAC_BLOCK_TYPES_LIST)[number];

export type { CmacBlockType };
