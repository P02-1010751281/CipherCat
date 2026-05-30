export * from './encoding';
export * from './compress';
export * from './operations';

import { ENCODING_BLOCK_TYPES, type EncodingBlockType } from './encoding';
import { COMPRESS_BLOCK_TYPES, type CompressBlockType } from './compress';
import { BASIC_OPERATIONS_BLOCK_TYPES, type BasicOperationsBlockType } from './operations';

/** 后量子基础块：基础编解码、压缩和辅助运算 */
export const PQ_BASIC_BLOCK_TYPES = [
  ...ENCODING_BLOCK_TYPES,
  ...COMPRESS_BLOCK_TYPES,
  ...BASIC_OPERATIONS_BLOCK_TYPES,
] as const;

export type PqBasicBlockType = EncodingBlockType | CompressBlockType | BasicOperationsBlockType;
