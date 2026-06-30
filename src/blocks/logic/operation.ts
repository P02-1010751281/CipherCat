import * as Blockly from 'blockly/core';

export const LGC_OPERATION_BLOCK_TYPES = ['lgc_operation'] as const;

export type LgcOperationBlockType = (typeof LGC_OPERATION_BLOCK_TYPES)[number];

Blockly.Blocks['lgc_operation'] = {
  init: function () {
    const dropdown = new Blockly.FieldDropdown(() => [
      [Blockly.Msg.CRYPTO_LOGIC_XOR || 'XOR', 'XOR'],
      [Blockly.Msg.CRYPTO_LOGIC_OR || 'OR', 'OR'],
      [Blockly.Msg.CRYPTO_LOGIC_AND || 'AND', 'AND'],
    ]);
    this.appendDummyInput().appendField(dropdown, 'instr');
    this.appendValueInput('A');
    this.appendValueInput('B').setCheck(null).appendField(',');
    this.appendValueInput('C').setCheck(null).appendField(',');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(345);
    this.setTooltip(Blockly.Msg.CRYPTO_LOGIC_TOOLTIP || '对输入值执行逻辑运算');
    this.setHelpUrl('');
  },
};
