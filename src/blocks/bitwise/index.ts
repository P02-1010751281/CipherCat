export * from './expression';
export * from './operation';
export * from './rotate';
export * from './not';
export * from './byte-substitute';

import { EXPRESSION_BLOCK_TYPES, type ExpressionBlockType } from './expression';
import { OPERATION_BLOCK_TYPES, type OperationBlockType } from './operation';
import { ROTATE_BLOCK_TYPES, type RotateBlockType } from './rotate';
import { NOT_BLOCK_TYPES, type NotBlockType } from './not';
import { BYTE_SUBSTITUTE_BLOCK_TYPES, type ByteSubstituteBlockType } from './byte-substitute';

export const BIT_BLOCK_TYPES = [
  ...EXPRESSION_BLOCK_TYPES,
  ...OPERATION_BLOCK_TYPES,
  ...ROTATE_BLOCK_TYPES,
  ...NOT_BLOCK_TYPES,
  ...BYTE_SUBSTITUTE_BLOCK_TYPES,
] as const;

export type BitBlockType = ExpressionBlockType | OperationBlockType | RotateBlockType | NotBlockType | ByteSubstituteBlockType;
