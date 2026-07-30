/**
 * 密码学函数封装积木块定义
 */
import * as Blockly from 'blockly/core';

export const PROCEDURE_BLOCK_TYPES = [
  'crypto_return',
  'crypto_func_def',
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

const PTYPES: [string, string][] = [
  ['bytes', 'bytes'], ['int', 'int'], ['int_list', 'int_list'],
  ['poly', 'poly'], ['seed', 'seed'], ['key', 'key'], ['message', 'message'],
];

function rebuildParams(block: Blockly.Block) {
  const count = parseInt(block.getFieldValue('PARAM_COUNT') as string || '1');
  // Remove existing param inputs (keep NAME_INPUT and COUNT_INPUT)
  for (let i = 0; i < 4; i++) {
    try { block.removeInput('PARAM_' + i); } catch (_) {}
    try { block.removeInput('ARG' + i); } catch (_) {}
  }
  for (let i = 0; i < count; i++) {
    const cache = (block as unknown as Record<string, Array<{name:string;type:string}>>)._paramCache;
    const prev = cache?.[i];
    const pn = prev?.name || 'arg' + i;
    const pt = prev?.type || 'bytes';
    block.appendDummyInput('PARAM_' + i)
      .appendField('param:')
      .appendField(new Blockly.FieldTextInput(pn), 'PARAM_NAME_' + i)
      .appendField(':')
      .appendField(new Blockly.FieldDropdown(PTYPES), 'PARAM_TYPE_' + i);
    block.appendValueInput('ARG' + i).setCheck(null);
  }
  // Ensure BODY and RETURN exist
  const msg = Blockly.Msg as Record<string, string>;
  try { block.removeInput('BODY'); } catch (_) {}
  try { block.removeInput('RETURN'); } catch (_) {}
  block.appendStatementInput('BODY').setCheck(null).appendField(msg.CRYPTO_ITERATE_DO || 'Do');
  block.appendValueInput('RETURN').setCheck(null).appendField(msg.PROCEDURES_DEFRETURN_RETURN || '\u2699 return');
}

Blockly.Blocks['crypto_func_def'] = {
  init: function () {
    const msg = Blockly.Msg as Record<string, string>;
    this.appendDummyInput('NAME_INPUT')
      .appendField(msg.CRYPTO_PROCEDURES_TEMPLATE_TITLE || '\u2699 function')
      .appendField(new Blockly.FieldTextInput('myCipher'), 'FUNC_NAME');
    this.appendDummyInput('COUNT_INPUT')
      .appendField('params:')
      .appendField(new Blockly.FieldDropdown([['1','1'],['2','2'],['3','3'],['4','4']]), 'PARAM_COUNT');
    rebuildParams(this);
    const self = this;
    this.setOnChange(function(e: Blockly.Events.Abstract) {
      if (e.type === Blockly.Events.BLOCK_CHANGE && (e as Blockly.Events.BlockChange).element === 'field' && (e as Blockly.Events.BlockChange).name === 'PARAM_COUNT') {
        rebuildParams(self as unknown as Blockly.Block);
      }
    });
    this.setInputsInline(false);
    this.setColour(290);
    this.setTooltip(msg.CRYPTO_PROCEDURES_TEMPLATE_TOOLTIP || 'Create a crypto-typed function wrapper.');
    this.setHelpUrl('');
  },
  mutationToDom: function () {
    const container = Blockly.utils.xml.createElement('mutation');
    const count = (this as Blockly.Block).getFieldValue('PARAM_COUNT') || '1';
    container.setAttribute('params', String(count));
    for (let i = 0; i < parseInt(count as string); i++) {
      const arg = Blockly.utils.xml.createElement('arg');
      arg.setAttribute('name', ((this as Blockly.Block).getFieldValue('PARAM_NAME_' + i) as string) || 'arg' + i);
      arg.setAttribute('type', ((this as Blockly.Block).getFieldValue('PARAM_TYPE_' + i) as string) || 'bytes');
      container.appendChild(arg);
    }
    return container;
  },
  domToMutation: function (xmlElement: Element) {
    const count = xmlElement.getAttribute('params') || '1';
    (this as Blockly.Block).setFieldValue(count, 'PARAM_COUNT');
    const args = xmlElement.getElementsByTagName('arg');
    (this as unknown as Record<string, Array<{name:string;type:string}>>)._paramCache = [];
    for (let i = 0; i < args.length; i++) {
      (this as unknown as Record<string, Array<{name:string;type:string}>>)._paramCache!.push({
        name: args[i].getAttribute('name') || 'arg' + i,
        type: args[i].getAttribute('type') || 'bytes',
      });
    }
    rebuildParams(this as Blockly.Block);
    delete (this as unknown as Record<string, unknown>)._paramCache;
  },
};


function _makeTemplateBlock(
  presetName: string, paramName: string, paramType: string, label: string,
): void {
  const msg = Blockly.Msg as Record<string, string>;
  Blockly.Blocks[presetName] = {
    init: function () {
      this.appendDummyInput('NAME_INPUT')
        .appendField(label)
        .appendField(new Blockly.FieldTextInput(presetName), 'FUNC_NAME');
      this.appendDummyInput('COUNT_INPUT')
        .appendField('params:')
        .appendField(new Blockly.FieldDropdown([['1','1'],['2','2'],['3','3'],['4','4']]), 'PARAM_COUNT');
      // Pre-fill param0 from preset
      (this as unknown as Record<string, Array<{name:string;type:string}>>)._paramCache = [{ name: paramName, type: paramType }];
      rebuildParams(this);
      delete (this as unknown as Record<string, unknown>)._paramCache;
      const self = this;
      this.setOnChange(function(e: Blockly.Events.Abstract) {
        if (e.type === Blockly.Events.BLOCK_CHANGE && (e as Blockly.Events.BlockChange).element === 'field' && (e as Blockly.Events.BlockChange).name === 'PARAM_COUNT') {
          rebuildParams(self as unknown as Blockly.Block);
        }
      });
      this.setInputsInline(false);
      this.setColour(290);
      this.setTooltip(msg.CRYPTO_PROCEDURES_TEMPLATE_TOOLTIP || 'Pre-configured crypto function template.');
      this.setHelpUrl('');
    },
    mutationToDom: (Blockly.Blocks['crypto_func_def'] as Record<string, (el:Element)=>Element>).mutationToDom,
    domToMutation: (Blockly.Blocks['crypto_func_def'] as Record<string, (el:Element)=>void>).domToMutation,
  };
}

_makeTemplateBlock('crypto_encrypt_func', 'message', 'message', Blockly.Msg.CRYPTO_PROCEDURES_ENCRYPT_LABEL || '🔐 encrypt');
_makeTemplateBlock('crypto_decrypt_func', 'ciphertext', 'message', Blockly.Msg.CRYPTO_PROCEDURES_DECRYPT_LABEL || '🔓 decrypt');
_makeTemplateBlock('crypto_hash_func', 'message', 'message', Blockly.Msg.CRYPTO_PROCEDURES_HASH_LABEL || '#️⃣ hash');

// ── 便利块→procedure 模板 ──
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
