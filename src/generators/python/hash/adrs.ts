/**
 * FIPS 205 完整 ADRS Python 生成器（32 字节，type 相关字段）
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

function registerAdrs(): string {
  return pythonGenerator.provideFunction_('slh_adrs_full', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(layer, tree, typ, kp, height, idx):',
    '    a = bytearray(32)',
    '    a[0] = layer & 0xFF',
    '    a[1:13] = tree.to_bytes(12, "big")',
    '    a[13:17] = typ.to_bytes(4, "big")',
    '    a[17:21] = kp.to_bytes(4, "big")',
    '    if typ == 0:  # WOTS_HASH: chain + hash',
    '        a[21:25] = height.to_bytes(4, "big")',
    '        a[25:29] = idx.to_bytes(4, "big")',
    '    elif typ in (2, 3):  # TREE / FORS_TREE: tree_height + tree_index',
    '        a[21:25] = height.to_bytes(4, "big")',
    '        a[25:29] = idx.to_bytes(4, "big")',
    '    return bytes(a)',
    '',
  ]);
}

pythonGenerator.forBlock['slh_adrs_full'] = function (block: Block): [string, number] {
  const layer = pythonGenerator.valueToCode(block, 'LAYER', Order.ATOMIC) || '0';
  const tree = pythonGenerator.valueToCode(block, 'TREE', Order.ATOMIC) || '0';
  const typ = block.getFieldValue('TYPE') || '0';
  const kp = pythonGenerator.valueToCode(block, 'KEYPAIR', Order.ATOMIC) || '0';
  const height = pythonGenerator.valueToCode(block, 'HEIGHT', Order.ATOMIC) || '0';
  const idx = pythonGenerator.valueToCode(block, 'INDEX', Order.ATOMIC) || '0';
  const fn = registerAdrs();
  return [fn + '(' + layer + ', ' + tree + ', ' + typ + ', ' + kp + ', ' + height + ', ' + idx + ')', Order.ATOMIC];
};
