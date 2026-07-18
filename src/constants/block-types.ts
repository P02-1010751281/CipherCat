/**
 * CipherCat 密码学积木块类型常量
 *
 * 定义 Blockly 输入/输出类型字符串，用于 `setCheck()` 和 `setOutput()` 的类型约束。
 * 与 Blockly 原生类型（Number, String, Boolean, Array）共同构成完整的类型体系。
 *
 * 设计原则：
 *   - Bytes：字节序列（密码学中最常用的数据类型）
 *   - IntList：整数列表（多项式系数、NTT 域元素等）
 *   - SBox：S-box 查找表（复用已有的自定义类型）
 */

/** 字节序列 — Uint8Array / bytes / bytearray */
export const TYPE_BYTES = 'Bytes';

/** 整数列表 — number[] / list[int] / 多项式系数数组 */
export const TYPE_INT_LIST = 'IntList';

/** S-box 查找表 — 需与 blocks/sbox 中的类型字符串保持一致 */
export const TYPE_SBOX = 'SBox';

/** Blockly 原生数字类型（用于标量常数） */
export const TYPE_NUMBER = 'Number';

/** Blockly 原生字符串类型 */
export const TYPE_STRING = 'String';

/** Blockly 原生布尔类型 */
export const TYPE_BOOLEAN = 'Boolean';

/** Blockly 原生数组类型 */
export const TYPE_ARRAY = 'Array';

/**
 * 密码学自定义类型列表（用于 Blockly 变量系统的 variableTypes 等场景）
 */
export const CRYPTO_VARIABLE_TYPES = [TYPE_BYTES, TYPE_INT_LIST, TYPE_SBOX] as const;

// ─────────────────────────────────────────────────────────
// Blockly ↔ Python ↔ JavaScript 类型映射表
//
// 统一底层语言对齐：每个 Blockly 类型在各目标语言中的标准表示。
// 生成器应参照此表确保输出的代码表达式类型与 Blockly 约束一致。
// ─────────────────────────────────────────────────────────

/** 类型映射描述 */
export interface TypeMapping {
  /** Blockly setCheck/setOutput 类型字符串 */
  blockly: string;
  /** Python 中的运行时类型 */
  python: string;
  /** Python 类型提示语法 */
  pythonHint: string;
  /** JavaScript 中的运行时类型 */
  javascript: string;
  /** MCL 中的类型表示 (MetaCrypt Language) */
  mcl: string;
  /** 转换辅助函数（Python 侧将其他类型转为此类型的表达式） */
  pythonCoerce?: string;
  /** 转换辅助函数（JS 侧将其他类型转为此类型的表达式） */
  jsCoerce?: string;
}

/** Blockly ↔ Python ↔ JavaScript 类型对齐表 */
export const TYPE_MAP: Record<string, TypeMapping> = {
  [TYPE_BYTES]: {
    blockly: TYPE_BYTES,
    python: 'bytes',
    pythonHint: 'bytes',
    javascript: 'Uint8Array',
    mcl: 'BYTES',
    pythonCoerce: 'bytes(_v)' as const,
    jsCoerce: 'new Uint8Array(_v)' as const,
  },
  [TYPE_INT_LIST]: {
    blockly: TYPE_INT_LIST,
    python: 'list[int]',
    pythonHint: 'list[int]',
    javascript: 'number[]',
    mcl: 'INT_LIST',
    pythonCoerce: 'list(_v)' as const,
    jsCoerce: 'Array.from(_v)' as const,
  },
  [TYPE_NUMBER]: {
    blockly: TYPE_NUMBER,
    python: 'int',
    pythonHint: 'int',
    javascript: 'number',
    mcl: 'NUMBER',
    pythonCoerce: 'int(_v)' as const,
    jsCoerce: 'Number(_v)' as const,
  },
  [TYPE_SBOX]: {
    blockly: TYPE_SBOX,
    python: 'list[list[int]]',
    pythonHint: 'list[list[int]]',
    javascript: 'number[][]',
    mcl: 'SBOX',
  },
};
