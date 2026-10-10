/**
 * SLH-DSA 教学 ADRS 生成器；完整范围/精度限制见块定义与文档。
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

function registerAdrs(): string {
  return javascriptGenerator.provideFunction_('slhAdrsFull', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(layer, tree, typ, kp, height, idx) {',
    '  let a = new Uint8Array(32);',
    '  function writeUint(offset, width, value) {',
    '    if (!Number.isSafeInteger(value) || value < 0) throw new RangeError("ADRS fields must be non-negative safe integers");',
    '    let n = BigInt(value); if (n >= (1n << BigInt(width * 8))) throw new RangeError("ADRS field out of range");',
    '    for (let i = width - 1; i >= 0; i--) { a[offset + i] = Number(n & 0xFFn); n >>= 8n; }',
    '  }',
    '  writeUint(0, 4, layer); writeUint(4, 12, tree); writeUint(16, 4, typ);',
    '  if (typ !== 2) writeUint(20, 4, kp);',
    '  if (typ === 0 || typ === 2 || typ === 3 || typ === 5) {',
    '    writeUint(24, 4, height);',
    '  }',
    '  if (typ === 0 || typ === 2 || typ === 3 || typ === 6) {',
    '    writeUint(28, 4, idx);',
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
