/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 数学原语 + HMAC + 编码工具 — Python 生成器
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

// ═══ M3 数学 ═══════════════════════════════════════════

pythonGenerator.forBlock['nt_mod'] = function(b: Block): [string, number] {
  const a = pythonGenerator.valueToCode(b,'A',Order.ATOMIC)||'0';
  const n = pythonGenerator.valueToCode(b,'B',Order.ATOMIC)||'1';
  return ['('+a+' % '+n+')', Order.ATOMIC];
};
pythonGenerator.forBlock['nt_mod_pow'] = function(b: Block): [string, number] {
  return ['pow('+(pythonGenerator.valueToCode(b,'A',Order.ATOMIC)||'0')+','+(pythonGenerator.valueToCode(b,'B',Order.ATOMIC)||'0')+',1)', Order.ATOMIC];
};
pythonGenerator.forBlock['nt_div_rem'] = function(b: Block): [string, number] {
  return ['divmod('+(pythonGenerator.valueToCode(b,'A',Order.ATOMIC)||'0')+','+(pythonGenerator.valueToCode(b,'B',Order.ATOMIC)||'1')+')', Order.ATOMIC];
};

const _bnPy = (op: string) => (b: Block): [string, number] => {
  const a = pythonGenerator.valueToCode(b,'A',Order.ATOMIC)||'0';
  const v = pythonGenerator.valueToCode(b,'B',Order.ATOMIC)||'0';
  return ['('+a+' '+op+' '+v+')', Order.ATOMIC];
};
pythonGenerator.forBlock['bn_add'] = _bnPy('+');
pythonGenerator.forBlock['bn_sub'] = _bnPy('-');
pythonGenerator.forBlock['bn_mul'] = _bnPy('*');
pythonGenerator.forBlock['bn_div'] = _bnPy('//');

pythonGenerator.forBlock['hash_hmac'] = function(b: Block): [string, number] {
  const key = pythonGenerator.valueToCode(b,'KEY',Order.ATOMIC)||'b""';
  const msg = pythonGenerator.valueToCode(b,'MSG',Order.ATOMIC)||'b""';
  const hash = b.getFieldValue('HASH')||'sha256';
  const h = hash==='sm3'?'\'sm3\'':'\'sha256\'';
  const fn = pythonGenerator.provideFunction_('hmac_'+hash, [
    'def '+pythonGenerator.FUNCTION_NAME_PLACEHOLDER_+'(key,msg):',
    '    import hmac,hashlib',
    '    return hmac.new(key,msg,'+h+').digest()',
  ]);
  return [fn+'('+key+','+msg+')', Order.ATOMIC];
};

// ═══ 编码工具 ═════════════════════════════════════════

pythonGenerator.forBlock['base64_encode'] = function(b: Block): [string, number] {
  return ['__import__("base64").b64encode('+(pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'b""')+').decode()', Order.ATOMIC];
};
pythonGenerator.forBlock['base64_decode'] = function(b: Block): [string, number] {
  return ['__import__("base64").b64decode('+(pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'""')+')', Order.ATOMIC];
};
pythonGenerator.forBlock['hex_to_bytes'] = function(b: Block): [string, number] {
  return ['bytes.fromhex('+(pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'""')+')', Order.ATOMIC];
};
pythonGenerator.forBlock['bytes_to_hex'] = function(b: Block): [string, number] {
  return ['('+(pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'b""')+').hex()', Order.ATOMIC];
};
pythonGenerator.forBlock['endian_swap'] = function(b: Block): [string, number] {
  return ['list(reversed('+(pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]')+'))', Order.ATOMIC];
};
