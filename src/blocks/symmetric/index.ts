export * from './aes';
export * from './sm4';
export * from './padding';
export * from './convenience';
import { AES_BLOCK_TYPES, type AesBlockType } from './aes/blocks';
import { AES_CONVENIENCE_TYPES } from './convenience';
import { SM4_BLOCK_TYPES, type Sm4BlockType } from './sm4/blocks';
import { SM4_CONVENIENCE_TYPES } from './convenience';
import { PADDING_BLOCK_TYPES, type PaddingBlockType } from './padding/blocks';
import { MODE_BLOCK_TYPES, type ModeBlockType } from './convenience';

export const SYMMETRIC_BLOCK_TYPES = [
  ...AES_BLOCK_TYPES,
  ...AES_CONVENIENCE_TYPES,
  ...SM4_BLOCK_TYPES,
  ...SM4_CONVENIENCE_TYPES,
  ...PADDING_BLOCK_TYPES,
  ...MODE_BLOCK_TYPES,
] as const;

export type SymmetricBlockType = AesBlockType | Sm4BlockType | PaddingBlockType | ModeBlockType;
