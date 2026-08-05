/**
 * WOTS+ 校验和 JavaScript 生成器（w=16，4-bit 块，csum 编码 MSB 在前）
 */
import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

function registerWotsChecksum(): string {
  return javascriptGenerator.provideFunction_('wotsChecksum', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(m) {',
    '  if (typeof m === "string") m = new TextEncoder().encode(m);',
    '  else if (Array.isArray(m)) m = Uint8Array.from(m);',
    '  let blocks = [];',
    '  for (let i = 0; i < m.length; i++) {',
    '    blocks.push((m[i] >> 4) & 0xF);',
    '    blocks.push(m[i] & 0xF);',
    '  }',
    '  let len1 = blocks.length;',
    '  let csum = 0;',
    '  for (let b of blocks) csum += 15 - b;',
    '  let len2 = 1;',
    '  while ((1 << (4 * len2)) <= len1 * 15) len2++;',
    '  let enc = [];',
    '  for (let i = len2 - 1; i >= 0; i--) enc.push((csum >> (4 * i)) & 0xF);',
    '  return enc;',
    '}',
  ]);
}

javascriptGenerator.forBlock['wots_checksum'] = function (block: Block): [string, number] {
  const m = javascriptGenerator.valueToCode(block, 'M', Order.ATOMIC) || '[]';
  const fn = registerWotsChecksum();
  return [fn + '(' + m + ')', Order.ATOMIC];
};
