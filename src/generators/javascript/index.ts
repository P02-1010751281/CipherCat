import './ctrl';
import './data';
import './array';
import './bit';
import './logic';
import './sbox';
import './hash';
import './numtheory';
import './ecc';
import './postquantum';

import { Block } from 'blockly/core';
import { javascriptGenerator, Order } from 'blockly/javascript';
import { getMigrationMap } from '@/utils/migration';

javascriptGenerator.forBlock['data_value'] = function (
  block: Block,
): [string, Order] {
  const raw = block.getFieldValue('NUM');
  const value = parseFloat(raw);
  if (!isNaN(value) && String(value) === raw.trim()) {
    const order = value < 0 ? Order.UNARY_NEGATION : Order.ATOMIC;
    return [value.toString(), order];
  }
  return [raw, Order.ATOMIC];
};

javascriptGenerator.forBlock['seed_bytes'] = function (
  _block: Block,
): [string, Order] {
  return ['data', Order.ATOMIC];
};

javascriptGenerator.forBlock['seed_hex'] = function (
  _block: Block,
): [string, Order] {
  return ['Buffer.from(data).toString("hex")', Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock['cipher_key_from_seed'] = function (
  _block: Block,
): [string, Order] {
  return [
    '[(data[0]<<24)|(data[1]<<16)|(data[2]<<8)|data[3], (data[4]<<24)|(data[5]<<16)|(data[6]<<8)|data[7], (data[8]<<24)|(data[9]<<16)|(data[10]<<8)|data[11], (data[12]<<24)|(data[13]<<16)|(data[14]<<8)|data[15]]',
    Order.ATOMIC,
  ];
};

const migrationMap = getMigrationMap();
for (const [oldName, newName] of Object.entries(migrationMap)) {
  if (
    javascriptGenerator.forBlock[newName] &&
    !javascriptGenerator.forBlock[oldName]
  ) {
    javascriptGenerator.forBlock[oldName] =
      javascriptGenerator.forBlock[newName];
  }
}

function configureTextPrintBlock() {
  if (javascriptGenerator) {
    javascriptGenerator.forBlock['text_print'] = function (block: Block) {
      const msg =
        javascriptGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
      return 'console.log(' + msg + ');\n';
    };
    return true;
  } else {
    console.warn('JavaScript生成器不可用，无法配置text_print块');
    return false;
  }
}

configureTextPrintBlock();

export { configureTextPrintBlock };
