import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly/core';

javascriptGenerator.forBlock['data_convert_to_int'] = function(block: Block): string {
  const variable = javascriptGenerator.valueToCode(block, 'VAR', Order.ATOMIC) || 'n';
  return `if (${variable} instanceof Uint8Array || ${variable} instanceof ArrayBuffer) {\n    let v = 0n;\n    const arr = ${variable} instanceof Uint8Array ? ${variable} : new Uint8Array(${variable});\n    for (let i = 0; i < arr.length; i++) {\n        v = (v << 8n) | BigInt(arr[i]);\n    }\n    ${variable} = Number(BigInt.asIntN(64, v));\n} else {\n    ${variable} = parseInt(${variable});\n}\n`;
};

javascriptGenerator.forBlock['data_convert_bits_to_bytes'] = function(block: Block): string {
  const bytes = javascriptGenerator.valueToCode(block, 'BYTES', Order.ATOMIC) || 'bytes';
  const bits = javascriptGenerator.valueToCode(block, 'BITS', Order.ATOMIC) || 'bits';
  return `${bytes} = parseInt(${bits}, 2);\n`;
};

javascriptGenerator.forBlock['data_convert_bytes_to_bits'] = function(block: Block): string {
  const bits = javascriptGenerator.valueToCode(block, 'BITS', Order.ATOMIC) || 'bits';
  const bytes = javascriptGenerator.valueToCode(block, 'BYTES', Order.ATOMIC) || 'bytes';
  return `${bits} = ${bytes}.toString(2);\n`;
};
