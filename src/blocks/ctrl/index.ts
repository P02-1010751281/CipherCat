import './deprecated';
export * from './iterate';

import { ITERATE_BLOCK_TYPES, type IterateBlockType } from './iterate';

export const CTRL_BLOCK_TYPES = [...ITERATE_BLOCK_TYPES] as const;

export type CtrlBlockType = IterateBlockType;
