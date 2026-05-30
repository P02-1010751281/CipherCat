import * as Blockly from 'blockly/core';

export const LGC_NOT_BLOCK_TYPES = [
  'lgc_not'
] as const;

export type LgcNotBlockType = typeof LGC_NOT_BLOCK_TYPES[number];

Blockly.Blocks['lgc_not'] = {
  init: function() {
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_LOGIC_NOT || '非运算', 'NOT_LABEL');
    this.appendValueInput('VALUE1')
      .setCheck(null);
    this.appendDummyInput()
      .appendField(',' + (Blockly.Msg.CRYPTO_LOGIC_OUTPUT_VAR || '输出变量'));
    this.appendValueInput('VALUE2')
      .setCheck(null);
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(270);
    this.setTooltip(Blockly.Msg.CRYPTO_LOGIC_NOT_TOOLTIP || '对输入值进行非运算');
    this.setHelpUrl('');
  }
};
