export * from './basic';
export * from './advanced';

import { PQ_BASIC_BLOCK_TYPES as BASIC, type PqBasicBlockType } from './basic';
import { PQ_ADVANCED_BLOCK_TYPES as ADVANCED, type PqAdvancedBlockType } from './advanced';

export const PQ_BLOCK_TYPES = [
  ...BASIC,
  ...ADVANCED,
] as const;

export type PostQuantumBlockType = PqBasicBlockType | PqAdvancedBlockType;

/** 后量子基础块：原子运算原语，不可再拆分 */
export { PQ_BASIC_BLOCK_TYPES } from './basic';

/** 后量子高级块：由基础块组合封装而成 */
export { PQ_ADVANCED_BLOCK_TYPES } from './advanced';
