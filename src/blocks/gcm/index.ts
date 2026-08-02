export * from './blocks';
import { GCM_BLOCK_TYPES, type GcmBlockType } from './blocks';

export const GCM_BLOCK_TYPES_LIST = [...GCM_BLOCK_TYPES] as const;
export type GcmBlockTypeList = (typeof GCM_BLOCK_TYPES_LIST)[number];

export type { GcmBlockType };
