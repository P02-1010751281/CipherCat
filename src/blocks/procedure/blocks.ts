/**
 * 密码学函数封装积木块定义
 */
import * as Blockly from 'blockly/core';

export const PROCEDURE_BLOCK_TYPES = [
  'crypto_return',
  'crypto_defreturn',
  'crypto_callreturn',
  'crypto_encrypt_func',
  'crypto_decrypt_func',
  'crypto_hash_func',
] as const;

export type ProcedureBlockType = (typeof PROCEDURE_BLOCK_TYPES)[number];

Blockly.Blocks['crypto_return'] = {
  init: function () {
    this.appendValueInput('VALUE').setCheck(null).appendField('🔧 return');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('Return a value from a crypto function.');
    this.setHelpUrl('');
  },
};

export const CRYPTO_PARAM_TYPES: [string, string][] = [
  ['bytes', 'bytes'], ['int', 'int'], ['int_list', 'int_list'],
  ['poly', 'poly'], ['seed', 'seed'], ['key', 'key'], ['message', 'message'],
];

// ── Typed procedure definition (crypto_defreturn) ──
// 形态对齐 Blockly 原生 procedures_defreturn，但参数是显式行
// （参数名 + 类型下拉），支持 1-8 个参数，类型系统内建。

const MAX_PARAMS = 8;

interface ParamCache { name: string; type: string }

function collectParams(block: Blockly.Block): ParamCache[] {
  const count = parseInt((block.getFieldValue('PARAM_COUNT') as string) || '1');
  const params: ParamCache[] = [];
  for (let i = 0; i < count; i++) {
    params.push({
      name: (block.getFieldValue('PARAM_NAME_' + i) as string) || 'arg' + i,
      type: (block.getFieldValue('PARAM_TYPE_' + i) as string) || 'bytes',
    });
  }
  return params;
}

function rebuildParamInputs(block: Blockly.Block, cache: ParamCache[] | null) {
  const count = parseInt((block.getFieldValue('PARAM_COUNT') as string) || '1');
  // Remove old param inputs
  for (let i = 0; i < MAX_PARAMS; i++) {
    try { block.removeInput('PARAM_' + i); } catch {}
    try { block.removeInput('ARG' + i); } catch {}
  }
  for (let i = 0; i < count; i++) {
    const p = cache?.[i] ?? { name: 'arg' + i, type: 'bytes' };
    block.appendDummyInput('PARAM_' + i)
      .appendField('param:')
      .appendField(new Blockly.FieldTextInput(p.name), 'PARAM_NAME_' + i)
      .appendField(':')
      .appendField(new Blockly.FieldDropdown(CRYPTO_PARAM_TYPES), 'PARAM_TYPE_' + i);
    block.appendValueInput('ARG' + i).setCheck(null);
  }
  // Ensure BODY / RETURN exist (for def) or output exists (for call)
  const isDef = block.type === 'crypto_defreturn';
  try { block.removeInput('BODY'); } catch {}
  try { block.removeInput('RETURN'); } catch {}
  if (isDef) {
    const msg = Blockly.Msg as Record<string, string>;
    block.appendStatementInput('BODY').setCheck(null).appendField(msg.CRYPTO_ITERATE_DO || 'Do');
    block.appendValueInput('RETURN').setCheck(null).appendField(msg.PROCEDURES_DEFRETURN_RETURN || 'return');
  }
}

