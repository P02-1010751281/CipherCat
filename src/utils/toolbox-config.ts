import 'blockly/blocks';
import * as Blockly from 'blockly/core';

import { type CoreBlockType } from '@/blocks/core';
import { BIT_BLOCK_TYPES } from '@/blocks/bitwise';
import { ALL_BLOCK_TYPES as HASH_BLOCK_TYPES } from '@/blocks/hash';
import { ECC_BLOCK_TYPES, NT_BLOCK_TYPES } from '@/blocks/number-theory';
import {
  PQ_BASIC_BLOCK_TYPES,
  PQ_ADVANCED_BLOCK_TYPES,
} from '@/blocks/post-quantum';
import { getSboxCategoryKey } from '@/blocks/sbox/category';

export function createToolboxConfig() {
  const msg = Blockly.Msg as Record<string, string>;

  // CORE_BLOCK_TYPES 按职责拆入各分类，避免重复
  const CTRL_CORE_BLOCKS: CoreBlockType[] = ['ctrl_assign', 'ctrl_iterate'];
  const ARRAY_CORE_BLOCKS: CoreBlockType[] = ['arr_partition_to_array'];
  const DATA_CORE_BLOCKS: CoreBlockType[] = [
    'data_bit_length',
    'data_byte_length',
    'data_convert_to_int',
    'data_convert_bits_to_bytes',
    'data_convert_bytes_to_bits',
    'data_value',
    'seed_bytes',
    'seed_hex',
    'cipher_key_from_seed',
  ];
  const LOGIC_CORE_BLOCKS: CoreBlockType[] = [
    'lgc_operation',
    'lgc_compound',
    'lgc_not',
  ];

  const ctrl = {
    kind: 'category',
    name: msg.CRYPTO_CATEGORY_CTRL || 'Control Flow',
    colour: '#5C81A6',
    contents: [
      { kind: 'block', type: 'logic_compare' },
      { kind: 'block', type: 'logic_operation' },
      { kind: 'block', type: 'logic_negate' },
      { kind: 'block', type: 'logic_boolean' },
      { kind: 'block', type: 'logic_ternary' },
      { kind: 'block', type: 'logic_null' },
      ...CTRL_CORE_BLOCKS.map((type) => ({ kind: 'block' as const, type })),
      { kind: 'block', type: 'controls_repeat_ext' },
      { kind: 'block', type: 'controls_whileUntil' },
      { kind: 'block', type: 'controls_for' },
      { kind: 'block', type: 'controls_forEach' },
      { kind: 'block', type: 'controls_flow_statements' },
    ],
  };

  const variable = {
    kind: 'category',
    name: msg.CRYPTO_CATEGORY_VARIABLE || 'Variables',
    colour: '#A65C81',
    custom: 'VARIABLE',
  };

  const math = {
    kind: 'category',
    name: msg.CRYPTO_CATEGORY_MATH || 'Math',
    colour: '#5C68A6',
    contents: [
      { kind: 'block', type: 'math_number' },
      { kind: 'block', type: 'math_arithmetic' },
      { kind: 'block', type: 'math_single' },
      { kind: 'block', type: 'math_trig' },
      { kind: 'block', type: 'math_constant' },
      { kind: 'block', type: 'math_modulo' },
      { kind: 'block', type: 'math_constrain' },
      { kind: 'block', type: 'math_round' },
      { kind: 'block', type: 'math_random_int' },
      { kind: 'block', type: 'math_random_float' },
    ],
  };

  const array = {
    kind: 'category',
    name: msg.CRYPTO_CATEGORY_ARRAY || 'Arrays',
    colour: '#745BA5',
    contents: [
      { kind: 'block', type: 'lists_create_with' },
      { kind: 'block', type: 'lists_create_empty' },
      { kind: 'block', type: 'lists_repeat' },
      { kind: 'block', type: 'lists_length' },
      { kind: 'block', type: 'lists_isEmpty' },
      { kind: 'block', type: 'lists_indexOf' },
      { kind: 'block', type: 'lists_getIndex' },
      { kind: 'block', type: 'lists_setIndex' },
      { kind: 'block', type: 'lists_getSublist' },
      { kind: 'block', type: 'lists_split' },
      { kind: 'block', type: 'lists_sort' },
      ...ARRAY_CORE_BLOCKS.map((type) => ({ kind: 'block' as const, type })),
    ],
  };

  const data = {
    kind: 'category',
    name: msg.CRYPTO_CATEGORY_DATA || 'Data & Convert',
    colour: '#5BA58C',
    contents: [
      { kind: 'block', type: 'text' },
      { kind: 'block', type: 'text_join' },
      { kind: 'block', type: 'text_append' },
      { kind: 'block', type: 'text_length' },
      { kind: 'block', type: 'text_isEmpty' },
      { kind: 'block', type: 'text_indexOf' },
      { kind: 'block', type: 'text_charAt' },
      { kind: 'block', type: 'text_getSubstring' },
      { kind: 'block', type: 'text_changeCase' },
      { kind: 'block', type: 'text_trim' },
      { kind: 'block', type: 'text_print' },
      ...DATA_CORE_BLOCKS.map((type) => ({ kind: 'block' as const, type })),
    ],
  };

  const bit = {
    kind: 'category',
    name: msg.CRYPTO_CATEGORY_BIT || 'Bitwise',
    colour: '#5CA65C',
    contents: BIT_BLOCK_TYPES.map((type) => ({ kind: 'block' as const, type })),
  };

  const logicUnit = {
    kind: 'category',
    name: msg.CRYPTO_CATEGORY_LOGIC || 'Logic',
    colour: '#5CA6A6',
    contents: LOGIC_CORE_BLOCKS.map((type) => ({
      kind: 'block' as const,
      type,
    })),
  };

  const sbox = {
    kind: 'category',
    name: msg.CRYPTO_CATEGORY_SBOX || 'S-box',
    colour: '#A65C5C',
    custom: getSboxCategoryKey(),
  };

  const hash = {
    kind: 'category',
    name: msg.CRYPTO_CATEGORY_HASH || 'Hash & Padding',
    colour: '#8E44AD',
    contents: HASH_BLOCK_TYPES.map((type) => ({
      kind: 'block' as const,
      type,
    })),
  };

  const numtheory = {
    kind: 'category',
    name: msg.CRYPTO_CATEGORY_NUMTHEORY || 'Number Theory',
    colour: '#D35400',
    contents: NT_BLOCK_TYPES.map((type) => ({ kind: 'block' as const, type })),
  };

  const ecc = {
    kind: 'category',
    name: msg.CRYPTO_CATEGORY_ECC || 'Elliptic Curve',
    colour: '#16A085',
    contents: ECC_BLOCK_TYPES.map((type) => ({ kind: 'block' as const, type })),
  };

  const postquantumBasic = {
    kind: 'category',
    name: msg.CRYPTO_CATEGORY_POSTQUANTUM_BASIC || 'Post-Quantum Basic',
    colour: '#5C5CA6',
    contents: PQ_BASIC_BLOCK_TYPES.map((type) => ({
      kind: 'block' as const,
      type,
    })),
  };

  const postquantumAdvanced = {
    kind: 'category',
    name: msg.CRYPTO_CATEGORY_POSTQUANTUM_ADVANCED || 'Post-Quantum Advanced',
    colour: '#7C5CA6',
    contents: PQ_ADVANCED_BLOCK_TYPES.map((type) => ({
      kind: 'block' as const,
      type,
    })),
  };

  const procedure = {
    kind: 'category',
    name: msg.CRYPTO_CATEGORY_PROCEDURE || 'Functions',
    colour: '#A6745C',
    custom: 'PROCEDURE',
  };

  return {
    kind: 'categoryToolbox' as const,
    contents: [
      ctrl,
      variable,
      math,
      array,
      data,
      bit,
      logicUnit,
      sbox,
      hash,
      numtheory,
      ecc,
      postquantumBasic,
      postquantumAdvanced,
      procedure,
    ],
  };
}
