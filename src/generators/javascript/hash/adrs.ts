/**
 * FIPS 205 完整 ADRS JavaScript 生成器（32 字节，type 相关字段）
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

function registerAdrs(): string {
  return javascriptGenerator.provideFunction_('slhAdrsFull', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(layer, tree, typ, kp, height, idx) {',
    '  let a = new Uint8Array(32);',
    '  a[0] = layer & 0xFF;',
    '  for (let i = 0; i < 12; i++) a[12 - i] = Math.floor(tree / Math.pow(256, i)) & 0xFF;',
    '  a[13] = (typ >> 24) & 0xFF; a[14] = (typ >> 16) & 0xFF; a[15] = (typ >> 8) & 0xFF; a[16] = typ & 0xFF;',
    '  for (let i = 0; i < 4; i++) a[20 - i] = Math.floor(kp / Math.pow(256, i)) & 0xFF;',
    '  if (typ === 0 || typ === 2 || typ === 3) {',
    '    for (let i = 0; i < 4; i++) a[24 - i] = Math.floor(height / Math.pow(256, i)) & 0xFF;',
    '    for (let i = 0; i < 4; i++) a[28 - i] = Math.floor(idx / Math.pow(256, i)) & 0xFF;',
    '  }',
    '  return a;',
    '}',
  ]);
}

javascriptGenerator.forBlock['slh_adrs_full'] = function (block: Block): [string, number] {
  const layer = javascriptGenerator.valueToCode(block, 'LAYER', Order.ATOMIC) || '0';
  const tree = javascriptGenerator.valueToCode(block, 'TREE', Order.ATOMIC) || '0';
  const typ = block.getFieldValue('TYPE') || '0';
  const kp = javascriptGenerator.valueToCode(block, 'KEYPAIR', Order.ATOMIC) || '0';
  const height = javascriptGenerator.valueToCode(block, 'HEIGHT', Order.ATOMIC) || '0';
  const idx = javascriptGenerator.valueToCode(block, 'INDEX', Order.ATOMIC) || '0';
  const fn = registerAdrs();
  return [fn + '(' + layer + ', ' + tree + ', ' + typ + ', ' + kp + ', ' + height + ', ' + idx + ')', Order.ATOMIC];
};
