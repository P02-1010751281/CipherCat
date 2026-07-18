/**
 * 对称密码块定义聚合索引
 */
export * from './aes/blocks';
export * from './sm4/blocks';
export * from './padding/blocks';

import { AES_BLOCK_TYPES, type AesBlockType } from './aes/blocks';
import { SM4_BLOCK_TYPES, type Sm4BlockType } from './sm4/blocks';
import { PADDING_BLOCK_TYPES, type PaddingBlockType } from './padding/blocks';

export const SYMMETRIC_BLOCK_TYPES = [
  ...AES_BLOCK_TYPES,
  ...SM4_BLOCK_TYPES,
  ...PADDING_BLOCK_TYPES,
] as const;

export type SymmetricBlockType =
  | AesBlockType
  | Sm4BlockType
  | PaddingBlockType;
