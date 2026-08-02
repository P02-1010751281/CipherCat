export * from './blocks';
import { XTS_BLOCK_TYPES, type XtsBlockType } from './blocks';

export const XTS_BLOCK_TYPES_LIST = [...XTS_BLOCK_TYPES] as const;
export type XtsBlockTypeList = (typeof XTS_BLOCK_TYPES_LIST)[number];

export type { XtsBlockType };
