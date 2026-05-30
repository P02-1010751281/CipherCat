import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

javascriptGenerator.forBlock['nt_mod_inverse'] = function(block: Block): string {
  const d = javascriptGenerator.valueToCode(block, 'D', Order.ATOMIC) || 'd';
  const e = javascriptGenerator.valueToCode(block, 'E', Order.ATOMIC) || 'e';
  const phi = javascriptGenerator.valueToCode(block, 'PHI', Order.ATOMIC) || 'phi_n';

  const funcName = javascriptGenerator.provideFunction_('modInverseBig', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, m){',
    '  a = ((a % m) + m) % m;',
    '  let t = 0n, newT = 1n, r = m, newR = a;',
    '  while (newR !== 0n) {',
    '    const q = r / newR;',
    '    const tmpT = newT; newT = t - q * newT; t = tmpT;',
    '    const tmpR = newR; newR = r - q * newR; r = tmpR;',
    '  }',
    '  if (r !== 1n) throw new Error("inverse does not exist");',
    '  if (t < 0n) t += m;',
    '  return t;',
    '}'
  ]);
  return `${d} = ${funcName}(BigInt(${e}), BigInt(${phi}));\n`;
};
