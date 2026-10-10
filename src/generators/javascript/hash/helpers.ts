import { javascriptGenerator } from 'blockly/javascript';
import { registerUtf8ToBytes } from '../data/helpers';

export function registerKeccakF(): string {
  return javascriptGenerator.provideFunction_('keccakF', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(state, width) {',
    '  if (![200, 400, 800, 1600].includes(width)) throw new RangeError("Unsupported Keccak-f width");',
    '  if (!Array.isArray(state) || state.length !== 25) throw new TypeError("Keccak-f state must contain 25 lanes");',
    '  const laneBits = width / 25;',
    '  const mask = (1n << BigInt(laneBits)) - 1n;',
    '  let s = state.map((lane) => {',
    '    if (typeof lane === "number" && !Number.isSafeInteger(lane)) throw new TypeError("Keccak-f lanes must be integers");',
    '    if (typeof lane !== "number" && typeof lane !== "bigint") throw new TypeError("Keccak-f lanes must be integers");',
    '    const value = BigInt(lane);',
    '    if (value < 0n || value > mask) throw new RangeError("Keccak-f lane is outside the selected width");',
    '    return value;',
    '  });',
    '  let RC = [',
    '    0x0000000000000001n, 0x0000000000008082n, 0x800000000000808An, 0x8000000080008000n,',
    '    0x000000000000808Bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,',
    '    0x000000000000008An, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000An,',
    '    0x000000008000808Bn, 0x800000000000008Bn, 0x8000000000008089n, 0x8000000000008003n,',
    '    0x8000000000008002n, 0x8000000000000080n, 0x000000000000800An, 0x800000008000000An,',
    '    0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,',
    '  ];',
    '  let R = [[0,36,3,41,18],[1,44,10,45,2],[62,6,43,15,61],[28,55,25,21,56],[27,20,39,8,14]];',
    '  const rounds = 12 + 2 * Math.log2(laneBits);',
    '  for (let round = 0; round < rounds; round++) {',
    '    let C = new Array(5), D = new Array(5);',
    '    for (let x = 0; x < 5; x++) C[x] = s[x] ^ s[x+5] ^ s[x+10] ^ s[x+15] ^ s[x+20];',
    '    for (let x = 0; x < 5; x++) D[x] = (C[(x+4)%5] ^ ((C[(x+1)%5] << 1n) | (C[(x+1)%5] >> BigInt(laneBits-1)))) & mask;',
    '    for (let i = 0; i < 25; i++) s[i] = (s[i] ^ D[i%5]) & mask;',
    '    let B = new Array(25);',
    '    for (let x = 0; x < 5; x++) {',
    '      for (let y = 0; y < 5; y++) {',
    '        let r = R[x][y] % laneBits;',
    '        B[((2*x+3*y)%5)*5+y] = ((s[x+y*5] << BigInt(r)) | (s[x+y*5] >> BigInt(laneBits-r))) & mask;',
    '      }',
    '    }',
    '    for (let x = 0; x < 5; x++) {',
    '      for (let y = 0; y < 5; y++) {',
    '        s[x+y*5] = (B[x+y*5] ^ ((~B[(x+1)%5+y*5]) & B[(x+2)%5+y*5])) & mask;',
    '      }',
    '    }',
    '    s[0] = (s[0] ^ RC[round]) & mask;',
    '  }',
    '  return s;',
    '}',
  ]);
}

export function registerKeccakF1600(): string {
  const keccakName = registerKeccakF();
  return javascriptGenerator.provideFunction_('keccakF1600', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(state) {',
    '  return ' + keccakName + '(state, 1600);',
    '}',
  ]);
}

export function registerSha3Pad(): string {
  const utf8ToBytes = registerUtf8ToBytes();
  return javascriptGenerator.provideFunction_('sha3Pad', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(msg, rateBytes, suffix) {',
    '  if (typeof msg === "string") msg = ' + utf8ToBytes + '(msg);',
    '  else if (Array.isArray(msg)) {',
    '    for (let i = 0; i < msg.length; i++) if (!Number.isSafeInteger(msg[i]) || msg[i] < 0 || msg[i] > 255) throw new TypeError("SHA-3 input must contain byte integers from 0 to 255");',
    '    msg = Uint8Array.from(msg);',
    '  } else if (!(msg instanceof Uint8Array)) {',
    '    throw new TypeError("SHA-3 input must be UTF-8 text or bytes");',
    '  }',
    '  rateBytes = rateBytes || 136;',
    '  suffix = (suffix !== undefined) ? suffix : 0x06;',
    '  let mLen = msg.length;',
    '  let q = rateBytes - (mLen % rateBytes);',
    '  let padded = new Uint8Array(mLen + q);',
    '  padded.set(msg);',
    '  padded[mLen] ^= suffix;',
    '  padded[mLen + q - 1] ^= 0x80;',
    '  return padded;',
    '}',
  ]);
}

export function registerSha3Absorb(): string {
  const keccakName = registerKeccakF();
  return javascriptGenerator.provideFunction_('sha3Absorb', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(state, block, rateBytes) {',
    '  if (block.length % rateBytes !== 0) throw new RangeError("Sponge absorb input length must be a multiple of the rate");',
    '  let s = state.slice();',
    '  let lanes = rateBytes >> 3;',
    '  for (let offset = 0; offset < block.length; offset += rateBytes) {',
    '    let chunk = block.slice(offset, offset + rateBytes);',
    '    for (let i = 0; i < lanes; i++) {',
    '      let lane = 0n;',
    '      for (let j = 0; j < 8; j++) {',
    '        let idx = i * 8 + j;',
    '        if (idx < chunk.length) lane |= BigInt(chunk[idx]) << BigInt(j * 8);',
    '      }',
    '      s[i] ^= lane;',
    '    }',
    '    s = ' + keccakName + '(s, 1600);',
    '  }',
    '  return s;',
    '}',
  ]);
}

export function registerSha3Squeeze(): string {
  const keccakName = registerKeccakF();
  return javascriptGenerator.provideFunction_('sha3Squeeze', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(state, outLen, rateBytes) {',
    '  if (!Number.isSafeInteger(outLen) || outLen < 0) throw new RangeError("Sponge output length must be a non-negative safe integer value");',
    '  let s = state.slice();',
    '  let lanes = rateBytes >> 3;',
    '  let out = new Uint8Array(outLen);',
    '  let cursor = 0;',
    '  while (cursor < outLen) {',
    '    for (let i = 0; i < lanes && cursor < outLen; i++) {',
    '      for (let j = 0; j < 8 && cursor < outLen; j++) {',
    '        out[cursor++] = Number((s[i] >> BigInt(j * 8)) & 0xFFn);',
    '      }',
    '    }',
    '    if (cursor < outLen) s = ' + keccakName + '(s, 1600);',
    '  }',
    '  return out;',
    '}',
  ]);
}
