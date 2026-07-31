export * from './aes';
export * from './sm4';
export * from './modes';
export * from './padding';
import { AES_BLOCK_TYPES, type AesBlockType } from './aes/blocks';
import { SM4_BLOCK_TYPES, type Sm4BlockType } from './sm4/blocks';
import { PADDING_BLOCK_TYPES, type PaddingBlockType } from './padding/blocks';
import { MODE_BLOCK_TYPES, type ModeBlockType } from './modes/blocks';

export const SYMMETRIC_BLOCK_TYPES = [
  ...AES_BLOCK_TYPES,
  ...SM4_BLOCK_TYPES,
  ...PADDING_BLOCK_TYPES,
  ...MODE_BLOCK_TYPES,
] as const;

export type SymmetricBlockType = AesBlockType | Sm4BlockType | PaddingBlockType | ModeBlockType;