function makeTypedProcBlock(isDef: boolean): any {
  return {
    init: function () {
      const msg = Blockly.Msg as Record<string, string>;
      const title = msg.PROCEDURES_DEFRETURN_TITLE || 'to';
      this.appendDummyInput('NAME_INPUT')
        .appendField(title)
        .appendField(new Blockly.FieldTextInput('unnamed'), 'NAME');
      this.appendDummyInput('COUNT_INPUT')
        .appendField('params:')
        .appendField(new Blockly.FieldDropdown(
          Array.from({ length: MAX_PARAMS }, (_, i) => [String(i + 1), String(i + 1)]),
        ), 'PARAM_COUNT');
      rebuildParamInputs(this as unknown as Blockly.Block, null);
      this.setInputsInline(false);
      this.setColour(290);
      this.setTooltip(isDef
        ? msg.CRYPTO_PROCEDURES_TEMPLATE_TOOLTIP || 'A crypto function with typed parameters.'
        : 'Call a crypto function with typed arguments.');
      this.setHelpUrl('');
    },
    mutationToDom: function () {
      const container = Blockly.utils.xml.createElement('mutation');
      const params = collectParams(this as unknown as Blockly.Block);
      container.setAttribute('params', String(params.length));
      for (const p of params) {
        const arg = Blockly.utils.xml.createElement('arg');
        arg.setAttribute('name', p.name);
        arg.setAttribute('type', p.type);
        container.appendChild(arg);
      }
      return container;
    },
    domToMutation: function (xmlElement: Element) {
      const args = xmlElement.getElementsByTagName('arg');
      (this as unknown as Blockly.Block).setFieldValue(String(args.length), 'PARAM_COUNT');
      const cache: ParamCache[] = [];
      for (let i = 0; i < args.length; i++) {
        cache.push({
          name: args[i].getAttribute('name') || 'arg' + i,
          type: args[i].getAttribute('type') || 'bytes',
        });
      }
      rebuildParamInputs(this as unknown as Blockly.Block, cache);
      const count = (this as unknown as Blockly.Block).getFieldValue('PARAM_COUNT');
      for (let i = 0; i < cache.length; i++) {
        (this as unknown as Blockly.Block).setFieldValue(cache[i].name, 'PARAM_NAME_' + i);
        (this as unknown as Blockly.Block).setFieldValue(cache[i].type, 'PARAM_TYPE_' + i);
      }
      void count;
    },
  };
}

function addParamCountListener(block: Blockly.Block) {
  const self = block;
  block.setOnChange(function (e: Blockly.Events.Abstract) {
    if (e.type === Blockly.Events.BLOCK_CHANGE &&
        (e as Blockly.Events.BlockChange).element === 'field' &&
        (e as Blockly.Events.BlockChange).name === 'PARAM_COUNT') {
      rebuildParamInputs(self, collectParams(self));
    }
  });
}

Blockly.Blocks['crypto_defreturn'] = makeTypedProcBlock(true);
Blockly.Blocks['crypto_callreturn'] = makeTypedProcBlock(false);

// 给两个块挂上 PARAM_COUNT 变更监听（init 后注册）
const _initDef = Blockly.Blocks['crypto_defreturn'].init;
Blockly.Blocks['crypto_defreturn'].init = function () {
  _initDef.call(this);
  addParamCountListener(this as unknown as Blockly.Block);
};
const _initCall = Blockly.Blocks['crypto_callreturn'].init;
Blockly.Blocks['crypto_callreturn'].init = function () {
  _initCall.call(this);
  addParamCountListener(this as unknown as Blockly.Block);
};

// ── Template blocks (single-param inline) ──

function _makeTemplateBlock(
  presetName: string, paramName: string, paramType: string, label: string,
): void {
  const msg = Blockly.Msg as Record<string, string>;
  Blockly.Blocks[presetName] = {
    init: function () {
      this.appendDummyInput('NAME_INPUT')
        .appendField(label)
        .appendField(new Blockly.FieldTextInput(presetName), 'FUNC_NAME');
      this.appendDummyInput('PARAM_INPUT')
        .appendField(msg.CRYPTO_PROCEDURES_PARAM_MSG || 'param:')
        .appendField(new Blockly.FieldTextInput(paramName), 'PARAM_NAME')
        .appendField(':')
        .appendField(new Blockly.FieldDropdown(CRYPTO_PARAM_TYPES), 'PARAM_TYPE');
      this.appendStatementInput('BODY').setCheck(null).appendField(msg.CRYPTO_ITERATE_DO || 'Do');
      this.appendValueInput('RETURN').setCheck(null).appendField(msg.PROCEDURES_DEFRETURN_RETURN || '\u2699 return');
      this.setInputsInline(false);
      this.setColour(290);
      this.setTooltip(msg.CRYPTO_PROCEDURES_TEMPLATE_TOOLTIP || 'Pre-configured crypto function template.');
      this.setHelpUrl('');
    },
  };
}

_makeTemplateBlock('crypto_encrypt_func', 'message', 'message', Blockly.Msg.CRYPTO_PROCEDURES_ENCRYPT_LABEL || '🔐 encrypt');
_makeTemplateBlock('crypto_decrypt_func', 'ciphertext', 'message', Blockly.Msg.CRYPTO_PROCEDURES_DECRYPT_LABEL || '🔓 decrypt');
_makeTemplateBlock('crypto_hash_func', 'message', 'message', Blockly.Msg.CRYPTO_PROCEDURES_HASH_LABEL || '#️⃣ hash');

