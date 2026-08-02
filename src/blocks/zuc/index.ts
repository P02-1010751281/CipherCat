export * from './blocks';
import { ZUC_BLOCK_TYPES, type ZucBlockType } from './blocks';

export const ZUC_BLOCK_TYPES_LIST = [...ZUC_BLOCK_TYPES] as const;
export type ZucBlockTypeList = (typeof ZUC_BLOCK_TYPES_LIST)[number];

export type { ZucBlockType };
