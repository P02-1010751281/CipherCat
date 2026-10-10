/**
 * SLH-DSA 教学 ADRS 生成器；完整范围/精度限制见块定义与文档。
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

function registerAdrs(): string {
  return pythonGenerator.provideFunction_('slh_adrs_full', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(layer, tree, typ, kp, height, idx):',
    '    a = bytearray(32)',
    '    limit = 2**53 - 1',
    '    def write_uint(offset, width, value):',
    '        if isinstance(value, bool) or not isinstance(value, (int, float)) or value < 0 or value > limit or (isinstance(value, float) and not value.is_integer()) or value >= 1 << (8 * width):',
    '            raise ValueError("ADRS fields must be non-negative safe integers within their encoded width")',
    '        value = int(value)',
    '        a[offset:offset + width] = value.to_bytes(width, "big")',
    '    write_uint(0, 4, layer)',
    '    write_uint(4, 12, tree)',
    '    write_uint(16, 4, typ)',
    '    if typ != 2:',
    '        write_uint(20, 4, kp)',
    '    if typ in (0, 5):  # WOTS_HASH / WOTS_PRF: chain; hash is zero for WOTS_PRF',
    '        write_uint(24, 4, height)',
    '    if typ in (0, 2, 3, 6):',
    '        # WOTS_HASH / TREE / FORS_TREE / FORS_PRF: hash or tree index',
    '        write_uint(28, 4, idx)',
    '    if typ in (2, 3):  # TREE / FORS_TREE: tree height',
    '        write_uint(24, 4, height)',
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
