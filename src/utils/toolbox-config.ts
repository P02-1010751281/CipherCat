import 'blockly/blocks';
import * as Blockly from 'blockly/core';

import { type CtrlBlockType } from '@/blocks/ctrl';
import { type DataBlockType } from '@/blocks/data';
import { type ArrayBlockType } from '@/blocks/array';
import { type LogicBlockType } from '@/blocks/logic';
import { BIT_BLOCK_TYPES } from '@/blocks/bitwise';
import { ALL_BLOCK_TYPES as HASH_BLOCK_TYPES } from '@/blocks/hash';
import { NT_BLOCK_TYPES } from '@/blocks/numtheory';
import { ECC_BLOCK_TYPES } from '@/blocks/ecc';
import {
  PQ_BASIC_BLOCK_TYPES,
  PQ_ADVANCED_BLOCK_TYPES,
} from '@/blocks/post-quantum';
import { getSboxCategoryKey } from '@/blocks/sbox/category';
import { SYMMETRIC_BLOCK_TYPES } from '@/blocks/symmetric';

export function createToolboxConfig() {
  const msg = Blockly.Msg as Record<string, string>;

  const ctrlTypes: CtrlBlockType[] = ['ctrl_iterate'];
  const arrTypes: ArrayBlockType[] = ['arr_partition_to_array'];
  const dataTypes: DataBlockType[] = [
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
  const logicTypes: LogicBlockType[] = [
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
      ...ctrlTypes.map((type) => ({ kind: 'block' as const, type })),
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
      ...arrTypes.map((type) => ({ kind: 'block' as const, type })),
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
      ...dataTypes.map((type) => ({ kind: 'block' as const, type })),
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
    contents: logicTypes.map((type) => ({ kind: 'block' as const, type })),
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

  const symmetric = {
    kind: 'category',
    name: msg.CRYPTO_CATEGORY_SYMMETRIC || 'Symmetric Cipher',
    colour: '#34A853',
    contents: SYMMETRIC_BLOCK_TYPES.map((type) => ({
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

  const procedureNative = {
    kind: 'category',
    name: (msg.CRYPTO_CATEGORY_PROCEDURE || 'Functions'),
    colour: '#A6745C',
    custom: 'PROCEDURE',
  };

  const cryptoBase = { kind: 'category', name: (msg.CRYPTO_SUBCAT_BASE || 'Base'), colour: '#C67A4E', contents: ['crypto_func_def','crypto_return','procedures_ifreturn','crypto_encrypt_func','crypto_decrypt_func','crypto_hash_func'].map(t => ({ kind: 'block' as const, type: t })) };
  const cryptoSymmetric = { kind: 'category', name: (msg.CRYPTO_SUBCAT_SYMMETRIC || 'Symmetric'), colour: '#C67A4E', contents: ['proc_aes_round','proc_aes_last_round','proc_aes_key_schedule','proc_sm4_round','proc_sm4_key_schedule'].map(t => ({ kind: 'block' as const, type: t })) };
  const cryptoHash = { kind: 'category', name: (msg.CRYPTO_SUBCAT_HASH_MAC_KDF || 'Hash / MAC / KDF'), colour: '#C67A4E', contents: ['proc_sha256_hash','proc_sm3_hash','proc_hmac_sha256','proc_sm3_hmac','proc_pbkdf2','proc_hkdf'].map(t => ({ kind: 'block' as const, type: t })) };
  const cryptoMode = { kind: 'category', name: (msg.CRYPTO_SUBCAT_MODE || 'Mode'), colour: '#C67A4E', contents: ['proc_mode_ecb','proc_mode_cbc','proc_mode_ctr','proc_mode_gcm'].map(t => ({ kind: 'block' as const, type: t })) };
  const cryptoPqc = { kind: 'category', name: (msg.CRYPTO_SUBCAT_ITERATE_SPONGE_PQC || 'PQC'), colour: '#C67A4E', contents: ['proc_md_iterate','proc_sponge_duplex','proc_mlkem_keygen','proc_ntt_vec','proc_pq_cbd','proc_pq_mat_mul','proc_pq_sample','proc_pq_vec_add','proc_pq_vec_sub'].map(t => ({ kind: 'block' as const, type: t })) };

  const cryptoFunctions = {
    kind: 'category',
    name: (msg.CRYPTO_CATEGORY_CRYPTO_FUNCTIONS || 'Crypto Functions'),
    colour: '#C67A4E',
    contents: [cryptoBase, cryptoSymmetric, cryptoHash, cryptoMode, cryptoPqc],
  };

  return {
    kind: 'categoryToolbox' as const,
    contents: [
      ctrl, variable, math, array, data, bit, logicUnit, sbox, hash, symmetric,
      numtheory, ecc, postquantumBasic, postquantumAdvanced,
      procedureNative, cryptoFunctions,
    ],
  };
}
