import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

javascriptGenerator.forBlock['bit_byte_substitute'] = function(block: Block): string {
  const input = javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '0x00';
  const output = javascriptGenerator.valueToCode(block, 'OUTPUT', Order.ATOMIC) || 'B';
  return `
var _byteSubstituteIndex = ${input};
if (!Number.isInteger(_byteSubstituteIndex) || _byteSubstituteIndex < 0 || _byteSubstituteIndex > 255) throw new RangeError("S-box input must be a byte");
if (!Array.isArray(sbox) || sbox.length < 256) throw new TypeError("sbox must contain at least 256 entries");
var _byteSubstituteValue = sbox[_byteSubstituteIndex];
if (!Number.isInteger(_byteSubstituteValue) || _byteSubstituteValue < 0 || _byteSubstituteValue > 255) throw new RangeError("S-box output must be a byte");
var ${output} = _byteSubstituteValue;
`;
};
