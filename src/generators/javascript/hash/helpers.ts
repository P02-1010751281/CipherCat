import { javascriptGenerator } from 'blockly/javascript';

export function registerKeccakF1600(): string {
  return javascriptGenerator.provideFunction_('keccakF1600', [
    'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + '(state) {',
    '  let RC = [',
    '    0x0000000000000001n, 0x0000000000008082n, 0x800000000000808An, 0x8000000080008000n,',
    '    0x000000000000808Bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,',
    '    0x000000000000008An, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000An,',
    '    0x000000008000808Bn, 0x800000000000008Bn, 0x8000000000008089n, 0x8000000000008003n,',
    '    0x8000000000008002n, 0x8000000000000080n, 0x000000000000800An, 0x800000008000000An,',
    '    0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,',
    '  ];',
    '  let R = [[0,1,62,28,27],[36,44,6,55,20],[3,10,43,25,39],[41,45,15,21,8],[18,2,61,56,14]];',
    '  let M = 0xFFFFFFFFFFFFFFFFn;',
    '  let s = state.slice();',
    '  for (let round = 0; round < 24; round++) {',
    '    let C = new Array(5), D = new Array(5);',
    '    for (let x = 0; x < 5; x++) C[x] = s[x] ^ s[x+5] ^ s[x+10] ^ s[x+15] ^ s[x+20];',
    '    for (let x = 0; x < 5; x++) D[x] = C[(x+4)%5] ^ ((C[(x+1)%5] << 1n) | (C[(x+1)%5] >> 63n)) & M;',
    '    for (let i = 0; i < 25; i++) s[i] ^= D[i%5];',
    '    let B = new Array(25);',
    '    for (let x = 0; x < 5; x++) {',
    '      for (let y = 0; y < 5; y++) {',
    '        let r = R[x][y];',
    '        B[y*5+((2*x+3*y)%5)] = ((s[x+y*5] << BigInt(r)) | (s[x+y*5] >> BigInt(64-r))) & M;',
    '      }',
    '    }',
    '    for (let x = 0; x < 5; x++) {',
    '      for (let y = 0; y < 5; y++) {',
    '        s[x+y*5] = B[x+y*5] ^ ((~B[(x+1)%5+y*5]) & B[(x+2)%5+y*5]);',
    '      }',
    '    }',
    '    s[0] ^= RC[round];',
    '  }',
    '  return s;',
    '}',
  ]);
}

export function registerSha3Pad(): string {
  return javascriptGenerator.provideFunction_('sha3Pad', [
    'function ' +
      javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
      '(msg, rateBytes, suffix) {',
    '  if (typeof msg === "string") msg = new TextEncoder().encode(msg);',
    '  else if (Array.isArray(msg)) msg = Uint8Array.from(msg);',
    '  rateBytes = rateBytes || 136;',
    '  suffix = (suffix !== undefined) ? suffix : 0x06;',
    '  let mLen = msg.length;',
    '  let q = rateBytes - (mLen % rateBytes);',
    '  if (q === 1) q += rateBytes;',
    '  let padded = new Uint8Array(mLen + q);',
    '  padded.set(msg);',
    '  padded[mLen] ^= suffix;',
    '  padded[mLen + q - 1] ^= 0x80;',
    '  return padded;',
    '}',
  ]);
}
