/**
 * SHA-512 / SHA-384 Python 生成器（FIPS 180-4，64 位字，80 轮）
 *
 * 内嵌 sha512_pad / sha512_compress / sha512_hash（提供 demo driver 直接调用）。
 * sha512_hash(msg, size_bits)：384/512 双 IV + 截断，完整链（pad → 分块 → 调度 → 压缩）。
 */
import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

function registerSha512(): string {
  return pythonGenerator.provideFunction_('sha512_compress', [
    'K = [0x428a2f98d728ae22, 0x7137449123ef65cd, 0xb5c0fbcfec4d3b2f, 0xe9b5dba58189dbbc, 0x3956c25bf348b538, 0x59f111f1b605d019, 0x923f82a4af194f9b, 0xab1c5ed5da6d8118, 0xd807aa98a3030242, 0x12835b0145706fbe, 0x243185be4ee4b28c, 0x550c7dc3d5ffb4e2, 0x72be5d74f27b896f, 0x80deb1fe3b1696b1, 0x9bdc06a725c71235, 0xc19bf174cf692694, 0xe49b69c19ef14ad2, 0xefbe4786384f25e3, 0xfc19dc68b8cd5b5, 0x240ca1cc77ac9c65, 0x2de92c6f592b0275, 0x4a7484aa6ea6e483, 0x5cb0a9dcbd41fbd4, 0x76f988da831153b5, 0x983e5152ee66dfab, 0xa831c66d2db43210, 0xb00327c898fb213f, 0xbf597fc7beef0ee4, 0xc6e00bf33da88fc2, 0xd5a79147930aa725, 0x6ca6351e003826f, 0x142929670a0e6e70, 0x27b70a8546d22ffc, 0x2e1b21385c26c926, 0x4d2c6dfc5ac42aed, 0x53380d139d95b3df, 0x650a73548baf63de, 0x766a0abb3c77b2a8, 0x81c2c92e47edaee6, 0x92722c851482353b, 0xa2bfe8a14cf10364, 0xa81a664bbc423001, 0xc24b8b70d0f89791, 0xc76c51a30654be30, 0xd192e819d6ef5218, 0xd69906245565a910, 0xf40e35855771202a, 0x106aa07032bbd1b8, 0x19a4c116b8d2d0c8, 0x1e376c085141ab53, 0x2748774cdf8eeb99, 0x34b0bcb5e19b48a8, 0x391c0cb3c5c95a63, 0x4ed8aa4ae3418acb, 0x5b9cca4f7763e373, 0x682e6ff3d6b2b8a3, 0x748f82ee5defb2fc, 0x78a5636f43172f60, 0x84c87814a1f0ab72, 0x8cc702081a6439ec, 0x90befffa23631e28, 0xa4506cebde82bde9, 0xbef9a3f7b2c67915, 0xc67178f2e372532b, 0xca273eceea26619c, 0xd186b8c721c0c207, 0xeada7dd6cde0eb1e, 0xf57d4f7fee6ed178, 0x6f067aa72176fba, 0xa637dc5a2c898a6, 0x113f9804bef90dae, 0x1b710b35131c471b, 0x28db77f523047d84, 0x32caab7b40c72493, 0x3c9ebe0a15c9bebc, 0x431d67c49c100d4c, 0x4cc5d4becb3e42b6, 0x597f299cfc657e2a, 0x5fcb6fab3ad6faec, 0x6c44198c4a475817]',
    'M64 = (1 << 64) - 1',
    'def rotr64(x, n):',
    '    return ((x >> n) | (x << (64 - n))) & M64',
    'def sha512_pad(msg):',
    '    if isinstance(msg, str):',
    '        msg = msg.encode("utf-8")',
    '    elif isinstance(msg, list):',
    '        msg = bytes(msg)',
    '    msg = bytes(msg)',
    '    mlen = len(msg) * 8',
    '    msg += b"\\x80"',
    '    while (len(msg) * 8) % 1024 != 896:',
    '        msg += b"\\x00"',
    '    msg += mlen.to_bytes(16, "big")',
    '    return msg',
    'def sha512_compress(v, block):',
    '    if isinstance(block, (bytes, bytearray)):',
    '        block = list(block)',
    '    w = [0] * 80',
    '    for i in range(16):',
    '        w[i] = int.from_bytes(bytes(block[i*8:(i+1)*8]), "big")',
    '    for i in range(16, 80):',
    '        s0 = rotr64(w[i-15], 1) ^ rotr64(w[i-15], 8) ^ (w[i-15] >> 7)',
    '        s1 = rotr64(w[i-2], 19) ^ rotr64(w[i-2], 61) ^ (w[i-2] >> 6)',
    '        w[i] = (w[i-16] + s0 + w[i-7] + s1) & M64',
    '    h = list(v)',
    '    for i in range(80):',
    '        s1 = rotr64(h[4], 14) ^ rotr64(h[4], 18) ^ rotr64(h[4], 41)',
    '        ch = ((h[4] & h[5]) ^ ((~h[4]) & M64) & h[6]) & M64',
    '        temp1 = (h[7] + s1 + ch + K[i] + w[i]) & M64',
    '        s0 = rotr64(h[0], 28) ^ rotr64(h[0], 34) ^ rotr64(h[0], 39)',
    '        maj = ((h[0] & h[1]) ^ (h[0] & h[2]) ^ (h[1] & h[2])) & M64',
    '        temp2 = (s0 + maj) & M64',
    '        h = [(temp1 + temp2) & M64, h[0], h[1], h[2], (h[3] + temp1) & M64, h[4], h[5], h[6]]',
    '    return [(h[i] + v[i]) & M64 for i in range(8)]',
    'def sha512_hash(msg, size_bits):',
    '    data = sha512_pad(msg)',
    '    if size_bits == 384:',
    '        iv = [0xcbbb9d5dc1059ed8,0x629a292a367cd507,0x9159015a3070dd17,0x152fecd8f70e5939,',
    '              0x67332667ffc00b31,0x8eb44a8768581511,0xdb0c2e0d64f98fa7,0x47b5481dbefa4fa4]',
    '    else:',
    '        iv = [0x6a09e667f3bcc908,0xbb67ae8584caa73b,0x3c6ef372fe94f82b,0xa54ff53a5f1d36f1,',
    '              0x510e527fade682d1,0x9b05688c2b3e6c1f,0x1f83d9abfb41bd6b,0x5be0cd19137e2179]',
    '    h = list(iv)',
    '    for off in range(0, len(data), 128):',
    '        h = sha512_compress(h, data[off:off+128])',
    '    return b"".join(x.to_bytes(8, "big") for x in h)[:size_bits // 8]',
  ]);
}

pythonGenerator.forBlock['hash_sha512_pad'] = function (
  block: Block,
): [string, number] {
  const input =
    pythonGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || "''";
  registerSha512();
  return ['sha512_pad(' + input + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['hash_sha512_compress'] = function (
  block: Block,
): [string, number] {
  const v = pythonGenerator.valueToCode(block, 'V', Order.ATOMIC) || '[]';
  const w = pythonGenerator.valueToCode(block, 'W', Order.ATOMIC) || '[]';
  registerSha512();
  return ['sha512_compress(' + v + ', ' + w + ')', Order.ATOMIC];
};

pythonGenerator.forBlock['hash_sha512_hash'] = function (
  block: Block,
): [string, number] {
  const msg =
    pythonGenerator.valueToCode(block, 'MSG', Order.ATOMIC) || "''";
  const size = block.getFieldValue('SIZE') || '512';
  registerSha512();
  return ['sha512_hash(' + msg + ', ' + size + ')', Order.ATOMIC];
};
