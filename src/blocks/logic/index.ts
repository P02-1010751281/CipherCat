export * from './compound';
export * from './not';
export * from './operation';

import { COMPOUND_BLOCK_TYPES, type CompoundBlockType } from './compound';
import { LGC_NOT_BLOCK_TYPES, type LgcNotBlockType } from './not';
import { LGC_OPERATION_BLOCK_TYPES, type LgcOperationBlockType } from './operation';

export const LOGIC_BLOCK_TYPES = [
  ...COMPOUND_BLOCK_TYPES,
  ...LGC_NOT_BLOCK_TYPES,
  ...LGC_OPERATION_BLOCK_TYPES,
] as const;

export type LogicBlockType = CompoundBlockType | LgcNotBlockType | LgcOperationBlockType;
