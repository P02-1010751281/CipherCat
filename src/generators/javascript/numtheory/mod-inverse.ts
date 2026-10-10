import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

javascriptGenerator.forBlock['nt_mod_inverse'] = function(block: Block): string {
  const d = javascriptGenerator.valueToCode(block, 'D', Order.ATOMIC) || 'd';
  const e = javascriptGenerator.valueToCode(block, 'E', Order.ATOMIC) || 'e';
  const phi = javascriptGenerator.valueToCode(block, 'PHI', Order.ATOMIC) || 'phi_n';

  const funcName = javascriptGenerator.provideFunction_('modInverseBig', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(a, m){',
    '  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(m)) {',
    '    throw new RangeError("modular inverse inputs must be safe integers");',
    '  }',
    '  if (m <= 0) throw new RangeError("modulus must be positive");',
    '  const exponent = BigInt(a), modulus = BigInt(m);',
    '  let t = 0n, newT = 1n, r = modulus, newR = ((exponent % modulus) + modulus) % modulus;',
    '  while (newR !== 0n) {',
    '    const q = r / newR;',
    '    const tmpT = newT; newT = t - q * newT; t = tmpT;',
    '    const tmpR = newR; newR = r - q * newR; r = tmpR;',
    '  }',
    '  if (r !== 1n) throw new Error("inverse does not exist");',
    '  if (t < 0n) t += modulus;',
    '  return Number(t);',
    '}'
  ]);
  return `${d} = ${funcName}(${e}, ${phi});\n`;
};
