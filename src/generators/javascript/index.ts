import './ctrl';
import './data';
import './array';
import './bit';
import './logic';
import './sbox';
import './hash';
import './sha512';
import './numtheory';
import './ecc';
import './zuc';
import './cmac';
import './ccm';
import './xts';
import './x25519';
import './ascon';
import './hkdf';
import './pbkdf2';
import './gcm';
import './postquantum';
import './procedure';
import './symmetric';
import './eddsa';
import './ecdsa';
import './sm2sig';
import './sm2enc';
import './ecdh';
import './drbg';
import './argon2';
import './gmdrbg';
import './mldsa';
import './rsa';
import './sm9';

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
  void _block;
  return ['data', Order.ATOMIC];
};

javascriptGenerator.forBlock['seed_hex'] = function (
  _block: Block,
): [string, Order] {
  void _block;
  return [
    'Array.from(data, b => b.toString(16).padStart(2, "0")).join("")',
    Order.ATOMIC,
  ];
};

javascriptGenerator.forBlock['cipher_key_from_seed'] = function (
  _block: Block,
): [string, Order] {
  void _block;
  const helper = javascriptGenerator.provideFunction_('cryptoCipherKeyFromSeed', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(seed) {',
    '  if (!(seed instanceof Uint8Array) && !(seed instanceof ArrayBuffer)) throw new TypeError("seed must be bytes");',
    '  var bytes = seed instanceof Uint8Array ? seed : new Uint8Array(seed);',
    '  if (bytes.length < 16) throw new RangeError("seed must contain at least 16 bytes");',
    '  return [0, 4, 8, 12].map(function(i) { return ((bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3]) >>> 0; });',
    '}',
  ]);
  return [helper + '(data)', Order.ATOMIC];
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
        javascriptGenerator.valueToCode(block, 'TEXT', Order.NONE) || '\'\'';
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
import './remaining';
