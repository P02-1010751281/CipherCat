import * as Blockly from 'blockly/core';

export const CURVE_BLOCK_TYPES = [
  'ecc_load_curve_params',
  'ecc_load_point',
  'ecc_point_double',
  'ecc_add',
  'ecc_multiply'
] as const;

export type CurveBlockType = typeof CURVE_BLOCK_TYPES[number];

Blockly.Blocks['ecc_load_curve_params'] = {
  init: function() {
    this.appendDummyInput()
      .appendField(Blockly.Msg.CRYPTO_CURVE_PARAMS || 'Elliptic Curve Params')
      .appendField(new Blockly.FieldTextInput(''), 'a')
      .appendField(',')
      .appendField(new Blockly.FieldTextInput(''), 'b')
      .appendField(',')
      .appendField(new Blockly.FieldTextInput(''), 'p');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip(Blockly.Msg.CRYPTO_CURVE_PARAMS_TOOLTIP || 'Set elliptic curve a, b, p parameters');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['ecc_load_point'] = {
  init: function() {
    this.appendValueInput('point')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_CURVE_POINT || 'Elliptic Curve Point');
    this.appendDummyInput()
      .appendField('(')
      .appendField(new Blockly.FieldTextInput(''), 'x')
      .appendField(',')
      .appendField(new Blockly.FieldTextInput(''), 'y')
      .appendField(')');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip(Blockly.Msg.CRYPTO_CURVE_POINT_TOOLTIP || 'Define a point on elliptic curve');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['ecc_point_double'] = {
  init: function() {
    this.appendValueInput('value2')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_CURVE_DOUBLE_POINT || 'Elliptic Curve Double Point');
    this.appendValueInput('value1')
      .setCheck(null)
      .appendField('= 2 * ');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(285);
    this.setTooltip(Blockly.Msg.CRYPTO_CURVE_DOUBLE_POINT_TOOLTIP || 'Calculate double point on elliptic curve');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['ecc_add'] = {
  init: function() {
    this.appendValueInput('value3')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_CURVE_ADD || 'Elliptic Curve Point Add');
    this.appendValueInput('value1')
      .setCheck(null)
      .appendField('=');
    this.appendValueInput('value2')
      .setCheck(null)
      .appendField('+');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(45);
    this.setTooltip(Blockly.Msg.CRYPTO_CURVE_ADD_TOOLTIP || 'Execute point addition on elliptic curve');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['ecc_multiply'] = {
  init: function() {
    this.appendValueInput('value2')
      .setCheck(null)
      .appendField(Blockly.Msg.CRYPTO_CURVE_MULTIPLY || 'Elliptic Curve Multiply');
    this.appendValueInput('value1')
      .setCheck(null)
      .appendField('=')
      .appendField(new Blockly.FieldTextInput(''), 'times')
      .appendField('*');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(315);
    this.setTooltip(Blockly.Msg.CRYPTO_CURVE_MULTIPLY_TOOLTIP || 'Execute k-times point multiplication on elliptic curve');
    this.setHelpUrl('');
  }
};