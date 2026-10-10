/**
 * 数学原语 + HMAC + 编码工具 — Python 生成器
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';
import { registerSm3LengthField } from './hash/sm3';

// ═══ M3 数学 ═══════════════════════════════════════════

pythonGenerator.forBlock['nt_mod'] = function(b: Block): [string, number] {
  const a = pythonGenerator.valueToCode(b,'A',Order.ATOMIC)||'0';
  const n = pythonGenerator.valueToCode(b,'B',Order.ATOMIC)||'1';
  const mod = pythonGenerator.provideFunction_('positive_mod', [
    'def '+pythonGenerator.FUNCTION_NAME_PLACEHOLDER_+'(a, modulus):',
    '    import math',
    '    limit = 2**53 - 1',
    '    def is_safe_integer(value):',
    '        if isinstance(value, bool): return False',
    '        if isinstance(value, int): return abs(value) <= limit',
    '        return isinstance(value, float) and math.isfinite(value) and value.is_integer() and abs(value) <= limit',
    '    if not is_safe_integer(a) or not is_safe_integer(modulus):',
    '        raise ValueError("modular arithmetic requires safe integers")',
    '    if modulus <= 0:',
    '        raise ValueError("modulus must be positive")',
    '    return int(a) % int(modulus)',
  ]);
  return [mod+'('+a+', '+n+')', Order.ATOMIC];
};
pythonGenerator.forBlock['nt_mod_pow'] = function(b: Block): [string, number] {
  const a = pythonGenerator.valueToCode(b,'A',Order.ATOMIC)||'0';
  const e = pythonGenerator.valueToCode(b,'B',Order.ATOMIC)||'0';
  const m = b.getFieldValue('MODULUS')||'1';
  const modPow = pythonGenerator.provideFunction_('pow_mod', [
    'def '+pythonGenerator.FUNCTION_NAME_PLACEHOLDER_+'(base, exponent, modulus):',
    '    limit = 2**53 - 1',
    '    import math',
    '    def is_safe_integer(value):',
    '        if isinstance(value, bool) or not isinstance(value, (int, float)):',
    '            return False',
    '        if isinstance(value, int):',
    '            return abs(value) <= limit',
    '        return math.isfinite(value) and value.is_integer() and abs(value) <= limit',
    '    if not all(is_safe_integer(value) for value in (base, exponent, modulus)):',
    '        raise ValueError("modular exponentiation requires safe integers")',
    '    if exponent < 0 or modulus <= 0:',
    '        raise ValueError("expected a non-negative exponent and positive modulus")',
    '    return pow(int(base), int(exponent), int(modulus))',
  ]);
  return [modPow+'('+a+', '+e+', '+m+')', Order.ATOMIC];
};
pythonGenerator.forBlock['nt_div_rem'] = function(b: Block): [string, number] {
  const a = pythonGenerator.valueToCode(b,'A',Order.ATOMIC)||'0';
  const d = pythonGenerator.valueToCode(b,'B',Order.ATOMIC)||'1';
  const divmod = pythonGenerator.provideFunction_('safe_divmod', [
    'def '+pythonGenerator.FUNCTION_NAME_PLACEHOLDER_+'(a, d):',
    '    import math',
    '    limit = 2**53 - 1',
    '    def is_safe_integer(value):',
    '        if isinstance(value, bool): return False',
    '        if isinstance(value, int): return abs(value) <= limit',
    '        return isinstance(value, float) and math.isfinite(value) and value.is_integer() and abs(value) <= limit',
    '    if not is_safe_integer(a) or not is_safe_integer(d): raise ValueError("dividend and divisor must be safe integers")',
    '    return list(divmod(int(a), int(d)))',
  ]);
  return [divmod+'('+a+', '+d+')', Order.ATOMIC];
};

const _bnToInt = () => pythonGenerator.provideFunction_('bn_to_int', [
  'def '+pythonGenerator.FUNCTION_NAME_PLACEHOLDER_+'(limbs):',
  '    if not isinstance(limbs, list): raise TypeError("big-number limbs must be a list")',
  '    value = 0',
  '    for limb in reversed(limbs):',
  '        if isinstance(limb, bool) or not isinstance(limb, (int, float)) or not 0 <= limb <= 0xFFFFFFFF or int(limb) != limb: raise ValueError("limbs must be unsigned 32-bit integers")',
  '        value = (value << 32) | int(limb)',
  '    return value',
]);
const _bnFromInt = () => pythonGenerator.provideFunction_('bn_from_int', [
  'def '+pythonGenerator.FUNCTION_NAME_PLACEHOLDER_+'(value):',
  '    limbs = []',
  '    while value > 0:',
  '        limbs.append(value & 0xFFFFFFFF)',
  '        value >>= 32',
  '    return limbs or [0]',
]);
const _bnPy = (op: string) => (b: Block): [string, number] => {
  const a = pythonGenerator.valueToCode(b,'A',Order.ATOMIC)||'0';
  const v = pythonGenerator.valueToCode(b,'B',Order.ATOMIC)||'0';
  const left = _bnToInt()+'('+a+')';
  const right = _bnToInt()+'('+v+')';
  if (op === '-') {
    const subtract = pythonGenerator.provideFunction_('bn_subtract', [
      'def '+pythonGenerator.FUNCTION_NAME_PLACEHOLDER_+'(left, right):',
      '    if left < right:',
      '        raise ValueError("unsigned big-number underflow")',
      '    return '+_bnFromInt()+'(left - right)',
    ]);
    return [subtract+'('+left+', '+right+')', Order.ATOMIC];
  }
  return [_bnFromInt()+'(('+left+' '+op+' '+right+'))', Order.ATOMIC];
};
pythonGenerator.forBlock['bn_add'] = _bnPy('+');
pythonGenerator.forBlock['bn_sub'] = _bnPy('-');
pythonGenerator.forBlock['bn_mul'] = _bnPy('*');
pythonGenerator.forBlock['bn_div'] = _bnPy('//');

function registerHmacInputBytes(): string {
  return pythonGenerator.provideFunction_('hmac_input_bytes', [
    'def ' + pythonGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(value):',
    '    if isinstance(value, str): return value.encode("utf-8")',
    '    if isinstance(value, (bytes, bytearray)): return bytes(value)',
    '    if not isinstance(value, (list, tuple)) or any(isinstance(byte, bool) or not isinstance(byte, (int, float)) or not 0 <= byte <= 255 or int(byte) != byte for byte in value): raise ValueError("HMAC input must be UTF-8 text or byte values from 0 to 255")',
    '    return bytes(int(byte) for byte in value)',
  ]);
}

pythonGenerator.forBlock['hash_hmac'] = function(b: Block): [string, number] {
  const key = pythonGenerator.valueToCode(b,'KEY',Order.ATOMIC)||'b""';
  const msg = pythonGenerator.valueToCode(b,'MSG',Order.ATOMIC)||'b""';
  const hash = b.getFieldValue('HASH')||'SHA-256';
  const inputBytes = registerHmacInputBytes();
  if (hash === 'SM3') {
    const lengthField = registerSm3LengthField();
    const fn = pythonGenerator.provideFunction_('sm3_hmac', [
      'def '+pythonGenerator.FUNCTION_NAME_PLACEHOLDER_+'(key,msg):',
      '    key = ' + inputBytes + '(key)',
      '    msg = ' + inputBytes + '(msg)',
      '    def sm3_hash(input):',
      '        m = list(input)',
      '        m_len_bits = len(m) * 8',
      '        kk = (448 - m_len_bits - 1) % 512',
      '        if kk < 0:',
      '            kk += 512',
      '        m = m + [0x80] + [0] * (kk // 8) + [0] * 8',
      '        m[-8:] = ' + lengthField + '(len(input))',
      '        def rotl(x, n):',
      '            return ((x << n) | (x >> (32 - n))) & 0xFFFFFFFF',
      '        def p0(x):',
      '            return x ^ rotl(x, 9) ^ rotl(x, 17)',
      '        def p1(x):',
      '            return x ^ rotl(x, 15) ^ rotl(x, 23)',
      '        IV = [0x7380166f,0x4914b2b9,0x172442d7,0xda8a0600,0xa96f30bc,0x163138aa,0xe38dee4d,0xb0fb0e4e]',
      '        v = list(IV)',
      '        for off in range(0, len(m), 64):',
      '            b = m[off:off+64]',
      '            w = [0]*68',
      '            for j in range(16):',
      '                w[j] = (b[j*4]<<24) | (b[j*4+1]<<16) | (b[j*4+2]<<8) | b[j*4+3]',
      '            for j in range(16, 68):',
      '                w[j] = (p1(w[j-16]^w[j-9]^rotl(w[j-3],15)) ^ rotl(w[j-13],7) ^ w[j-6]) & 0xFFFFFFFF',
      '            a,b2,c,d,e,f,g,h = v',
      '            for j in range(64):',
      '                if j < 16:',
      '                    ff = a ^ b2 ^ c',
      '                    gg = e ^ f ^ g',
      '                    t = 0x79cc4519',
      '                else:',
      '                    ff = (a & b2) | (a & c) | (b2 & c)',
      '                    gg = (e & f) | ((~e) & g)',
      '                    t = 0x7a879d8a',
      '                ss1 = rotl((rotl(a,12) + e + rotl(t, j % 32)) & 0xFFFFFFFF, 7)',
      '                ss2 = ss1 ^ rotl(a, 12)',
      '                tt1 = (ff + d + ss2 + (w[j] ^ w[j+4])) & 0xFFFFFFFF',
      '                tt2 = (gg + h + ss1 + w[j]) & 0xFFFFFFFF',
      '                d = c',
      '                c = rotl(b2, 9)',
      '                b2 = a',
      '                a = tt1',
      '                h = g',
      '                g = rotl(f, 19)',
      '                f = e',
      '                e = p0(tt2)',
      '            v = [(x ^ y) & 0xFFFFFFFF for x, y in zip(v, [a,b2,c,d,e,f,g,h])]',
      '        out = []',
      '        for x in v:',
      '            out += [(x>>24)&0xFF, (x>>16)&0xFF, (x>>8)&0xFF, x&0xFF]',
      '        return out',
      '    k = list(key)',
      '    if len(k) > 64:',
      '        k = sm3_hash(k)',
      '    k = k + [0] * (64 - len(k))',
      '    ipad = [x ^ 0x36 for x in k]',
      '    opad = [x ^ 0x5c for x in k]',
      '    return bytes(sm3_hash(opad + sm3_hash(ipad + list(msg))))',
    ]);
    return [fn+'('+key+','+msg+')', Order.ATOMIC];
  }
  const h = '\'sha256\'';
  const fn = pythonGenerator.provideFunction_('hmac_sha256', [
    'def '+pythonGenerator.FUNCTION_NAME_PLACEHOLDER_+'(key,msg):',
    '    import hmac,hashlib',
    '    key = ' + inputBytes + '(key)',
    '    msg = ' + inputBytes + '(msg)',
    '    return hmac.new(key,msg,'+h+').digest()',
  ]);
  return [fn+'('+key+','+msg+')', Order.ATOMIC];
};

// ═══ 编码工具 ═════════════════════════════════════════

pythonGenerator.forBlock['base64_encode'] = function(b: Block): [string, number] {
  return ['__import__("base64").b64encode('+(pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'b""')+').decode()', Order.ATOMIC];
};
pythonGenerator.forBlock['base64_decode'] = function(b: Block): [string, number] {
  return ['__import__("base64").b64decode('+(pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'""')+', validate=True)', Order.ATOMIC];
};
pythonGenerator.forBlock['hex_to_bytes'] = function(b: Block): [string, number] {
  const input = pythonGenerator.valueToCode(b, 'INPUT', Order.ATOMIC) || '""';
  const fn = pythonGenerator.provideFunction_('hex_to_bytes', [
    'def '+pythonGenerator.FUNCTION_NAME_PLACEHOLDER_+'(value):',
    '    if not isinstance(value, str) or len(value) % 2 or any(char not in "0123456789abcdefABCDEF" for char in value):',
    '        raise ValueError("expected an even-length hexadecimal string")',
    '    return bytes.fromhex(value)',
  ]);
  return [fn+'('+input+')', Order.ATOMIC];
};
pythonGenerator.forBlock['bytes_to_hex'] = function(b: Block): [string, number] {
  return ['('+(pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'b""')+').hex()', Order.ATOMIC];
};
pythonGenerator.forBlock['endian_swap'] = function(b: Block): [string, number] {
  return ['list(reversed('+(pythonGenerator.valueToCode(b,'INPUT',Order.ATOMIC)||'[]')+'))', Order.ATOMIC];
};
