import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

pythonGenerator.forBlock['nt_mod_inverse'] = function(block: Block): string {
  const d = pythonGenerator.valueToCode(block, 'D', Order.ATOMIC) || 'd';
  const e = pythonGenerator.valueToCode(block, 'E', Order.ATOMIC) || 'e';
  const phi = pythonGenerator.valueToCode(block, 'PHI', Order.ATOMIC) || 'phi_n';

  const code = `
# 扩展欧几里得算法求模逆元
def extended_gcd(a, b):
    if a == 0:
        return b, 0, 1
    else:
        g, y, x = extended_gcd(b % a, a)
        return g, x - (b // a) * y, y

def mod_inverse(a, m):
    g, x, y = extended_gcd(a, m)
    if g != 1:
        raise Exception('modular inverse does not exist')
    else:
        return (x % m + m) % m

${d} = mod_inverse(${e}, ${phi})
`;
  return code;
};
