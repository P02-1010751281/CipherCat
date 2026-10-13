import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly';
import { registerHexToBytes, registerUtf8ToBytes } from '../data/helpers';

export function registerSm3LengthField(): string {
  return javascriptGenerator.provideFunction_('sm3LengthField', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(byteLength) {',
    '  if (!Number.isSafeInteger(byteLength) || byteLength < 0) throw new RangeError("SM3 byte length must be a non-negative safe integer");',
    '  var bitLength = BigInt(byteLength) * 8n;',
    '  var field = new Uint8Array(8);',
    '  for (var i = 7; i >= 0; i--) {',
    '    field[i] = Number(bitLength & 0xFFn);',
    '    bitLength >>= 8n;',
    '  }',
    '  return field;',
    '}',
  ]);
}

function getSm3PadFn(): string {
  const lengthField = registerSm3LengthField();
  const utf8ToBytes = registerUtf8ToBytes();
  return javascriptGenerator.provideFunction_('sm3Pad', [
      'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(msg) {',
      '  if (typeof msg === "string") msg = ' + utf8ToBytes + '(msg);',
      '  else if (Array.isArray(msg)) {',
      '    for (var i = 0; i < msg.length; i++) if (!Number.isSafeInteger(msg[i]) || msg[i] < 0 || msg[i] > 255) throw new TypeError("SM3 input must contain byte integers from 0 to 255");',
      '    msg = Uint8Array.from(msg);',
      '  } else if (!(msg instanceof Uint8Array)) {',
      '    throw new TypeError("SM3 input must be UTF-8 text or bytes");',
      '  }',
      '  var mLen = msg.length;',
      '  var mLenBits = mLen * 8;',
      '  var k = (448 - mLenBits - 1) % 512;',
      '  if (k < 0) k += 512;',
      '  var padded = new Uint8Array(mLen + 1 + Math.floor(k / 8) + 8);',
      '  padded.set(msg);',
      '  padded[mLen] = 0x80;',
      '  padded.set(' + lengthField + '(mLen), padded.length - 8);',
      '  return padded;',
      '}',
  ]);
}

function registerSm3PadText(): string {
  const pad = getSm3PadFn();
  return javascriptGenerator.provideFunction_('sm3PadText', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(text) {',
    '  if (typeof text !== "string") throw new TypeError("expected UTF-8 text");',
    '  return ' + pad + '(text);',
    '}',
  ]);
}

javascriptGenerator.forBlock['hash_sm3_pad_text'] = function (
  block: Block,
): [string, number] {
  const input =
    javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '\'\'';
  return [registerSm3PadText() + '(' + input + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['hash_sm3_pad'] = function (
  block: Block,
): [string, number] {
  const input =
    javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '\'\'';
  return [getSm3PadFn() + '(' + input + ')', Order.ATOMIC];
};

javascriptGenerator.forBlock['hash_sm3_pad_hex'] = function (
  block: Block,
): [string, number] {
  const input =
    javascriptGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '\'\'';
  const hexFn = registerHexToBytes();
  return [getSm3PadFn() + '(' + hexFn + '(' + input + '))', Order.ATOMIC];
};

/** SM3 压缩函数 CF（GB/T 32905-2016 §5.3.3），供模板与哈希助手复用 */
export function registerSm3Compress(): string {
  return javascriptGenerator.provideFunction_('sm3Compress', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(V, B) {',
    '  var P0 = function(x) { return x ^ ((x << 9) | (x >>> 23)) ^ ((x << 17) | (x >>> 15)); };',
    '  var P1 = function(x) { return x ^ ((x << 15) | (x >>> 17)) ^ ((x << 23) | (x >>> 9)); };',
    '  var FF0 = function(x,y,z) { return x ^ y ^ z; };',
    '  var FF1 = function(x,y,z) { return (x & y) | (x & z) | (y & z); };',
    '  var GG0 = function(x,y,z) { return x ^ y ^ z; };',
    '  var GG1 = function(x,y,z) { return (x & y) | (~x & z); };',
    '  var T = [0x79cc4519,0x7a879d8a];',
    '  var W = new Array(68);',
    '  var W1 = new Array(64);',
    '  // B 可为 64 字节（pad 输出）或 16 字（显式传入）——统一转字',
    '  if (B.length === 16) { for (var j=0;j<16;j++) W[j] = B[j]>>>0; }',
    '  else { for (var j=0;j<16;j++) W[j] = (((B[4*j]||0)<<24)|((B[4*j+1]||0)<<16)|((B[4*j+2]||0)<<8)|(B[4*j+3]||0))>>>0; }',
    '  for (var j=16;j<68;j++) {',
    '    W[j] = P1(W[j-16] ^ W[j-9] ^ ((W[j-3]<<15)|(W[j-3]>>>17))) ^ ((W[j-13]<<7)|(W[j-13]>>>25)) ^ W[j-6];',
    '  }',
    '  for (var j=0;j<64;j++) W1[j] = W[j] ^ W[j+4];',
    '  var A=V[0],B2=V[1],C=V[2],D=V[3],E=V[4],F=V[5],G=V[6],H=V[7];',
    '  for (var j=0;j<64;j++) {',
    '    var SS1 = ((A<<12)|(A>>>20)) + E + ((T[j<16?0:1]<<j)|(T[j<16?0:1]>>>(32-j)));',
    '    SS1 = ((SS1<<7)|(SS1>>>25));',
    '    var SS2 = SS1 ^ ((A<<12)|(A>>>20));',
    '    var TT1, TT2;',
    '    if (j<16) { TT1 = FF0(A,B2,C)+D+SS2+W1[j]; TT2 = GG0(E,F,G)+H+SS1+W[j]; }',
    '    else { TT1 = FF1(A,B2,C)+D+SS2+W1[j]; TT2 = GG1(E,F,G)+H+SS1+W[j]; }',
    '    D = C; C = ((B2<<9)|(B2>>>23)); B2 = A; A = TT1; H = G;',
    '    G = ((F<<19)|(F>>>13)); F = E; E = P0(TT2);',
    '  }',
    '  return [A^V[0],B2^V[1],C^V[2],D^V[3],E^V[4],F^V[5],G^V[6],H^V[7]];',
    '}',
  ]);
}

/** SM3 哈希（GB/T 32905-2016）：输入 UTF-8 文本或字节，输出 32 字节 */
export function registerSm3Hash(): string {
  const pad = getSm3PadFn();
  const compress = registerSm3Compress();
  return javascriptGenerator.provideFunction_('sm3Hash', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(msg) {',
    '  var B = ' + pad + '(msg);',
    '  var V = [0x7380166f,0x4914b2b9,0x172442d7,0xda8a0600,0xa96f30bc,0x163138aa,0xe38dee4d,0xb0fb0e4e];',
    '  for (var i = 0; i < B.length; i += 64) V = ' + compress + '(V, B.slice(i, i + 64));',
    '  var out = [];',
    '  for (var i = 0; i < 8; i++) out.push((V[i]>>>24)&0xFF,(V[i]>>>16)&0xFF,(V[i]>>>8)&0xFF,V[i]&0xFF);',
    '  return out;',
    '}',
  ]);
}

javascriptGenerator.forBlock['hash_sm3_compress'] = function (
  block: Block,
): [string, number] {
  const v = javascriptGenerator.valueToCode(block, 'V', Order.ATOMIC) || '[]';
  const w = javascriptGenerator.valueToCode(block, 'W', Order.ATOMIC) || '[]';

  const compressFn = registerSm3Compress();

  return [compressFn + '(' + v + ', ' + w + ')', Order.ATOMIC];
};
