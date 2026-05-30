export * from './sampling';
export * from './operations';

import { ADVANCED_SAMPLING_BLOCK_TYPES, type AdvancedSamplingBlockType } from './sampling';
import { ADVANCED_OPERATIONS_BLOCK_TYPES, type AdvancedOperationsBlockType } from './operations';

/** 后量子高级块：由基础块组合封装而成 */
export const PQ_ADVANCED_BLOCK_TYPES = [
  ...ADVANCED_SAMPLING_BLOCK_TYPES,
  ...ADVANCED_OPERATIONS_BLOCK_TYPES,
] as const;

export type PqAdvancedBlockType = AdvancedSamplingBlockType | AdvancedOperationsBlockType;
