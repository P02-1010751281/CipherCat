import './deprecated';
export * from './iterate';

import { ITERATE_BLOCK_TYPES, type IterateBlockType } from './iterate';

export const CTRL_BLOCK_TYPES = [...ITERATE_BLOCK_TYPES] as const;

/**
 * 已注册但刻意排除在 ALL_BLOCK_TYPES 之外的兼容身份。
 * 仅用于加载存量工作区（migration.ts 对复杂左值仍会重建 ctrl_assign），
 * 不出现在工具箱、不作为可认证或可独立测试的算法构件。
 * 清单门禁据此允许它们不被 194 清单收录，同时防止新的未登记身份混入。
 */
export const COMPAT_BLOCK_TYPES = ['ctrl_assign'] as const;

export type CtrlBlockType = IterateBlockType;
