import * as Blockly from 'blockly/core';

/**
 * 已废弃的 ctrl_assign 赋值块。
 * 保留定义以保证存量工作区兼容：不再出现在工具箱中，但已存在的块仍能加载和运行。
 * 由 migration.ts 中的 DEPRECATED_BLOCK_TYPES 驱动在加载时移除；此定义为防漏兜底。
 */
Blockly.Blocks['ctrl_assign'] = {
  init: function () {
    this.appendValueInput('LEFT').setCheck(null);
    this.appendDummyInput().appendField('=');
    this.appendValueInput('RIGHT').setCheck(null);
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(200);
    this.setTooltip('已废弃：赋值模块，请使用各运算块自带的赋值语义替代');
    this.setHelpUrl('');
  },
};
