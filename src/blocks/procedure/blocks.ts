/**
 * 密码学函数封装积木块定义
 *
 * 参照 Mixly 的函数封装块设计，在 Blockly 12.x 原生 procedure 系统基础上，
 * 提供密码学算法专用的函数封装能力：
 *
 *   - crypto_return：独立可拖放的返回块（对应 Mixly 的 procedures_return）
 *   - crypto_func_def：带密码学类型提示的函数模板（用于组织加密算法）
 *
 * 与 Blockly 原生 procedure 块的关系：
 *   这些块作为原生系统的增强补充，不是替代品。
 *   crypto_func_def 生成符合 CipherCat 算法封装规范的代码结构。
 */
import * as Blockly from 'blockly/core';

// ─────────────────────────────────────────────────────────
// 块类型常量
// ─────────────────────────────────────────────────────────

export const PROCEDURE_BLOCK_TYPES = [
  'crypto_return',
  'crypto_func_def',
  'crypto_encrypt_func',
  'crypto_decrypt_func',
  'crypto_hash_func',
] as const;

export type ProcedureBlockType = (typeof PROCEDURE_BLOCK_TYPES)[number];

// ─────────────────────────────────────────────────────────
// crypto_return — 独立的返回语句块
// ─────────────────────────────────────────────────────────

Blockly.Blocks['crypto_return'] = {
  init: function () {
    this.appendValueInput('VALUE').setCheck(null).appendField(
      Blockly.Msg.CRYPTO_PROCEDURES_RETURN_BLOCK_TOOLTIP
        ? '返回'
        : '🔧 return',
    );
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip(
      Blockly.Msg.CRYPTO_PROCEDURES_RETURN_BLOCK_TOOLTIP ||
        'Return a value from a crypto function.',
    );
    this.setHelpUrl('');
  },
};

// ─────────────────────────────────────────────────────────
// crypto_func_def — 密码学函数模板定义块
// ─────────────────────────────────────────────────────────

Blockly.Blocks['crypto_func_def'] = {
  init: function () {
    const msg = Blockly.Msg as Record<string, string>;

    // 函数名
    this.appendDummyInput('NAME_INPUT')
      .appendField(msg.CRYPTO_PROCEDURES_TEMPLATE_TITLE || '🔧 Crypto Func')
      .appendField(new Blockly.FieldTextInput('myCipher'), 'FUNC_NAME');

    // 参数名 + 类型下拉
    this.appendDummyInput('PARAM_INPUT')
      .appendField('🔧 ' + (msg.CRYPTO_PROCEDURES_PARAM_MSG || 'param:'))
      .appendField(new Blockly.FieldTextInput('seed'), 'PARAM_NAME')
      .appendField(':')
      .appendField(
        new Blockly.FieldDropdown([
          [msg.CRYPTO_PROCEDURES_PARAM_BYTES || 'bytes', 'bytes'],
          [msg.CRYPTO_PROCEDURES_PARAM_INT || 'int', 'int'],
          [msg.CRYPTO_PROCEDURES_PARAM_INT_LIST || 'int list', 'int_list'],
          [msg.CRYPTO_PROCEDURES_PARAM_POLY || 'poly', 'poly'],
          [msg.CRYPTO_PROCEDURES_PARAM_SEED || 'seed', 'seed'],
          [msg.CRYPTO_PROCEDURES_PARAM_KEY || 'key', 'key'],
          [msg.CRYPTO_PROCEDURES_PARAM_MSG || 'message', 'message'],
        ]),
        'PARAM_TYPE',
      );

    // 函数体
    this.appendStatementInput('BODY')
      .setCheck(null)
      .appendField(msg.CRYPTO_ITERATE_DO || 'Do');

    // 返回值（可选）
    this.appendValueInput('RETURN')
      .setCheck(null)
      .appendField(msg.PROCEDURES_DEFRETURN_RETURN || '🔧 return');

    this.setInputsInline(false);
    this.setColour(290);
    this.setTooltip(
      msg.CRYPTO_PROCEDURES_TEMPLATE_TOOLTIP ||
        'Create a crypto-typed function wrapper.',
    );
    this.setHelpUrl('');
  },
};

// ─────────────────────────────────────────────────────────
// 预置密码学函数模板块
// ─────────────────────────────────────────────────────────

function _makeTemplateBlock(
  presetName: string,
  paramName: string,
  paramType: string,
  label: string,
): void {
  const msg = Blockly.Msg as Record<string, string>;

  Blockly.Blocks[presetName] = {
    init: function () {
      this.appendDummyInput('NAME_INPUT')
        .appendField(label)
        .appendField(new Blockly.FieldTextInput(presetName), 'FUNC_NAME');

      this.appendDummyInput('PARAM_INPUT')
        .appendField(('🔧 ' + (msg.CRYPTO_PROCEDURES_PARAM_MSG || 'param:')) + ' ')
        .appendField(new Blockly.FieldTextInput(paramName), 'PARAM_NAME')
        .appendField(':')
        .appendField(
          new Blockly.FieldDropdown([
            [msg.CRYPTO_PROCEDURES_PARAM_BYTES || 'bytes', 'bytes'],
            [msg.CRYPTO_PROCEDURES_PARAM_INT || 'int', 'int'],
            [msg.CRYPTO_PROCEDURES_PARAM_INT_LIST || 'int list', 'int_list'],
            [msg.CRYPTO_PROCEDURES_PARAM_POLY || 'poly', 'poly'],
            [msg.CRYPTO_PROCEDURES_PARAM_SEED || 'seed', 'seed'],
            [msg.CRYPTO_PROCEDURES_PARAM_KEY || 'key', 'key'],
            [msg.CRYPTO_PROCEDURES_PARAM_MSG || 'message', 'message'],
          ]),
          'PARAM_TYPE',
        );

      this.appendStatementInput('BODY')
        .setCheck(null)
        .appendField(msg.CRYPTO_ITERATE_DO || 'Do');

      this.appendValueInput('RETURN')
        .setCheck(null)
        .appendField(msg.PROCEDURES_DEFRETURN_RETURN || '🔧 return');

      this.setInputsInline(false);
      this.setColour(290);
      this.setTooltip(
        msg.CRYPTO_PROCEDURES_TEMPLATE_TOOLTIP ||
          'Pre-configured crypto function template.',
      );
      this.setHelpUrl('');
    },
  };
}

_makeTemplateBlock('crypto_encrypt_func', 'message', 'message', '🔐 encrypt');
_makeTemplateBlock('crypto_decrypt_func', 'ciphertext', 'message', '🔓 decrypt');
_makeTemplateBlock('crypto_hash_func', 'message', 'message', '#️⃣ hash');