const MSG = Blockly.Msg as Record<string, string>;
_makeTemplateBlock('proc_aes_round', 'state', 'int_list', MSG.PROC_AES_ROUND_LABEL || '🔧 AES_Round');
_makeTemplateBlock('proc_aes_last_round', 'state', 'int_list', MSG.PROC_AES_LAST_ROUND_LABEL || '🔧 AES_LastRound');
_makeTemplateBlock('proc_aes_key_schedule', 'key', 'bytes', MSG.PROC_AES_KEY_SCHEDULE_LABEL || '🔧 AES_KeySchedule');
_makeTemplateBlock('proc_sm4_round', 'state', 'int_list', MSG.PROC_SM4_ROUND_LABEL || '🔧 SM4_Round');
_makeTemplateBlock('proc_sm4_key_schedule', 'key', 'bytes', MSG.PROC_SM4_KEY_SCHEDULE_LABEL || '🔧 SM4_KeySchedule');
_makeTemplateBlock('proc_sha256_hash', 'msg', 'message', MSG.PROC_SHA256_HASH_LABEL || '🔧 SHA256_Hash');
_makeTemplateBlock('proc_sm3_hash', 'msg', 'message', MSG.PROC_SM3_HASH_LABEL || '🔧 SM3_Hash');
_makeTemplateBlock('proc_hmac_sha256', 'key', 'bytes', MSG.PROC_HMAC_SHA256_LABEL || '🔧 HMAC_SHA256');
_makeTemplateBlock('proc_sm3_hmac', 'key', 'bytes', MSG.PROC_SM3_HMAC_LABEL || '🔧 HMAC_SM3');
_makeTemplateBlock('proc_pbkdf2', 'password', 'bytes', MSG.PROC_PBKDF2_LABEL || '🔧 PBKDF2');
_makeTemplateBlock('proc_hkdf', 'ikm', 'bytes', MSG.PROC_HKDF_LABEL || '🔧 HKDF');
_makeTemplateBlock('proc_mlkem_keygen', 'seed', 'seed', MSG.PROC_MLKEM_KEYGEN_LABEL || '🔧 ML_KEM_KeyGen');
_makeTemplateBlock('proc_md_iterate', 'iv', 'int_list', MSG.PROC_MD_ITERATE_LABEL || '🔧 MD_Iterate');
_makeTemplateBlock('proc_sponge_duplex', 'state', 'int_list', MSG.PROC_SPONGE_DUPLEX_LABEL || '🔧 Sponge_Duplex');
_makeTemplateBlock('proc_mode_ecb', 'data', 'bytes', MSG.PROC_MODE_ECB_LABEL || '🔧 ECB');
_makeTemplateBlock('proc_mode_cbc', 'data', 'bytes', MSG.PROC_MODE_CBC_LABEL || '🔧 CBC');
_makeTemplateBlock('proc_mode_ctr', 'data', 'bytes', MSG.PROC_MODE_CTR_LABEL || '🔧 CTR');
_makeTemplateBlock('proc_mode_gcm', 'data', 'bytes', MSG.PROC_MODE_GCM_LABEL || '🔧 GCM');
_makeTemplateBlock('proc_ntt_vec', 'vec', 'int_list', MSG.PROC_NTT_VEC_LABEL || '🔧 NTT_Vec');
_makeTemplateBlock('proc_pq_cbd', 'seed', 'seed', MSG.PROC_PQ_CBD_LABEL || '🔧 CBD_NTT_Vec');
_makeTemplateBlock('proc_pq_mat_mul', 'mat', 'int_list', MSG.PROC_PQ_MAT_MUL_LABEL || '🔧 Mat×Vec_NTT');
_makeTemplateBlock('proc_pq_sample', 'seed', 'seed', MSG.PROC_PQ_SAMPLE_LABEL || '🔧 SampleNTT_Mat');
_makeTemplateBlock('proc_pq_vec_add', 'a', 'int_list', MSG.PROC_PQ_VEC_ADD_LABEL || '🔧 Vec_Add');
_makeTemplateBlock('proc_pq_vec_sub', 'a', 'int_list', MSG.PROC_PQ_VEC_SUB_LABEL || '🔧 Vec_Sub');
