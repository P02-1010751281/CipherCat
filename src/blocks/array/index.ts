export * from './partition';

import { PARTITION_BLOCK_TYPES, type PartitionBlockType } from './partition';

export const ARRAY_BLOCK_TYPES = [...PARTITION_BLOCK_TYPES] as const;

export type ArrayBlockType = PartitionBlockType;
