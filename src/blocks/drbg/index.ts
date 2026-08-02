export * from './blocks';

import { DRBG_BLOCK_TYPES, type DrbgBlockType } from './blocks';

export const DRBG_BLOCK_TYPES_LIST = [...DRBG_BLOCK_TYPES] as const;
export type DrbgBlockTypeList = (typeof DRBG_BLOCK_TYPES_LIST)[number];

export type { DrbgBlockType };
