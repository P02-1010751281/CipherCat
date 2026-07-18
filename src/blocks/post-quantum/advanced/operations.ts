/**
 * ML-KEM 高级操作积木块定义 — 后量子高级块
 *
 * 基于 FIPS 203 (ML-KEM) 标准实现。
 * ⚠️ M0 清理：移除了 6 个不通用复合块（将在 M2.5 重新引入为带参数的通用便利块）。
 *
 * 保留：
 *   - (空) 当前无高级操作块，所有操作由层1原子块组合完成
 *
 * 参考: FIPS 203 — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf
 */
import * as Blockly from 'blockly/core';

export const ADVANCED_OPERATIONS_BLOCK_TYPES = [] as const;

export type AdvancedOperationsBlockType =
  (typeof ADVANCED_OPERATIONS_BLOCK_TYPES)[number];
