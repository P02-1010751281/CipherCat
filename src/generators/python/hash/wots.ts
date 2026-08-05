/**
 * WOTS+ 校验和 Python 生成器（w=16，4-bit 块，csum 编码 MSB 在前）
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

function registerWotsChecksum(): string {
  return pythonGenerator.provideFunction_('wots_checksum', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(m):',
    '    m = bytes(m) if not isinstance(m, bytes) else m',
    '    blocks = []',
    '    for byte in m:',
    '        blocks.append((byte >> 4) & 0xF)',
    '        blocks.append(byte & 0xF)',
    '    len1 = len(blocks)',
    '    csum = sum(15 - b for b in blocks)',
    '    len2 = 1',
    '    while (1 << (4 * len2)) <= len1 * 15:',
    '        len2 += 1',
    '    enc = []',
    '    for i in range(len2 - 1, -1, -1):',
    '        enc.append((csum >> (4 * i)) & 0xF)',
    '    return enc',
    '',
  ]);
}

pythonGenerator.forBlock['wots_checksum'] = function (block: Block): [string, number] {
  const m = pythonGenerator.valueToCode(block, 'M', Order.ATOMIC) || 'b\'\'';
  const fn = registerWotsChecksum();
  return [fn + '(' + m + ')', Order.ATOMIC];
};
