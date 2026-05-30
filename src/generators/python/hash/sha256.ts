import { pythonGenerator, Order } from 'blockly/python';
import type { Block } from 'blockly/core';

// SHA-256 填充
pythonGenerator.forBlock['hash_sha256_pad'] = function (block: Block): string {
  const left =
    pythonGenerator.valueToCode(block, 'LEFT', Order.ATOMIC) || 'm_padded';
  const right =
    pythonGenerator.valueToCode(block, 'RIGHT', Order.ATOMIC) || 'm';
  const code = `
_sha256_pad_src = ${right}
if isinstance(_sha256_pad_src, (bytes, bytearray)):
    _pad_tmp = bytearray(_sha256_pad_src)
elif isinstance(_sha256_pad_src, str):
    _pad_tmp = bytearray(_sha256_pad_src.encode('utf-8'))
elif isinstance(_sha256_pad_src, list):
    _pad_tmp = bytearray(_sha256_pad_src)
else:
    _pad_tmp = bytearray()
_l_bits = len(_pad_tmp) * 8
_pad_tmp.append(0x80)
_curr_bits = (len(_pad_tmp) * 8) % 512
if _curr_bits <= 448:
    _zero_bits = 448 - _curr_bits
else:
    _zero_bits = 512 - (_curr_bits - 448)
_pad_tmp.extend(b"\\x00" * (_zero_bits // 8))
_pad_tmp.extend((_l_bits).to_bytes(8, 'big'))
${left} = bytes(_pad_tmp)
`;
  return code;
};

pythonGenerator.forBlock['hash_sha256_pad_hex'] = function (
  block: Block,
): string {
  const left =
    pythonGenerator.valueToCode(block, 'LEFT', Order.ATOMIC) || 'm_padded';
  const right =
    pythonGenerator.valueToCode(block, 'RIGHT', Order.ATOMIC) || 'hexstr';
  const code = `
_pad_hex_tmp = bytearray(bytes.fromhex(${right}))
_l_bits = len(_pad_hex_tmp) * 8
_pad_hex_tmp.append(0x80)
_curr_bits = (len(_pad_hex_tmp) * 8) % 512
if _curr_bits <= 448:
    _zero_bits = 448 - _curr_bits
else:
    _zero_bits = 512 - (_curr_bits - 448)
_pad_hex_tmp.extend(b"\\x00" * (_zero_bits // 8))
_pad_hex_tmp.extend((_l_bits).to_bytes(8, 'big'))
${left} = bytes(_pad_hex_tmp)
`;
  return code;
};

// SHA-256 文本字符串填充
pythonGenerator.forBlock['hash_sha256_pad_text'] =
  pythonGenerator.forBlock['hash_sha256_pad'];

// SHA-256 压缩函数
pythonGenerator.forBlock['hash_sha256_compress'] = function (
  block: Block,
): string {
  const out = pythonGenerator.valueToCode(block, 'OUT', Order.ATOMIC) || 'y';
  const v = pythonGenerator.valueToCode(block, 'V', Order.ATOMIC) || 'V';
  const w = pythonGenerator.valueToCode(block, 'W', Order.ATOMIC) || 'W';
  const code = `
# SHA-256 压缩函数
def sha256_compress(v, w):
    K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
         0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
         0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
         0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
         0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
         0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
         0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
         0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]
    h = list(v)
    for i in range(64):
        s1 = (((h[4]>>6)|(h[4]<<26)) & 0xFFFFFFFF) ^ (((h[4]>>11)|(h[4]<<21)) & 0xFFFFFFFF) ^ (((h[4]>>25)|(h[4]<<7)) & 0xFFFFFFFF)
        ch = ((h[4]&h[5]) ^ ((~h[4] & 0xFFFFFFFF)&h[6])) & 0xFFFFFFFF
        temp1 = (h[7]+s1+ch+K[i]+w[i]) & 0xFFFFFFFF
        s0 = (((h[0]>>2)|(h[0]<<30)) & 0xFFFFFFFF) ^ (((h[0]>>13)|(h[0]<<19)) & 0xFFFFFFFF) ^ (((h[0]>>22)|(h[0]<<10)) & 0xFFFFFFFF)
        maj = ((h[0]&h[1]) ^ (h[0]&h[2]) ^ (h[1]&h[2])) & 0xFFFFFFFF
        temp2 = (s0+maj) & 0xFFFFFFFF
        h[7]=h[6];h[6]=h[5];h[5]=h[4];h[4]=(h[3]+temp1)&0xFFFFFFFF;h[3]=h[2];h[2]=h[1];h[1]=h[0];h[0]=(temp1+temp2)&0xFFFFFFFF
    return [(h[i]+v[i])&0xFFFFFFFF for i in range(8)]
${out} = sha256_compress(${v}, ${w})
`;
  return code;
};
