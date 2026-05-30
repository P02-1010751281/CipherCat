import { javascriptGenerator, Order } from 'blockly/javascript';
import type { Block } from 'blockly';
import { registerHexToBytes } from '../data/helpers';

let _sm3PadFn: string | null = null;
function getSm3PadFn(): string {
  if (!_sm3PadFn) {
    _sm3PadFn = javascriptGenerator.provideFunction_('sm3Pad', [
      'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(msg) {',
      '  if (typeof msg === "string") msg = new TextEncoder().encode(msg);',
      '  else if (Array.isArray(msg)) msg = Uint8Array.from(msg);',
      '  var mLen = msg.length;',
      '  var mLenBits = mLen * 8;',
      '  var k = (448 - mLenBits - 1) % 512;',
      '  if (k < 0) k += 512;',
      '  var padded = new Uint8Array(mLen + 1 + Math.floor(k / 8) + 8);',
      '  padded.set(msg);',
      '  padded[mLen] = 0x80;',
      '  for (var i = 0; i < 4; i++) {',
      '    padded[padded.length - 1 - i] = (mLenBits >>> (8 * i)) & 0xFF;',
      '  }',
      '  return padded;',
      '}',
    ]);
  }
  return _sm3PadFn;
}

/** SM3 padding — pad text message. */
javascriptGenerator.forBlock['hash_sm3_pad_text'] = function (
  block: Block,
): string {
  const left =
    javascriptGenerator.valueToCode(block, 'LEFT', Order.ATOMIC) ||
    'msg_padded';
  const right =
    javascriptGenerator.valueToCode(block, 'RIGHT', Order.ATOMIC) || "''";
  return `${left} = ${getSm3PadFn()}(${right});\n`;
};

/** SM3 padding — pad hex message (converted to bytes first). */
javascriptGenerator.forBlock['hash_sm3_pad_hex'] = function (
  block: Block,
): string {
  const left =
    javascriptGenerator.valueToCode(block, 'LEFT', Order.ATOMIC) ||
    'msg_padded';
  const right =
    javascriptGenerator.valueToCode(block, 'RIGHT', Order.ATOMIC) || "''";
  const hexFn = registerHexToBytes();
  return `${left} = ${getSm3PadFn()}(${hexFn}(${right}));\n`;
};

/** SM3 compression function (CF) per GB/T 32905-2016. */
javascriptGenerator.forBlock['hash_sm3_compress'] = function (
  block: Block,
): string {
  const out =
    javascriptGenerator.valueToCode(block, 'OUT', Order.ATOMIC) || 'y';
  const v = javascriptGenerator.valueToCode(block, 'V', Order.ATOMIC) || '[]';
  const w = javascriptGenerator.valueToCode(block, 'W', Order.ATOMIC) || '[]';

  const compressFn = javascriptGenerator.provideFunction_('sm3Compress', [
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
    '  for (var j=0;j<16;j++) W[j] = B[j]||0;',
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

  return `${out} = ${compressFn}(${v}, ${w});\n`;
};
