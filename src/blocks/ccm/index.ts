export * from './blocks';
import { CCM_BLOCK_TYPES, type CcmBlockType } from './blocks';

export const CCM_BLOCK_TYPES_LIST = [...CCM_BLOCK_TYPES] as const;
export type CcmBlockTypeList = (typeof CCM_BLOCK_TYPES_LIST)[number];

export type { CcmBlockType };
