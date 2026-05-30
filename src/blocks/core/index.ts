// Core blocks: ctrl + data + array + logic
export * from './assignment';
export * from './iterate';
export * from './measurement';
export * from './convert';
export * from './number';
export * from './partition';
export * from './operation';
export * from './compound';
export * from './not';

import { ASSIGNMENT_BLOCK_TYPES, type AssignmentBlockType } from './assignment';
import { ITERATE_BLOCK_TYPES, type IterateBlockType } from './iterate';
import { MEASUREMENT_BLOCK_TYPES, type MeasurementBlockType } from './measurement';
import { CONVERT_BLOCK_TYPES, type ConvertBlockType } from './convert';
import { NUMBER_BLOCK_TYPES, type NumberBlockType } from './number';
import { PARTITION_BLOCK_TYPES, type PartitionBlockType } from './partition';
import { LGC_OPERATION_BLOCK_TYPES, type LgcOperationBlockType } from './operation';
import { COMPOUND_BLOCK_TYPES, type CompoundBlockType } from './compound';
import { LGC_NOT_BLOCK_TYPES, type LgcNotBlockType } from './not';

export const CORE_BLOCK_TYPES = [
  ...ASSIGNMENT_BLOCK_TYPES,
  ...ITERATE_BLOCK_TYPES,
  ...MEASUREMENT_BLOCK_TYPES,
  ...CONVERT_BLOCK_TYPES,
  ...NUMBER_BLOCK_TYPES,
  ...PARTITION_BLOCK_TYPES,
  ...LGC_OPERATION_BLOCK_TYPES,
  ...COMPOUND_BLOCK_TYPES,
  ...LGC_NOT_BLOCK_TYPES,
] as const;

export type CoreBlockType = 
  | AssignmentBlockType 
  | IterateBlockType 
  | MeasurementBlockType 
  | ConvertBlockType 
  | NumberBlockType 
  | PartitionBlockType 
  | LgcOperationBlockType 
  | CompoundBlockType 
  | LgcNotBlockType;
